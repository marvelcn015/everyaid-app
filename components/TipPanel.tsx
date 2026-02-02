"use client";

import { useMemo, useState } from "react";
import { DEFAULT_STREAMER_ADDRESS, DEFAULT_STREAM_ID } from "@/lib/nitrolite/config";
import type { NitroliteStatus } from "@/lib/nitrolite/types";

function Badge({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "danger" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : tone === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : "border-white/10 bg-white/5 text-white/80";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${toneClass}`}>
      <span className="text-white/60">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60";

  const styles =
    variant === "primary"
      ? "text-white bg-violet-600 hover:bg-violet-700 border border-white/10"
      : variant === "danger"
      ? "text-red-200 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30"
      : "text-white/90 bg-white/5 hover:bg-white/10 border border-white/10";

  return (
    <button className={`${base} ${styles}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <div className="text-xs text-white/60">{label}</div>
      <input
        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:ring-2 focus:ring-violet-500/40"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function TipPanel({
  canWork,
  status,
  lastError,
  connectWs,
  disconnectWs,
  requestAuth,
  verifyAuth,
  sendTip,
}: {
  canWork: boolean;
  status: NitroliteStatus;
  lastError: string | null;
  connectWs: () => void;
  disconnectWs: () => void;
  requestAuth: () => Promise<void>;
  verifyAuth: () => Promise<void>;
  sendTip: (params: {
    streamId: string;
    streamer: `0x${string}`;
    token: `0x${string}`;
    amount: string;
    memo?: string;
  }) => Promise<void>;
}) {
  const [streamId, setStreamId] = useState(DEFAULT_STREAM_ID);
  const [streamer, setStreamer] = useState<string>(DEFAULT_STREAMER_ADDRESS);
  const [token, setToken] = useState<string>("0x0000000000000000000000000000000000000000");
  const [amount, setAmount] = useState("1");
  const [memo, setMemo] = useState("Nice stream!");

  const canSendTip = useMemo(() => status === "auth_verified", [status]);

  const statusTone =
    status === "auth_verified" ? "success" : status === "error" ? "danger" : "neutral";

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-2">
          <div className="text-sm font-extrabold">Tipping</div>
          <div className="flex flex-wrap gap-2">
            <Badge label="Status" value={status} tone={statusTone} />
            {lastError ? <Badge label="Error" value={lastError} tone="danger" /> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" disabled={!canWork} onClick={connectWs}>
            Connect WS
          </Button>
          <Button variant="danger" onClick={disconnectWs}>
            Disconnect
          </Button>
          <Button disabled={status !== "ws_connected"} onClick={() => void requestAuth()}>
            Request Auth
          </Button>
          <Button disabled={status !== "auth_challenged"} onClick={() => void verifyAuth()}>
            Verify Auth
          </Button>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      <div className="grid gap-4 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Stream ID" value={streamId} onChange={setStreamId} placeholder="demo-stream-001" />
          <Field label="Amount" value={amount} onChange={setAmount} placeholder="1" />
        </div>

        <Field label="Streamer Address" value={streamer} onChange={setStreamer} placeholder="0x..." />

        <Field label="Token Address" value={token} onChange={setToken} placeholder="0x... (ERC20) or 0x0 for native" />

        <Field label="Memo" value={memo} onChange={setMemo} placeholder="Nice stream!" />

        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div className="text-xs text-white/60">Tip sending is enabled after successful auth verification.</div>

          <Button
            disabled={!canSendTip}
            onClick={() =>
              void sendTip({
                streamId,
                streamer: streamer as `0x${string}`,
                token: token as `0x${string}`,
                amount,
                memo,
              })
            }
          >
            Send Tip
          </Button>
        </div>
      </div>
    </div>
  );
}
