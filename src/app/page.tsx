export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-emerald-50 px-6">
      <div className="max-w-md text-center">
        <p className="text-5xl">🌿</p>
        <h1 className="mt-4 text-3xl font-bold text-emerald-900">Plant Manager</h1>
        <p className="mt-2 text-emerald-700">
          מערכת ניהול צמחים חכמה — בקרוב
        </p>
        <p className="mt-6 text-sm text-emerald-600">
          Setup: <code className="rounded bg-emerald-100 px-1">docs/SETUP.md</code>
        </p>
      </div>
    </main>
  );
}
