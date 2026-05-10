import "next-auth";
declare module "next-auth" { interface Session { user?: { id?: string; role?: "admin" | "creator"; name?: string | null; email?: string | null; image?: string | null } } }
declare module "next-auth/jwt" { interface JWT { role?: "admin" | "creator" } }
