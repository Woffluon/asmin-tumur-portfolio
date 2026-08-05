import React, { useState, useEffect } from "react"
import "../styles/Admin.css"

interface AdminGuardProps {
  children: React.ReactNode
  onAuthSuccess: (sessionToken: string) => void
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children, onAuthSuccess }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [adminPassword, setAdminPassword] = useState<string>("")
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const savedToken = sessionStorage.getItem("at_admin_session_token")
    if (savedToken) {
      setIsAuthenticated(true)
      onAuthSuccess(savedToken)
    }
  }, [onAuthSuccess])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Şifre hatalı.")
      }

      sessionStorage.setItem("at_admin_session_token", data.token)
      setIsAuthenticated(true)
      onAuthSuccess(data.token)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Giriş yapılırken bir sorun oluştu."
      setErrorMsg(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("at_admin_session_token")
    setIsAuthenticated(false)
  }

  if (isAuthenticated) {
    return (
      <div className="admin-wrapper">
        <header className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span
              style={{
                fontSize: "1.05rem",
                fontWeight: 500,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
                color: "#f5f5f0",
              }}
            >
              Asmin Tumur | Yönetici Paneli
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              color: "#a1a1aa",
              border: "1px solid rgba(245, 245, 240, 0.2)",
              padding: "0.45rem 1.1rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.8rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#f5f5f0"
              e.currentTarget.style.borderColor = "rgba(245, 245, 240, 0.5)"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#a1a1aa"
              e.currentTarget.style.borderColor = "rgba(245, 245, 240, 0.2)"
            }}
          >
            Çıkış
          </button>
        </header>
        {children}
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#141412",
        color: "#f5f5f0",
        fontFamily: "'PP Neue Montreal', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "1.5rem",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#1c1c19",
          padding: "2.75rem 2.25rem",
          borderRadius: "6px",
          border: "1px solid rgba(245, 245, 240, 0.1)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              marginBottom: "0.4rem",
              color: "#f5f5f0",
            }}
          >
            Yönetici Girişi
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#a1a1aa", lineHeight: 1.4 }}>
            Galeri ve hero görsellerini düzenlemek için şifrenizi girin.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              borderRadius: "4px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#f87171",
              fontSize: "0.85rem",
            }}
          >
            {errorMsg}
          </div>
        )}

        <div style={{ marginBottom: "1.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#a1a1aa",
              marginBottom: "0.5rem",
            }}
          >
            Şifre
          </label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            style={{
              width: "100%",
              padding: "0.8rem 1rem",
              borderRadius: "4px",
              backgroundColor: "#141412",
              border: "1px solid rgba(245, 245, 240, 0.15)",
              color: "#f5f5f0",
              fontSize: "0.95rem",
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(245, 245, 240, 0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(245, 245, 240, 0.15)")}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: "4px",
            backgroundColor: "#f5f5f0",
            color: "#141412",
            fontWeight: 500,
            fontSize: "0.85rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            border: "none",
            cursor: isLoading ? "wait" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = "#e3e3db"
          }}
          onMouseOut={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = "#f5f5f0"
          }}
        >
          {isLoading ? "Kontrol Ediliyor..." : "Giriş"}
        </button>
      </form>
    </div>
  )
}
