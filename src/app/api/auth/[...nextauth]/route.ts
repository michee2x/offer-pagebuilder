import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createAdminClient } from "@/utils/supabase/admin"
import { compare } from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Using createAdminClient because we need to query users without
        // having a session context yet (since they are trying to login)
        const supabase = createAdminClient()

        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single()

        if (!user || user.password === undefined) return null

        const isValid = await compare(credentials.password, user.password)

        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.sub
      }
      return session
    }
  }
}

export const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
