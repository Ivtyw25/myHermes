import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.password) return null

        const hash = process.env.HERMES_PASSWORD_HASH
        if (!hash) {
          console.error('[auth] HERMES_PASSWORD_HASH is not set')
          return null
        }

        const match = await bcrypt.compare(credentials.password, hash)
        if (!match) return null

        return { id: '1', name: 'owner' }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60, // 1 hour
  },
  pages: {
    signIn: '/login',
  },
}
