'use client'

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
}

function truncateAddress(addr: string) {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function TipFeed({ tips }: Props) {
  if (tips.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-white/40">
        No tips yet. Share your viewer link to start receiving tips!
      </div>
    )
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      <div className="grid gap-2">
        {tips.map((tip) => {
          const from = tip.from_address || tip.fromAccount || 'unknown'
          const tokenLabel = tip.token || tip.asset || ''
          const time = tip.created_at || tip.createdAt
          return (
            <div key={tip.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white/90">
                  {tip.amount} <span className="text-white/60">{tokenLabel}</span>
                </div>
                <div className="text-xs text-white/40">
                  from {truncateAddress(from)}
                  {tip.memo && <span className="ml-2 text-white/50">&ldquo;{tip.memo}&rdquo;</span>}
                </div>
              </div>
              {time && (
                <div className="text-xs text-white/30">
                  {new Date(time).toLocaleTimeString()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
