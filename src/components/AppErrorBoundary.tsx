import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('AppErrorBoundary caught an unhandled error:', error, errorInfo)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#141412',
            color: '#f5f5f0',
            fontFamily: 'sans-serif',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '1rem' }}>
            Bir Hata Oluştu
          </h1>
          <p style={{ color: '#a1a1aa', maxWidth: '400px', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Sayfa yüklenirken beklenmeyen bir aksaklık meydana geldi.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#e3e3db',
              color: '#141412',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Ana Sayfaya Dön
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
