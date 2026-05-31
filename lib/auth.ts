import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ── Validate shape ───────────────────────────────────────────────
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // ── Fetch store ──────────────────────────────────────────────────
        // Use maybeSingle() — never throws on 0 rows
        const { data: store, error } = await supabaseAdmin
          .from("stores")
          .select(
            "id, admin_email, admin_name, slug, store_name, password_hash, is_active",
          )
          .eq("admin_email", email.toLowerCase().trim())
          .maybeSingle();

        if (error) {
          console.error("Auth DB error:", error);
          return null;
        }

        // ── Timing-safe: always run bcrypt to prevent timing attacks ─────
        // If no store found, compare against a dummy hash so response
        // time is the same whether the email exists or not.
        const DUMMY_HASH =
          "$2b$12$LKkY4JBLRSjfsMKjl5qNSebGk2cz5pnBjNDKNKMr4rKPOeX0VGqeK";

        const hashToCompare = store?.password_hash ?? DUMMY_HASH;
        const passwordValid = await bcrypt.compare(password, hashToCompare);

        if (!store || !passwordValid) return null;

        // ── Check account is active ──────────────────────────────────────
        if (!store.is_active) {
          // You can throw to show a specific message on the login page
          throw new Error("ACCOUNT_DISABLED");
        }

        return {
          id: store.id,
          email: store.admin_email,
          name: store.admin_name,
          storeSlug: store.slug,
          storeName: store.store_name,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.storeSlug = (user as any).storeSlug;
        token.storeName = (user as any).storeName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).storeSlug = token.storeSlug;
        (session.user as any).storeName = token.storeName;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", // redirect auth errors back to login with ?error=
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // refresh token every 24h
  },

  // Prevent JWT secret falling back to a weak default
  secret: (() => {
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error("NEXTAUTH_SECRET environment variable is not set");
    }
    return process.env.NEXTAUTH_SECRET;
  })(),

  // Lock down cookies in production
  cookies:
    process.env.NODE_ENV === "production"
      ? {
          sessionToken: {
            name: "__Secure-next-auth.session-token",
            options: {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              secure: true,
            },
          },
        }
      : undefined,

  debug: process.env.NODE_ENV === "development",
};
