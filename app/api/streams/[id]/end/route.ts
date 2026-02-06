import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/streams/[id]/end  { streamer_wallet }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { streamer_wallet } = body

    if (!streamer_wallet) {
      return NextResponse.json({ error: 'streamer_wallet is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch current stream
    const { data: existing, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('collection', 'streams')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    const streamData = existing.data as Record<string, unknown>

    // Verify ownership
    if (streamData.streamer_wallet !== streamer_wallet.toLowerCase()) {
      return NextResponse.json({ error: 'Not the stream owner' }, { status: 403 })
    }

    if (streamData.status === 'ended') {
      return NextResponse.json({ error: 'Stream already ended' }, { status: 400 })
    }

    // Update status to ended
    const { data, error } = await supabase
      .from('documents')
      .update({
        data: { ...streamData, status: 'ended', ended_at: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      })
      .eq('collection', 'streams')
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      stream: { id: data.id, ...(data.data as Record<string, unknown>), created_at: data.created_at },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
