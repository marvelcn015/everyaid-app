// @ts-nocheck
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import type { PublicClient, WalletClient } from 'viem'

import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  WalletStateSigner,
  parseAnyRPCResponse,
  RPCMethod,
  type RPCTransaction,
  type RPCResponse,
} from '@erc7824/nitrolite'

import { ADJUDICATOR_CONTRACT, CHAIN_ID, CLEARNODE_WS, CUSTODY_CONTRACT } from './config'
import type { NitroliteStatus } from './types'

type TipReceivedCallback = (transactions: RPCTransaction[]) => void

export function useHostNitrolite() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const wsRef = useRef<WebSocket | null>(null)
  const onTipReceivedRef = useRef<TipReceivedCallback | null>(null)

  const [status, setStatus] = useState<NitroliteStatus>('idle')
  const [lastError, setLastError] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<unknown>(null)
  const [sessionKey, setSessionKey] = useState<`0x${string}` | null>(null)
  const [tips, setTips] = useState<RPCTransaction[]>([])

  const canWork = Boolean(isConnected && address && walletClient && publicClient)

  const nitroliteDeps = useMemo(() => {
    if (!walletClient || !publicClient) return null
    return {
      publicClient: publicClient as PublicClient,
      walletClient: walletClient as WalletClient,
      stateSigner: new WalletStateSigner(walletClient as WalletClient),
      addresses: { custody: CUSTODY_CONTRACT, adjudicator: ADJUDICATOR_CONTRACT },
      chainId: CHAIN_ID,
    }
  }, [walletClient, publicClient])

  const send = useCallback((msg: unknown) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) throw new Error('WebSocket is not open')
    ws.send(JSON.stringify(msg))
  }, [])

  const setOnTipReceived = useCallback((cb: TipReceivedCallback) => {
    onTipReceivedRef.current = cb
  }, [])

  const handleMessage = useCallback((raw: string) => {
    let parsed: RPCResponse
    try {
      parsed = parseAnyRPCResponse(raw)
    } catch {
      // Not a valid RPC response, ignore
      return
    }

    switch (parsed.method) {
      case RPCMethod.AuthChallenge: {
        setChallenge(parsed.params)
        setStatus('auth_challenged')
        break
      }

      case RPCMethod.AuthVerify: {
        if (parsed.params.success) {
          setStatus('auth_verified')
        } else {
          setStatus('error')
          setLastError('Auth verification failed')
        }
        break
      }

      case RPCMethod.TransferNotification: {
        const txs = parsed.params.transactions
        if (txs.length > 0) {
          setTips((prev) => [...txs, ...prev])
          onTipReceivedRef.current?.(txs)
        }
        break
      }

      case RPCMethod.Error: {
        setLastError(parsed.params.error)
        break
      }

      default:
        break
    }
  }, [])

  const connectWs = useCallback(() => {
    if (!canWork) throw new Error('Wallet not ready')
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return

    setStatus('ws_connecting')
    setLastError(null)

    const ws = new WebSocket(CLEARNODE_WS)
    wsRef.current = ws

    ws.onopen = () => setStatus('ws_connected')

    ws.onerror = () => {
      setStatus('error')
      setLastError('WebSocket error')
    }

    ws.onclose = () => {
      wsRef.current = null
      setStatus('idle')
    }

    ws.onmessage = (evt) => handleMessage(String(evt.data))
  }, [canWork, handleMessage])

  const disconnectWs = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setStatus('idle')
    setChallenge(null)
    setSessionKey(null)
    setLastError(null)
  }, [])

  // 1) Request auth
  const requestAuth = useCallback(async () => {
    if (!canWork || !address || !walletClient) throw new Error('Wallet not ready')
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) throw new Error('WS not connected')

    const sk = address as `0x${string}`
    setSessionKey(sk)

    const msg = createAuthRequestMessage({
      address,
      session_key: sk,
    })

    setStatus('auth_requested')
    send(msg)
  }, [address, canWork, send, walletClient])

  // 2) Verify auth (EIP-712 sign challenge)
  const verifyAuth = useCallback(async () => {
    if (!canWork || !address || !walletClient || !nitroliteDeps) throw new Error('Wallet not ready')
    if (!challenge) throw new Error('No challenge')

    const typedData = challenge as any

    const signature = await walletClient.signTypedData({
      account: walletClient.account!,
      domain: typedData.domain,
      types: typedData.types,
      primaryType: typedData.primaryType,
      message: typedData.message,
    })

    const verifyMsg = createAuthVerifyMessage({
      wallet: address,
      signature,
    })

    send(verifyMsg)
    // Status will be updated when auth_verify response arrives
  }, [address, canWork, challenge, nitroliteDeps, send, walletClient])

  // Cleanup on unmount
  useEffect(() => {
    return () => disconnectWs()
  }, [disconnectWs])

  return {
    canWork,
    status,
    lastError,
    sessionKey,
    challenge,
    tips,

    connectWs,
    disconnectWs,
    requestAuth,
    verifyAuth,
    setOnTipReceived,
  }
}
