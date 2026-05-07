import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized({ token, req }) {
      const { pathname } = req.nextUrl;
      if (pathname === "/admin/login") return true;
      if (pathname.startsWith("/admin")) return token?.role === "admin";
      if (pathname.startsWith("/dashboard")) return Boolean(token);
      return true;
    }
  }
});

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
