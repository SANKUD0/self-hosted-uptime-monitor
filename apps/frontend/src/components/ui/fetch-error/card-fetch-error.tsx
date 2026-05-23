export function CardFetchError({ message = 'Failed to fetch' }) {
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
      <span className="text-xs font-medium text-red-600 dark:text-red-400">{message}</span>
    </div>
  )
}