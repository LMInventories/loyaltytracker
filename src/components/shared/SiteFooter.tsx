import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-6 py-4">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-ink-soft">
        <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
          Privacy Policy
        </Link>
        <Link href="/terms" className="underline underline-offset-4 hover:text-ink">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
