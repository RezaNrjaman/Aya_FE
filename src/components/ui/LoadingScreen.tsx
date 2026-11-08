/** UI-003: LoadingScreen — full-page spinner */
export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="text-sm text-dark-400">Memuat...</p>
      </div>
    </div>
  )
}

