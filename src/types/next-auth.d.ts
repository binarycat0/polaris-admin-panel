import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      name: string
      email?: string
    } & DefaultSession["user"]
    accessToken?: string
    tokenType?: string
    expiresAt?: number
    realmHeaderName?: string
    realmHeaderValue?: string
    error?: string
  }

  interface User extends DefaultUser {
    accessToken?: string
    tokenType?: string
    expiresIn?: number
    realmHeaderName?: string
    realmHeaderValue?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string
    tokenType?: string
    expiresAt?: number
    realmHeaderName?: string
    realmHeaderValue?: string
    error?: string
  }
}

