/**
 * Utility for making fetch requests with custom host resolution
 * Similar to curl's --resolve flag
 *
 * This implementation uses Node.js http/https modules with custom DNS lookup
 * to properly resolve hostnames to custom IPs while preserving the original
 * hostname in the request (important for Keycloak's issuer claim).
 */

import http from 'http'
import https from 'https'
import dns from 'dns'

interface HostOverride {
  hostname: string
  port: number
  ip: string
}

/**
 * Parse host override from environment variable
 * Format: "hostname:port=ip_address"
 * Example: "keycloak:8080=127.0.0.1"
 */
function parseHostOverride(overrideStr: string | undefined): HostOverride | null {
  if (!overrideStr) return null

  const match = overrideStr.match(/^([^:]+):(\d+)=(.+)$/)
  if (!match) {
    console.warn(`Invalid KEYCLOAK_HOST_OVERRIDE format: ${overrideStr}`)
    return null
  }

  return {
    hostname: match[1],
    port: parseInt(match[2], 10),
    ip: match[3],
  }
}

/**
 * Create a custom DNS lookup function that overrides specific hosts
 * This is the key to making curl's --resolve equivalent work
 *
 * Note: Node.js 20+ changed the internal implementation
 * We need to match the exact signature that dns.lookup uses
 */
function createCustomLookup(override: HostOverride): typeof dns.lookup {
  return ((
    hostname: string,
    options: dns.LookupOptions | number | ((err: NodeJS.ErrnoException | null, address: string, family: number) => void),
    callback?: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void
  ) => {
    // Normalize arguments - dns.lookup can be called with 2 or 3 arguments
    let opts: dns.LookupOptions = {}
    let cb: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void

    if (typeof options === 'function') {
      cb = options as any
      opts = {}
    } else if (typeof options === 'number') {
      cb = callback!
      opts = { family: options }
    } else {
      cb = callback!
      opts = options || {}
    }

    // If this is the hostname we want to override, return the custom IP
    if (hostname === override.hostname) {
      console.log(`[DNS Override] Resolving ${hostname} -> ${override.ip}`)

      // Call callback asynchronously to match dns.lookup behavior
      process.nextTick(() => {
        if (opts.all) {
          // Return array of addresses when all=true
          cb(null, [{ address: override.ip, family: 4 }])
        } else {
          // Return single address
          cb(null, override.ip, 4)
        }
      })
      return
    }

    // Otherwise, use default DNS resolution
    dns.lookup(hostname, opts, cb as any)
  }) as typeof dns.lookup
}

/**
 * Fetch with custom host resolution using Node.js http/https modules
 * Similar to: curl --resolve keycloak:8080:127.0.0.1 http://keycloak:8080/...
 *
 * This properly preserves the hostname in the request, which is critical for
 * Keycloak to generate the correct issuer claim in tokens.
 *
 * @param url - The URL to fetch
 * @param options - Standard fetch options
 * @param hostOverride - Optional host override string (format: "hostname:port=ip")
 * @returns Promise with fetch response
 */
export async function fetchWithHostOverride(
  url: string,
  options: RequestInit = {},
  hostOverride?: string
): Promise<Response> {
  const override = parseHostOverride(hostOverride)

  // If no override or running in browser, use standard fetch
  if (!override || typeof window !== 'undefined') {
    return fetch(url, options)
  }

  // Parse URL to check if it matches the override
  const urlObj = new URL(url)
  const urlPort = urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80')

  // If URL doesn't match override, use standard fetch
  if (urlObj.hostname !== override.hostname || parseInt(urlPort) !== override.port) {
    return fetch(url, options)
  }

  // Use Node.js http/https module with custom DNS lookup
  return new Promise((resolve, reject) => {
    try {
      const isHttps = urlObj.protocol === 'https:'
      const httpModule = isHttps ? https : http

      console.log(`[Host Override] Creating custom DNS lookup for ${override.hostname} -> ${override.ip}`)

      // Create custom agent with DNS lookup override
      const agent = new (isHttps ? https.Agent : http.Agent)({
        lookup: createCustomLookup(override) as any,
      })

      // Convert fetch options to http.request options
      const requestOptions: http.RequestOptions = {
        method: options.method || 'GET',
        headers: options.headers as http.OutgoingHttpHeaders,
        agent,
      }

      console.log(`[Host Override] Fetching ${url} with DNS override ${override.hostname} -> ${override.ip}`)

      const req = httpModule.request(url, requestOptions, (res) => {
        // Collect response body
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          const body = Buffer.concat(chunks)

          console.log(`[Host Override] Request completed with status ${res.statusCode}`)

          // Convert http.IncomingMessage to Response-like object
          const response = new Response(body, {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers as HeadersInit,
          })

          resolve(response)
        })

        res.on('error', (error) => {
          console.error('[Host Override] Response error:', error)
          reject(error)
        })
      })

      req.on('error', (error) => {
        console.error('[Host Override] Request failed:', error)
        reject(error)
      })

      // Send request body if present
      if (options.body) {
        if (typeof options.body === 'string') {
          req.write(options.body)
        } else if (options.body instanceof Buffer) {
          req.write(options.body)
        } else {
          req.write(String(options.body))
        }
      }

      req.end()
    } catch (error) {
      console.error('[Host Override] Failed to create request:', error)
      reject(error)
    }
  })
}

/**
 * Fetch Keycloak token with custom host resolution
 * Uses KEYCLOAK_HOST_OVERRIDE environment variable if set
 *
 * @param url - Keycloak token URL
 * @param options - Fetch options
 * @returns Promise with fetch response
 */
export async function fetchKeycloakToken(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetchWithHostOverride(
    url,
    options,
    process.env.KEYCLOAK_HOST_OVERRIDE
  )
}

