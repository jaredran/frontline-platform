import { NextRequest, NextResponse } from 'next/server'
import { createInviteLink, getInviteLink } from '@/lib/data/store'

export async function POST(req: NextRequest) {
  try {
    const { locationId, createdBy } = await req.json()
    if (!locationId) {
      return NextResponse.json({ error: 'locationId required' }, { status: 400 })
    }
    const { code } = await createInviteLink(locationId, createdBy)
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
    const result = await getInviteLink(code)
    if (!result) {
      return NextResponse.json({ error: 'Invalid or expired invite code' }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Invite API error:', error)
    return NextResponse.json({ error: 'Failed to validate invite code' }, { status: 500 })
  }
}
