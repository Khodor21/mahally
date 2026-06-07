import { NextAuthOptions, getServerSession } from "next-auth";
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
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

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

        const DUMMY_HASH =
          "$2b$12$LKkY4JBLRSjfsMKjl5qNSebGk2cz5pnBjNDKNKMr4rKPOeX0VGqeK";

        const hashToCompare = store?.password_hash ?? DUMMY_HASH;
        const passwordValid = await bcrypt.compare(password, hashToCompare);

        if (!store || !passwordValid) return null;

        if (!store.is_active) {
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
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  secret: (() => {
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error("NEXTAUTH_SECRET environment variable is not set");
    }
    return process.env.NEXTAUTH_SECRET;
  })(),

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

/**
 * Gets the current authenticated session
 */
export async function requireStoreSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  return session.user as {
    id: string;
    email: string;
    name: string;
    storeSlug: string;
    storeName: string;
  };
}

/**
 * SECURITY HELPER: Verifies if the authenticated admin has access to the requested store_id.
 * Use this in every API route that touches categories or storefront sections.
 */
export async function verifyStoreAccess(store_id: string): Promise<boolean> {
  const user = await requireStoreSession();

  // The user.id from the session (the store ID) must match the requested store_id
  // This prevents an admin of Store A from modifying data for Store B
  return user.id === store_id;
}
