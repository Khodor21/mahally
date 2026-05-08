# StoreForge — Multi-Tenant SaaS Store Builder

One codebase. One database. Every client gets their own store link automatically.

---

## How It Works

| What | Where |
|------|-------|
| Client fills onboarding form | `/onboarding` |
| Gets their store link | `storename.yoursaas.com` |
| Manages store | `/dashboard` |
| Customers visit | `storename.yoursaas.com` (subdomain) |

---

## Stack

- **Next.js 14** (App Router)
- **NextAuth v4** (credentials auth)
- **Supabase** (PostgreSQL database)
- **Tailwind CSS**
- **Vercel** (hosting + wildcard subdomains)

---

## Setup Guide

### 1. Clone & Install

```bash
git clone <your-repo>
cd saas-store
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Open the **SQL Editor**
3. Paste and run the entire contents of `supabase-schema.sql`
4. Copy your **Project URL** and **API keys** from Settings → API

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXTAUTH_SECRET=any-random-string-min-32-chars
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_DOMAIN=yoursaas.com
```

Generate a secret: `openssl rand -base64 32`

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/yourname/yourrepo.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Add all environment variables from `.env.local`
4. Change `NEXTAUTH_URL` to your production URL
5. Deploy

### Step 3 — Add Wildcard Subdomain

In Vercel → Project → Settings → Domains:
- Add `*.yoursaas.com`
- Add `yoursaas.com`

In your domain registrar DNS:
```
Type  Name  Value
A     @     76.76.21.21        (Vercel IP)
CNAME *     cname.vercel-dns.com
```

That's it. Every new client automatically gets `theirslug.yoursaas.com`.

---

## File Structure

```
app/
  page.tsx              → Landing page
  layout.tsx            → Root layout with fonts
  providers.tsx         → NextAuth provider wrapper
  not-found.tsx         → 404 page
  onboarding/
    page.tsx            → 3-step client signup form
  login/
    page.tsx            → Admin login
  dashboard/
    page.tsx            → Store management dashboard
  store/
    [slug]/page.tsx     → Public storefront (for subdomain routing)
  api/
    auth/[...nextauth]/ → NextAuth handler
    stores/route.ts     → Create store (POST), get store (GET)
    check-slug/route.ts → Real-time slug availability check

lib/
  supabase.ts           → Supabase clients (anon + admin)
  auth.ts               → NextAuth config

middleware.ts           → Subdomain routing + auth protection
supabase-schema.sql     → Database schema (run once in Supabase)
types/index.ts          → TypeScript types
```

---

## Roadmap (next steps)

- [ ] Product management (add/edit/delete products)
- [ ] Store customization (colors, logo, banner)
- [ ] Custom domain support via Vercel API
- [ ] Order management
- [ ] Analytics
- [ ] Stripe payments
"# mahally" 
