import { WifiOff } from 'lucide-react'

export function PageFetchError({ message = 'Failed to fetch' }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800 mb-3.5">
      <WifiOff size={15} className="text-red-500 shrink-0" />
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        Impossible de charger les services
        <span className="font-normal opacity-75 ml-1">· {message}</span>
      </p>
    </div>
  )
}