import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { apiCatalogAuthUrl, apiManagementCatalogUrl } from "@/app/constants"
import { fetchKeycloakToken } from "@/utils/fetch-with-host-override"

/**
 * Verify that Polaris API accepts the token by making a test request
 * @param accessToken - The access token to verify
 * @param tokenType - Token type (usually "Bearer")
 * @param realmHeaderName - Optional realm header name
 * @param realmHeaderValue - Optional realm header value
 * @returns true if token is valid, false otherwise
 */
async function verifyTokenWithPolarisAPI(
  accessToken: string,
  tokenType: string,
  realmHeaderName?: string,
  realmHeaderValue?: string
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'Authorization': `${tokenType} ${accessToken}`,
    }

    if (realmHeaderName && realmHeaderValue) {
      headers[realmHeaderName] = realmHeaderValue
    }

    const response = await fetch(apiManagementCatalogUrl, {
      method: 'GET',
      headers,
    })

    if (response.ok) {
      return true
    }

    if (response.status === 401 || response.status === 403) {
      console.error('Polaris API rejected the Keycloak token:', response.status)
      return false
    }

    // Other errors (500, etc.) - log but don't fail auth
    console.warn('Polaris API returned unexpected status:', response.status)
    return false
  } catch (error) {
    console.error('Failed to verify token with Polaris API:', error)
    return false
  }
}

const kcUrl = process.env.KEYCLOAK_TOKEN_URL;
const kcClientId = process.env.KEYCLOAK_CLIENT_ID;
const kcClientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

const authOptions: NextAuthOptions = {
  providers: [
    // Polaris Client Credentials Provider
    CredentialsProvider({
      id: "polaris-credentials",
      name: "Polaris Credentials",
      credentials: {
        client_id: { label: "Client ID", type: "text" },
        client_secret: { label: "Client Secret", type: "password" },
        scope: { label: "Scope", type: "text" },
        realmHeaderName: { label: "Realm Header Name", type: "text" },
        realmHeaderValue: { label: "Realm Header Value", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.client_id || !credentials?.client_secret) {
          throw new Error("Missing credentials")
        }

        try {
          const formData = new URLSearchParams()
          formData.append('grant_type', 'client_credentials')
          formData.append('client_id', credentials.client_id)
          formData.append('client_secret', credentials.client_secret)
          formData.append('scope', credentials.scope || 'PRINCIPAL_ROLE:ALL')

          const headers: Record<string, string> = {
            'Content-Type': 'application/x-www-form-urlencoded',
          }

          if (credentials.realmHeaderName && credentials.realmHeaderValue) {
            headers[credentials.realmHeaderName] = credentials.realmHeaderValue
          }

          const response = await fetch(apiCatalogAuthUrl, {
            method: 'POST',
            headers,
            body: formData.toString(),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error?.message || 'Authentication failed')
          }

          const tokenData = await response.json()

          return {
            id: credentials.client_id,
            name: credentials.client_id,
            email: `${credentials.client_id}@polaris.local`,
            accessToken: tokenData.access_token,
            tokenType: tokenData.token_type,
            expiresIn: tokenData.expires_in,
            realmHeaderName: credentials.realmHeaderName,
            realmHeaderValue: credentials.realmHeaderValue,
          }
        } catch (error) {
          console.error('Polaris authentication error:', error)

          // Provide more helpful error messages
          if (error instanceof Error) {
            if (error.message.includes('ECONNREFUSED')) {
              throw new Error('Cannot connect to Polaris API. Please ensure the Polaris server is running.')
            }
            if (error.message.includes('fetch failed')) {
              throw new Error('Failed to connect to Polaris API. Check your network connection and API URL.')
            }
          }

          throw error
        }
      },
    }),

    // Keycloak Password Grant Provider (username/password authentication)
    ...(kcUrl && kcClientId && kcClientSecret
      ? [
          CredentialsProvider({
            id: "keycloak-password",
            name: "Keycloak Password",
            credentials: {
              username: { label: "Username", type: "text" },
              password: { label: "Password", type: "password" },
              realmHeaderName: { label: "Realm Header Name", type: "text" },
              realmHeaderValue: { label: "Realm Header Value", type: "text" },
            },
            async authorize(credentials) {
              if (!credentials?.username || !credentials?.password) {
                throw new Error("Missing username or password")
              }

              try {
                const formData = new URLSearchParams()
                formData.append('grant_type', 'password')
                formData.append('client_id', kcClientId)
                formData.append('client_secret', kcClientSecret)
                formData.append('username', credentials.username)
                formData.append('password', credentials.password)

                const tokenUrl = process.env.KEYCLOAK_TOKEN_URL!

                const response = await fetchKeycloakToken(tokenUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: formData.toString(),
                })

                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}))
                  throw new Error(errorData.error_description || errorData.error || 'Keycloak authentication failed')
                }

                const tokenData = await response.json()

                console.info(tokenData);

                // Verify token with Polaris API
                const isTokenValid = await verifyTokenWithPolarisAPI(
                  tokenData.access_token,
                  tokenData.token_type || 'Bearer',
                  credentials.realmHeaderName,
                  credentials.realmHeaderValue
                )

                if (!isTokenValid) {
                  throw new Error('Polaris API rejected the Keycloak token. Please check your Polaris configuration and ensure it accepts tokens from this Keycloak realm.')
                }

                return {
                  id: credentials.username,
                  name: credentials.username,
                  accessToken: tokenData.access_token,
                  tokenType: tokenData.token_type || 'Bearer',
                  expiresIn: tokenData.expires_in,
                  realmHeaderName: credentials.realmHeaderName,
                  realmHeaderValue: credentials.realmHeaderValue,
                }
              } catch (error) {
                console.error('Keycloak password authentication error:', error)

                if (error instanceof Error) {
                  if (error.message.includes('ECONNREFUSED')) {
                    throw new Error('Cannot connect to Keycloak. Please ensure Keycloak is running.')
                  }
                  if (error.message.includes('fetch failed')) {
                    throw new Error('Failed to connect to Keycloak. Check your network connection and token URL.')
                  }
                }

                throw error
              }
            },
          }),
        ]
      : []),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/signin',
    error: '/signin',
  },

  callbacks: {
    async signIn() {
      // For Keycloak, we'll handle realm info in the jwt callback
      return true
    },

    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken
        token.tokenType = user.tokenType
        token.realmHeaderName = user.realmHeaderName
        token.realmHeaderValue = user.realmHeaderValue

        // Calculate expiration time
        if (user.expiresIn) {
          token.expiresAt = Date.now() + user.expiresIn * 1000
        }
      }

      // Check if token is expired
      if (token.expiresAt && Date.now() > token.expiresAt) {
        token.error = "TokenExpired"
      }

      return token
    },

    async session({ session, token }) {
      // Pass token data to session
      session.accessToken = token.accessToken
      session.tokenType = token.tokenType
      session.expiresAt = token.expiresAt
      session.realmHeaderName = token.realmHeaderName
      session.realmHeaderValue = token.realmHeaderValue
      session.error = token.error

      if (token.sub) {
        session.user.id = token.sub
      }

      return session
    },
  },

  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

