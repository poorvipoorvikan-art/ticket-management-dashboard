export default function LoadingFallback() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-slate-500">
          Loading application...
        </p>
      </div>
    </div>
  );
}