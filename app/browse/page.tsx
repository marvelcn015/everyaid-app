'use client'

import { useLiveStreams } from '@/hooks/useLiveStreams'
import StreamCard from '@/components/StreamCard'
import PageHeader from '@/components/PageHeader'

const DEMO_STREAMS = [
  {
    id: 'demo-1',
    title: 'Emergency Relief Update — Eastern Region',
    streamerName: 'Vitalik',
    streamerAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    minutesAgo: 42,
    thumbnailUrl: 'https://images.unsplash.com/photo-1594841343391-97ac1b9a950e?w=640&h=360&fit=crop&crop=entropy',
  },
  {
    id: 'demo-2',
    title: 'Shelter Supply Distribution — Day 3',
    streamerName: 'Brantly',
    streamerAddress: '0x983110309620d911731ac0932219af06091b6744',
    minutesAgo: 15,
    thumbnailUrl: 'https://images.unsplash.com/photo-1685119166946-d4050647b0e3?w=640&h=360&fit=crop&crop=entropy',
  },
  {
    id: 'demo-3',
    title: 'Field Report — Clean Water Access',
    streamerName: 'Nick',
    streamerAddress: '0x5555763613a12d8f3e73be831dff8598089d3dca',
    minutesAgo: 5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1747330665949-d35f7c3ca6ad?w=640&h=360&fit=crop&crop=entropy',
  },
  {
    id: 'demo-4',
    title: 'Medical Camp Setup — Southern District',
    streamerName: 'Elena',
    streamerAddress: '0xab5801a7d398351b8be11c439e05c5b3259aec9b',
    minutesAgo: 120,
    thumbnailUrl: 'https://images.unsplash.com/photo-1626303410150-44b5c9b065a5?w=640&h=360&fit=crop&crop=entropy',
  },
  {
    id: 'demo-5',
    title: 'Food Distribution Live — Central Hub',
    streamerName: 'Marco',
    streamerAddress: '0x1db3439a222c519ab44bb1144fc28167b4fa6ee6',
    minutesAgo: 8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1755599629285-91cc09a185c7?w=640&h=360&fit=crop&crop=entropy',
  },
  {
    id: 'demo-6',
    title: 'Bridge Repair Progress — River Crossing',
    streamerName: 'Aisha',
    streamerAddress: '0x2b888954421b424c5d3d9ce9bb67c9bd47537d12',
    minutesAgo: 55,
    thumbnailUrl: 'https://images.unsplash.com/photo-1759849556089-b5789046530b?w=640&h=360&fit=crop&crop=entropy',
  },
] as const

export default function BrowsePage() {
  const { data: streams, isLoading, error } = useLiveStreams()

  const hasLiveStreams = streams && streams.length > 0

  return (
    <main className="mx-auto grid max-w-6xl gap-8 p-6">
      {/* Header */}
      <PageHeader eyebrow="EveryAid - BROWSE" title="Live Broadcasts" />

      {/* Live streams section */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-text">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Now
        </h2>
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-panel shadow-panel backdrop-blur p-8 text-center">
            <div className="text-sm text-muted">Loading broadcasts...</div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-panel shadow-panel backdrop-blur p-8 text-center">
            <div className="text-sm text-brand-coral">Failed to load broadcasts</div>
          </div>
        ) : hasLiveStreams ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {streams.map((item) => (
              <StreamCard
                key={item.stream.id}
                id={item.stream.id}
                title={item.stream.title}
                streamerName={item.streamer.display_name}
                streamerAddress={item.streamer.wallet_address}
                streamerAvatar={item.streamer.avatar_url}
                startedAt={item.stream.started_at}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-panel shadow-panel backdrop-blur p-8 text-center">
            <h2 className="text-lg font-extrabold text-text">No Live Broadcasts</h2>
            <p className="mt-2 text-sm text-muted">
              No one is broadcasting right now. Check back soon for live updates from the field.
            </p>
          </div>
        )}
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Demo broadcasts — always visible */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-text">
          Featured Broadcasts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_STREAMS.map((demo) => (
            <StreamCard
              key={demo.id}
              id={demo.id}
              title={demo.title}
              streamerName={demo.streamerName}
              streamerAddress={demo.streamerAddress}
              startedAt={new Date(Date.now() - demo.minutesAgo * 60_000).toISOString()}
              thumbnailUrl={demo.thumbnailUrl}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
