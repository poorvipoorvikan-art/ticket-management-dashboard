interface ErrorFallbackProps {
  onRetry: () => void;
  onReload: () => void;
}

export default function ErrorFallback({
  onRetry,
  onReload
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
          !
        </div>

        <h1 className="mb-3 text-2xl font-bold text-slate-900">
          Something went wrong
        </h1>

        <p className="mb-7 text-sm leading-6 text-slate-500">
          We encountered an unexpected application error.
          You can try recovering the application or reload the page.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={onReload}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reload Application
          </button>
        </div>
      </div>
    </div>
  );
}