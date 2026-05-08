import Link from 'next/link'
import { ArrowRight, Zap, Globe, LayoutDashboard } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/5">
        <span className="font-display text-xl font-bold text-paper">
          Store<span className="text-accent">Forge</span>
        </span>
        <Link
          href="/login"
          className="text-sm text-muted hover:text-paper transition-colors font-mono"
        >
          Sign in →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative px-8 pt-24 pb-20 max-w-5xl mx-auto">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
            <span className="text-xs font-mono text-accent tracking-wider uppercase">
              Your store, live in 60 seconds
            </span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-bold leading-[0.9] mb-8 opacity-0 animate-fade-up">
            Build your
            <br />
            <span className="text-accent">online store</span>
            <br />
            instantly.
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-xl mb-12 leading-relaxed opacity-0 animate-fade-up delay-200">
            Fill one form. Get your store link. Start selling.
            No code, no hosting headaches, no waiting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-up delay-300">
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-paper rounded-lg font-semibold text-lg hover:bg-accent/90 transition-all hover:gap-4"
            >
              Create your store
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-4 border border-white/10 text-paper rounded-lg font-semibold text-lg hover:border-white/30 transition-all hover:bg-white/5"
            >
              I have a store
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6" />,
              title: 'Instant setup',
              desc: 'Fill the form and your store is live. No technical knowledge required.',
              delay: '',
            },
            {
              icon: <Globe className="w-6 h-6" />,
              title: 'Your own link',
              desc: 'Get a clean, shareable URL for your store the moment you sign up.',
              delay: 'delay-200',
            },
            {
              icon: <LayoutDashboard className="w-6 h-6" />,
              title: 'Full dashboard',
              desc: 'Manage your store, track performance, and update your info anytime.',
              delay: 'delay-400',
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all opacity-0 animate-fade-up ${f.delay}`}
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4">
                {f.icon}
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-6 text-center">
        <p className="text-muted text-sm font-mono">
          © 2025 StoreForge — Built for entrepreneurs
        </p>
      </footer>
    </main>
  )
}
