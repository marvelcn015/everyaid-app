'use client'

import { useState } from 'react'

interface Props {
  onGoLive: (title: string) => void
  isPending: boolean
}

export default function StreamControlPanel({ onGoLive, isPending }: Props) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGoLive(title.trim() || 'Untitled Stream')
  }

  return (
    <div className="panel mx-auto max-w-md p-6">
      <h2 className="text-lg font-extrabold">Start a Live Stream</h2>
      <p className="mt-1 text-sm text-white/60">Set a title and go live to start receiving tips.</p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
        <div>
          <label className="label">Stream Title</label>
          <input
            className="input mt-1"
            placeholder="What are you streaming today?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? 'Starting...' : 'Go Live'}
        </button>
      </form>
    </div>
  )
}
