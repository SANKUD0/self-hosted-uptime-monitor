export function CardFetchError({ message = 'Unavailable' }) {
  return (
    <span className="text-xs text-muted-foreground italic">{message}</span>
  )
}