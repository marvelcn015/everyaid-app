export const CLEARNODE_WS = process.env.NEXT_PUBLIC_CLEARNODE_WS!;
export const DEFAULT_STREAM_ID = process.env.NEXT_PUBLIC_STREAM_ID || 'demo-stream-001';
export const DEFAULT_STREAMER_ADDRESS =
  (process.env.NEXT_PUBLIC_STREAMER_ADDRESS as `0x${string}`) ||
  ('0x0000000000000000000000000000000000000000' as const);

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1);

export const CUSTODY_CONTRACT =
  (process.env.NEXT_PUBLIC_CUSTODY_CONTRACT as `0x${string}`) ||
  ('0x0000000000000000000000000000000000000000' as const);

export const ADJUDICATOR_CONTRACT =
  (process.env.NEXT_PUBLIC_ADJUDICATOR_CONTRACT as `0x${string}`) ||
  ('0x0000000000000000000000000000000000000000' as const);
