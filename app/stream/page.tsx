'use client'

import { useMemo } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useSearchParams } from 'next/navigation'
import TipPanel from '@/components/TipPanelV2'
import LiveStream from '@/components/LiveStream'
import { useNitrolite } from '@/lib/nitrolite/useNitrolite'
import { useWebRTCViewer } from '@/hooks/useWebRTCViewer'
import useStreamInfo from '@/hooks/useStreamerInfo'
import { Suspense } from 'react'

function StreamPageContent() {
  const nitro = useNitrolite()
  const searchParams = useSearchParams()

  const streamId = useMemo(() => {
    return searchParams.get('stream_id') ?? null
  }, [searchParams])

  const { data: streamInfo } = useStreamInfo({ streamId: streamId ?? '' })
  const { videoRef, connectionState, isMuted, unmute } = useWebRTCViewer(streamId)

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
          <LiveStream
            videoRef={videoRef}
            connectionState={connectionState}
            streamTitle={streamInfo?.title}
            streamerName={streamInfo?.streamer?.name}
            isMuted={isMuted}
            onUnmute={unmute}
          />
        </div>

        <div className="lg:col-span-5">
          <Suspense fallback={(
            <div className="panel p-4">
              <div className="text-sm font-extrabold">Tipping</div>
              <div className="mt-2 text-xs text-white/60">Loading...</div>
            </div>
          )}>
            <TipPanel />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

export default function StreamPage() {
  return (
    <Suspense>
      <StreamPageContent />
    </Suspense>
  )
}
