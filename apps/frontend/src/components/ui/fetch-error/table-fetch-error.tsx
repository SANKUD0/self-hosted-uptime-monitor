import { WifiOff, RefreshCw } from 'lucide-react'

export function TableFetchError({ colSpan, message = 'Failed to fetch', onRetry }: {
  colSpan: number
  message?: string
  onRetry?: () => void
}) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center justify-center gap-1.5 py-9">
          <WifiOff size={20} className="text-red-500" />
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Impossible de charger les données
          </p>
          <span className="text-xs text-muted-foreground">{message}</span>
          {/* {onRetry && (
            <button onClick={onRetry} className="mt-1 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border hover:bg-muted transition-colors">
              <RefreshCw size={12} /> Réessayer
            </button>
          )} */}
        </div>
      </td>
    </tr>
  )
}