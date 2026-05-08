import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// POST /api/stores — create a new store from the onboarding form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { adminName, adminEmail, password, storeName, slug, location, phone, storeType } = body

    // Basic validation
    if (!adminName || !adminEmail || !password || !storeName || !slug || !location || !phone || !storeType) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
    }

    // Check slug not taken
    const { data: existing } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'This store handle is already taken' }, { status: 409 })
    }

    // Check email not already registered
    const { data: existingEmail } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('admin_email', adminEmail)
      .maybeSingle()

    if (existingEmail) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Insert store
    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .insert({
        admin_name: adminName,
        admin_email: adminEmail,
        password_hash: passwordHash,
        store_name: storeName,
        slug,
        location,
        phone,
        store_type: storeType,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create store' }, { status: 500 })
    }

    return NextResponse.json({ success: true, slug: store.slug, storeName: store.store_name })
  } catch (err) {
    console.error('Store creation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/stores — get current user's store (requires auth)
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: store, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('admin_email', session.user.email!)
    .single()

  if (error || !store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  // Never return the password hash
  const { password_hash, ...safeStore } = store

  return NextResponse.json({ store: safeStore })
}
