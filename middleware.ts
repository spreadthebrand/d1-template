import { withAuth } from "next-auth/middleware";
export default withAuth({ pages: { signIn: "/admin/login" }, callbacks: { authorized({ token, req }) { const pathname = req.nextUrl.pathname; if (pathname.startsWith("/admin") && pathname !== "/admin/login") return token?.role === "admin"; if (pathname.startsWith("/dashboard")) return Boolean(token); return true; } } });
export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
