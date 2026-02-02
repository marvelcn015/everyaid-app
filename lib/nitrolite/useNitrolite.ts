// @ts-nocheck
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import type { PublicClient, WalletClient } from 'viem';

// nitrolite sdk
import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  // createCreateChannelMessage,  // 你要做 channel 再打開
  // createResizeChannelMessage,
  // NitroliteClient,
  WalletStateSigner,
} from '@erc7824/nitrolite';

import { ADJUDICATOR_CONTRACT, CHAIN_ID, CLEARNODE_WS, CUSTODY_CONTRACT } from './config';
import type { NitroliteStatus, WsInbound, WsOutbound } from './types';

function safeJsonParse(data: string): any {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function useNitrolite() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const wsRef = useRef<WebSocket | null>(null);

  const [status, setStatus] = useState<NitroliteStatus>('idle');
  const [lastError, setLastError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [sessionKey, setSessionKey] = useState<`0x${string}` | null>(null);

  const canWork = Boolean(isConnected && address && walletClient && publicClient);

  const nitroliteDeps = useMemo(() => {
    if (!walletClient || !publicClient) return null;
    return {
      publicClient: publicClient as PublicClient,
      walletClient: walletClient as WalletClient,
      stateSigner: new WalletStateSigner(walletClient as WalletClient),
      addresses: { custody: CUSTODY_CONTRACT, adjudicator: ADJUDICATOR_CONTRACT },
      chainId: CHAIN_ID,
    };
  }, [walletClient, publicClient]);

  const send = useCallback((msg: WsOutbound) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) throw new Error('WebSocket is not open');
    ws.send(JSON.stringify(msg));
  }, []);

  const connectWs = useCallback(() => {
    if (!canWork) throw new Error('Wallet not ready');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    setStatus('ws_connecting');
    setLastError(null);

    const ws = new WebSocket(CLEARNODE_WS);
    wsRef.current = ws;

    ws.onopen = () => setStatus('ws_connected');

    ws.onerror = () => {
      setStatus('error');
      setLastError('WebSocket error');
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus('idle');
    };

    ws.onmessage = (evt) => {
      const parsed = safeJsonParse(String(evt.data)) as WsInbound | null;
      if (!parsed) return;

      if (parsed.method === 'auth_challenge') {
        setChallenge(parsed.params);
        setStatus('auth_challenged');
      }
    };
  }, [canWork]);

  const disconnectWs = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setStatus('idle');
    setChallenge(null);
    setSessionKey(null);
    setLastError(null);
  }, []);

  // 1) Request auth (createAuthRequestMessage)
  const requestAuth = useCallback(async () => {
    if (!canWork || !address || !walletClient) throw new Error('Wallet not ready');
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) throw new Error('WS not connected');

    // 產生一次性的 session key（只放 memory）
    // 這裡用 walletClient.account 做示範；實務上你可以產生獨立私鑰（更安全）
    // 先用簡化版：直接用 address 當 sessionKey placeholder（你之後改成真正 session key）
    const sk = address as `0x${string}`;
    setSessionKey(sk);

    const msg = createAuthRequestMessage({
      address,
      session_key: sk as `0x${string}`
    });

    setStatus('auth_requested');
    send(msg as any);
  }, [address, canWork, send, walletClient]);

  // 2) Verify auth (EIP-712 sign challenge)
  const verifyAuth = useCallback(async () => {
    if (!canWork || !address || !walletClient || !nitroliteDeps) throw new Error('Wallet not ready');
    if (!challenge) throw new Error('No challenge');

    // 依 quickstart：對 challenge 做 EIP-712 簽名
    // 這段在不同 SDK 版本可能是 challenge.message / typedData 之類
    // 我們做「最大兼容」：假設 challenge 直接就是 typedData
    const typedData = challenge as any;

    const signature = await walletClient.signTypedData({
      account: walletClient.account!,
      domain: typedData.domain,
      types: typedData.types,
      primaryType: typedData.primaryType,
      message: typedData.message,
    });

    const verifyMsg = createAuthVerifyMessage({
      wallet: address,
      signature,
    });

    send(verifyMsg as any);
    setStatus('auth_verified'); // 這裡先當作送出 verify；你也可以等後端回覆 "auth_ok" 再切狀態
  }, [address, canWork, challenge, nitroliteDeps, send, walletClient]);

  // 3) Send tip (先做示範 payload)
  const sendTip = useCallback(async (params: {
    streamId: string;
    streamer: `0x${string}`;
    token: `0x${string}`; // ERC20 address or pseudo for native
    amount: string; // decimal string (你可換成 bigint/wei)
    memo?: string;
  }) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) throw new Error('WS not connected');
    if (!address) throw new Error('No wallet');

    // 先用自訂 method：你之後替換成 nitrolite 的 transfer/payment message builder
    const msg: WsOutbound = {
      method: 'tip_request',
      params: {
        from: address,
        to: params.streamer,
        streamId: params.streamId,
        token: params.token,
        amount: params.amount,
        memo: params.memo || '',
        ts: Date.now(),
      },
    };

    send(msg);
  }, [address, send]);

  // 自動清理
  useEffect(() => {
    return () => disconnectWs();
  }, [disconnectWs]);

  return {
    canWork,
    status,
    lastError,
    sessionKey,
    challenge,

    connectWs,
    disconnectWs,
    requestAuth,
    verifyAuth,

    sendTip,
  };
}
