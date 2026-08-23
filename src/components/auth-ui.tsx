import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-emerald-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-4xl">🌿</p>
          <h1 className="mt-3 text-2xl font-bold text-emerald-900">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-emerald-700">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </main>
  );
}

export function AuthFooterLink({
  text,
  linkText,
  href,
}: {
  text: string;
  linkText: string;
  href: string;
}) {
  return (
    <p className="mt-6 text-center text-sm text-emerald-700">
      {text}{" "}
      <Link href={href} className="font-medium text-emerald-900 underline">
        {linkText}
      </Link>
    </p>
  );
}

export function SubmitButton({
  label,
  pending = false,
}: {
  label: string;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      {message}
    </p>
  );
}

export function TextField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-sm font-medium text-emerald-900">{label}</span>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-emerald-200 px-3 py-2.5 text-sm outline-none ring-emerald-500 focus:ring-2"
      />
    </label>
  );
}
