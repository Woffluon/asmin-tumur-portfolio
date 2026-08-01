export function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Sayfa yükleniyor"
      className="page-loader"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#141412',
        color: '#a1a1aa',
        fontSize: '0.875rem',
        letterSpacing: '0.05em',
      }}
    >
      <span>Yükleniyor...</span>
    </div>
  )
}
