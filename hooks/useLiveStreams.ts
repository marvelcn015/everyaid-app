'use client'

import { useQuery } from '@tanstack/react-query'

interface Stream {
  id: string
  streamer_wallet: string
  title: string
  status: 'live'
  started_at: string
  ended_at: null
  created_at: string
}

interface Streamer {
  wallet_address: string
  display_name: string
  avatar_url?: string | null
}

export interface LiveStreamItem {
  stream: Stream
  streamer: Streamer
}

export function useLiveStreams() {
  return useQuery<LiveStreamItem[]>({
    queryKey: ['liveStreams'],
    queryFn: async () => {
      const res = await fetch('/api/streams?status=live')
      if (!res.ok) throw new Error('Failed to fetch live streams')
      const json = await res.json()
      return json.streams ?? []
    },
    refetchInterval: 15_000,
  })
}
