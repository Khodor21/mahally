import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')

  if (!slug || slug.length < 2) {
    return NextResponse.json({ available: false, error: 'Slug too short' }, { status: 400 })
  }

  // Only allow letters, numbers, hyphens
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ available: false, error: 'Invalid characters' }, { status: 400 })
  }

  const reserved = ['www', 'app', 'api', 'admin', 'dashboard', 'login', 'store', 'support', 'help']
  if (reserved.includes(slug)) {
    return NextResponse.json({ available: false, error: 'Reserved slug' })
  }

  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ available: false, error: 'DB error' }, { status: 500 })
  }

  return NextResponse.json({ available: !data })
}
