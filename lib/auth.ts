import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { data: store, error } = await supabaseAdmin
          .from('stores')
          .select('*')
          .eq('admin_email', credentials.email)
          .single()

        if (error || !store) return null

        const passwordValid = await bcrypt.compare(
          credentials.password,
          store.password_hash
        )

        if (!passwordValid) return null

        return {
          id: store.id,
          email: store.admin_email,
          name: store.admin_name,
          storeSlug: store.slug,
          storeName: store.store_name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.storeSlug = (user as any).storeSlug
        token.storeName = (user as any).storeName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).storeSlug = token.storeSlug
        ;(session.user as any).storeName = token.storeName
        ;(session.user as any).id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}
