import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const COLLECTION = 'tips'

// GET /api/tips?stream_id=<uuid>
export async function GET(request: NextRequest) {
  try {
    const streamId = request.nextUrl.searchParams.get('stream_id')
    if (!streamId) {
      return NextResponse.json({ error: 'stream_id parameter is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('collection', COLLECTION)
      .eq('data->>stream_id', streamId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const tips = (data || []).map((doc) => {
      const d = doc.data as Record<string, unknown>
      return { id: doc.id, ...d, created_at: doc.created_at } as Record<string, unknown>
    })

    // Aggregate total by token
    const totals: Record<string, number> = {}
    for (const tip of tips) {
      const token = String(tip.token ?? 'unknown')
      const amount = parseFloat(String(tip.amount ?? '0'))
      totals[token] = (totals[token] || 0) + amount
    }

    return NextResponse.json({ tips, totals, count: tips.length })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/tips  { stream_id, from_address, to_address, token, amount, memo?, tx_type?, clearnode_tx_id? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stream_id, from_address, to_address, token, amount, memo, tx_type, clearnode_tx_id } = body

    if (!stream_id || !from_address || !to_address || !token || !amount) {
      return NextResponse.json(
        { error: 'stream_id, from_address, to_address, token, and amount are required' },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('documents')
      .insert({
        id,
        collection: COLLECTION,
        data: {
          stream_id,
          from_address: from_address.toLowerCase(),
          to_address: to_address.toLowerCase(),
          token,
          amount,
          memo: memo || '',
          tx_type: tx_type || 'transfer',
          clearnode_tx_id: clearnode_tx_id || null,
        },
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      tip: { id: data.id, ...(data.data as Record<string, unknown>), created_at: data.created_at },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
