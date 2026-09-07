export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900">HPLoyalty</h1>
      <p className="max-w-md text-zinc-600">
        The business directory and loyalty scheme browser land here in
        Milestone 1. For now, try{" "}
        <a href="/register" className="font-medium text-zinc-900 underline">
          creating an account
        </a>{" "}
        or{" "}
        <a href="/login" className="font-medium text-zinc-900 underline">
          signing in
        </a>
        .
      </p>
    </main>
  );
}
