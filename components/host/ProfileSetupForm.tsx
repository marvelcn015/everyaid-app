'use client'

import { useState } from 'react'
import { useUpsertUserProfile } from '@/hooks/useUserProfile'

interface Props {
  wallet: string
  onSaved: () => void
}

export default function ProfileSetupForm({ wallet, onSaved }: Props) {
  const [displayName, setDisplayName] = useState('')
  const upsert = useUpsertUserProfile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) return
    await upsert.mutateAsync({ wallet_address: wallet, display_name: displayName.trim() })
    onSaved()
  }

  return (
    <div className="panel mx-auto max-w-md p-6">
      <h2 className="text-lg font-extrabold">Set Up Your Profile</h2>
      <p className="mt-1 text-sm text-white/60">Choose a display name before going live.</p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
        <div>
          <label className="label">Display Name</label>
          <input
            className="input mt-1"
            placeholder="Your streamer name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={!displayName.trim() || upsert.isPending}
        >
          {upsert.isPending ? 'Saving...' : 'Save Profile'}
        </button>

        {upsert.isError && (
          <p className="text-xs text-red-400">Failed to save profile. Please try again.</p>
        )}
      </form>
    </div>
  )
}
