import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-rose-100 text-2xl font-bold text-rose-600">
          403
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Access Denied
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is a mistake.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Back to Dashboard
        </Link>
      </section>
    </main>
  );
}