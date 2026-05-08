import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="text-center animate-fade-up">
        <p className="font-mono text-accent text-6xl font-bold mb-4">404</p>
        <h1 className="font-display text-3xl font-bold mb-3">Store not found</h1>
        <p className="text-muted mb-8">
          This store doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-paper rounded-lg font-semibold hover:bg-accent/90 transition-all"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
