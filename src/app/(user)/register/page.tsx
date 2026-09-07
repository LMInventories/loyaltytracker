import { RegisterForm } from "@/components/shared/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Create an account
      </h1>
      <RegisterForm callbackUrl="/" />
    </main>
  );
}
