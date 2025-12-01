export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    '/catalogs/:path*',
    '/principals/:path*',
    '/principal-roles/:path*',
    '/privileges/:path*',
  ]
}

