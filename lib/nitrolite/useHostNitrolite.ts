'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import type { PublicClient, WalletClient } from 'viem'

import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createEIP712AuthMessageSigner,
  parseAuthChallengeResponse,
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
  const challengeRawRef = useRef<string | null>(null)

  const [status, setStatus] = useState<NitroliteStatus>('idle')
  const [lastError, setLastError] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<unknown>(null)
  const [sessionKey, setSessionKey] = useState<`0x${string}` | null>(null)
  const [tips, setTips] = useState<RPCTransaction[]>([])
  const [authParams, setAuthParams] = useState<{
    session_key: `0x${string}`
    allowances: Array<{ asset: string; amount: string }>
    expires_at: bigint
    scope: string
  } | null>(null)

  const canWork = Boolean(isConnected && address && walletClient && publicClient)

  const nitroliteDeps = useMemo(() => {
    if (!walletClient || !publicClient) return null
    return {
      publicClient: publicClient as PublicClient,
      walletClient: walletClient as WalletClient,
      stateSigner: new WalletStateSigner(walletClient as any),
      addresses: { custody: CUSTODY_CONTRACT, adjudicator: ADJUDICATOR_CONTRACT },
      chainId: CHAIN_ID,
    }
  }, [walletClient, publicClient])

  const setOnTipReceived = useCallback((cb: TipReceivedCallback) => {
    onTipReceivedRef.current = cb
  }, [])

  const handleMessage = useCallback((raw: string) => {
    let parsed: RPCResponse
    try {
      parsed = parseAnyRPCResponse(raw)
    } catch {
      return
    }

    console.log('Host RPC:', parsed.method, parsed.params)

    switch (parsed.method) {
      case RPCMethod.AuthChallenge: {
        challengeRawRef.current = raw
        setChallenge(parsed.params)
        setStatus('auth_challenged')
        break
      }

      case RPCMethod.AuthVerify: {
        if ((parsed.params as any).success) {
          setStatus('auth_verified')
        } else {
          setStatus('error')
          setLastError('Auth verification failed')
        }
        break
      }

      case RPCMethod.TransferNotification: {
        const txs = (parsed.params as any).transactions
        if (txs && txs.length > 0) {
          setTips((prev) => [...txs, ...prev])
          onTipReceivedRef.current?.(txs)
        }
        break
      }

      case RPCMethod.Error: {
        console.error('Host RPC Error:', (parsed.params as any)?.error)
        setLastError((parsed.params as any)?.error)
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
    setAuthParams(null)
    setLastError(null)
  }, [])

  // 1) Request auth — properly await and include all required params
  const requestAuth = useCallback(async () => {
    if (!canWork || !address || !walletClient) throw new Error('Wallet not ready')
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) throw new Error('WS not connected')

    const sk = address as `0x${string}`
    setSessionKey(sk)

    const params = {
      address: address as `0x${string}`,
      session_key: sk,
      application: 'tipping-live-app',
      allowances: [{ asset: 'ytest.usd', amount: '1000' }],
      expires_at: BigInt(Math.floor(Date.now() / 1000) + 86400),
      scope: 'console',
    }

    setAuthParams({
      session_key: sk,
      allowances: params.allowances,
      expires_at: params.expires_at,
      scope: params.scope,
    })

    const msg = await createAuthRequestMessage(params)

    setStatus('auth_requested')
    wsRef.current.send(msg)
  }, [address, canWork, walletClient])

  // 2) Verify auth — use SDK's EIP712 signer + parseAuthChallengeResponse
  const verifyAuth = useCallback(async () => {
    if (!canWork || !address || !walletClient || !nitroliteDeps) throw new Error('Wallet not ready')
    if (!challengeRawRef.current || !authParams) throw new Error('No challenge or auth params')

    const challengeResponse = parseAuthChallengeResponse(challengeRawRef.current)

    const signer = createEIP712AuthMessageSigner(
      walletClient as any,
      authParams,
      { name: 'tipping-live-app' },
    )

    const verifyMsg = await createAuthVerifyMessage(signer, challengeResponse)

    wsRef.current!.send(verifyMsg)
  }, [address, canWork, nitroliteDeps, authParams, walletClient])

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
