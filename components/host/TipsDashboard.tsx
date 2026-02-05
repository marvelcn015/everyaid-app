'use client'

import TipFeed from './TipFeed'

interface TipItem {
  id: string
  from_address?: string
  fromAccount?: string
  amount: string
  token?: string
  asset?: string
  memo?: string
  created_at?: string
  createdAt?: string
}

interface Props {
  tips: TipItem[]
  totals: Record<string, number>
  count: number
}

export default function TipsDashboard({ tips, totals, count }: Props) {
  const totalDisplay = Object.entries(totals)
    .map(([token, amount]) => `${amount} ${token}`)
    .join(', ') || '0'

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-white/10 p-4">
        <div className="text-sm font-extrabold">Tips Received</div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-b border-white/10 p-4">
        <div>
          <div className="label">Total</div>
          <div className="mt-1 text-xl font-extrabold">{totalDisplay}</div>
        </div>
        <div>
          <div className="label">Count</div>
          <div className="mt-1 text-xl font-extrabold">{count}</div>
        </div>
      </div>

      <div className="p-4">
        <button className="btn-primary w-full" disabled>
          Claim Tips (Coming Soon)
        </button>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="label mb-2">Recent Tips</div>
        <TipFeed tips={tips} />
      </div>
    </div>
  )
}
