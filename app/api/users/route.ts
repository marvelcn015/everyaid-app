import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const COLLECTION = 'users'

// GET /api/users?wallet=0x...
export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet')
    if (!wallet) {
      return NextResponse.json({ error: 'wallet parameter is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('collection', COLLECTION)
      .eq('id', wallet.toLowerCase())
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ user: null })
    }
    if (error) throw error

    return NextResponse.json({
      user: { wallet_address: data.id, ...data.data, created_at: data.created_at, updated_at: data.updated_at },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/users  { wallet_address, display_name, avatar_url? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, display_name, avatar_url } = body

    if (!wallet_address || !display_name) {
      return NextResponse.json({ error: 'wallet_address and display_name are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('documents')
      .upsert(
        {
          id: wallet_address.toLowerCase(),
          collection: COLLECTION,
          data: { display_name, avatar_url: avatar_url || null },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'collection,id' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      user: { wallet_address: data.id, ...data.data, created_at: data.created_at, updated_at: data.updated_at },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
