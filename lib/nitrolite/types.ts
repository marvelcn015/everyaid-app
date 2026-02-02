export type NitroliteStatus =
  | 'idle'
  | 'ws_connecting'
  | 'ws_connected'
  | 'auth_requested'
  | 'auth_challenged'
  | 'auth_verified'
  | 'error';

export type WsInbound =
  | { method: 'auth_challenge'; params: unknown }
  | { method: string; params?: unknown };

export type WsOutbound = {
  method: string;
  params?: unknown;
};
