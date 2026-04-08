import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { locationId, createdBy } = await req.json()
    if (!locationId) {
      return NextResponse.json({ error: 'locationId required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Check for existing unexpired link
    const { data: existing } = await supabase
      .from('invite_links')
      .select('code')
      .eq('location_id', locationId)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle()

    if (existing?.code) {
      return NextResponse.json({ code: existing.code })
    }

    // Create new link
    const code = Math.random().toString(36).substring(2, 10)
    const { error } = await supabase.from('invite_links').insert({
      id: `inv-${Date.now()}`,
      location_id: locationId,
      code,
      created_by: createdBy ?? null,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    if (error) {
      console.error('Invite insert error:', error)
      return NextResponse.json({ error: `Failed to create invite: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ code })
  } catch (error) {
    console.error('Invite API error:', error)
    return NextResponse.json({ error: 'Failed to create invite link' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')
    if (!code) {
      return NextResponse.json({ error: 'code required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('invite_links')
      .select('location_id')
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (error) {
      console.error('Invite lookup error:', error)
      return NextResponse.json({ error: 'Failed to look up invite' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Invalid or expired invite code' }, { status: 404 })
    }

    // Get location name
    const { data: loc } = await supabase
      .from('locations')
      .select('name')
      .eq('id', data.location_id)
      .maybeSingle()

    return NextResponse.json({
      locationId: data.location_id,
      locationName: loc?.name ?? 'Unknown Location',
    })
  } catch (error) {
    console.error('Invite API error:', error)
    return NextResponse.json({ error: 'Failed to validate invite code' }, { status: 500 })
  }
}
