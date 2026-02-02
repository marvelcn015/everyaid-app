"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import TipPanel from "@/components/TipPanel";
import LiveStream from "@/components/LiveStream";
import { useNitrolite } from "@/lib/nitrolite/useNitrolite";

export default function Page() {
  const nitro = useNitrolite();

  return (
    <main className="mx-auto grid max-w-6xl gap-4 p-6">
      <div className="panel flex items-center justify-between p-4">
        <div className="grid gap-1">
          <div className="text-xs tracking-widest text-white/60">LIVE TIPPING MVP</div>
          <h1 className="text-lg font-extrabold">Yellow Nitrolite + wagmi</h1>
        </div>
        <ConnectButton />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <LiveStream status={nitro.status} />
        </div>

        <div className="lg:col-span-5">
          <TipPanel
            canWork={nitro.canWork}
            status={nitro.status}
            lastError={nitro.lastError}
            connectWs={nitro.connectWs}
            disconnectWs={nitro.disconnectWs}
            requestAuth={nitro.requestAuth}
            verifyAuth={nitro.verifyAuth}
            sendTip={nitro.sendTip}
          />
        </div>
      </div>
    </main>
  );
}
