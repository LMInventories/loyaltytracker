import { SchemeCreateForm } from "@/components/admin/SchemeCreateForm";

export default function NewSchemePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900">New scheme</h1>
      <SchemeCreateForm />
    </main>
  );
}
