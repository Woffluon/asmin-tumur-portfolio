import React, { useState } from "react"
import { AdminGuard } from "../components/AdminGuard"
import initialCollection, { CollectionItem } from "../collection"
import initialHeroCollection, { HeroCollectionItem } from "../heroCollection"
import "../styles/Admin.css"

type AdminTab = "hero" | "gallery"
type GalleryViewMode = "circular" | "grid"

export const AdminPage: React.FC = () => {
  const [sessionToken, setSessionToken] = useState<string>("")

  const [activeTab, setActiveTab] = useState<AdminTab>("gallery")
  const [galleryViewMode, setGalleryViewMode] = useState<GalleryViewMode>("circular")
  const [selectedGalleryId, setSelectedGalleryId] = useState<number | null>(null)

  const [galleryItems, setGalleryItems] = useState<CollectionItem[]>(initialCollection)
  const [heroItems, setHeroItems] = useState<HeroCollectionItem[]>(initialHeroCollection)

  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [uploadingSlotId, setUploadingSlotId] = useState<string | number | null>(null)

  const handleAuthSuccess = (token: string) => {
    setSessionToken(token)
  }

  // --- Hero Handlers ---
  const updateHeroTitle = (id: string, newTitle: string) => {
    setHeroItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item))
    )
  }

  const updateHeroCategory = (id: string, newCategory: string) => {
    setHeroItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category: newCategory } : item))
    )
  }

  // --- Gallery Handlers ---
  const updateGalleryTitle = (id: number, newTitle: string) => {
    setGalleryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item))
    )
  }

  const moveGalleryItem = (index: number, direction: "left" | "right") => {
    if ((direction === "left" && index === 0) || (direction === "right" && index === galleryItems.length - 1)) {
      return
    }
    const newItems = [...galleryItems]
    const targetIndex = direction === "left" ? index - 1 : index + 1
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp
    setGalleryItems(newItems)
  }

  const addGallerySlot = () => {
    const nextId = galleryItems.length > 0 ? Math.max(...galleryItems.map((i) => i.id)) + 1 : 1
    const newItem: CollectionItem = {
      id: nextId,
      title: `Yeni Görsel ${nextId}`,
      img: `/medias/${nextId}.webp`,
      mobileImg: `/medias/${nextId}_mobile.webp`,
      tabletImg: `/medias/${nextId}_tablet.webp`,
    }
    setGalleryItems((prev) => [...prev, newItem])
    setSelectedGalleryId(nextId)
  }

  const deleteGallerySlot = (id: number) => {
    if (window.confirm("Bu eseri galeriden silmek istediğinize emin misiniz?")) {
      const filtered = galleryItems.filter((item) => item.id !== id)
      setGalleryItems(filtered)
      if (selectedGalleryId === id) {
        setSelectedGalleryId(filtered.length > 0 ? filtered[0].id : null)
      }
      setStatusMsg({
        type: "info",
        text: "Eser listeden kaldırıldı. Değişikliklerin kalıcı olması için 'Galeriyi Kaydet' butonuna basmayı unutmayın.",
      })
    }
  }

  // Save JSON metadata via secure Serverless Proxy (/api/github-proxy)
  const saveJsonData = async (target: "hero" | "gallery") => {
    if (!sessionToken) {
      setStatusMsg({
        type: "error",
        text: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      })
      return
    }

    setIsSaving(true)
    const isHero = target === "hero"
    const path = isHero ? "src/heroCollection.json" : "src/collection.json"
    const payloadData = isHero ? heroItems : galleryItems

    setStatusMsg({
      type: "info",
      text: "Değişiklikler sunucu üzerinden kaydediliyor...",
    })

    try {
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(payloadData, null, 2))))

      const res = await fetch("/api/github-proxy", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save-file",
          path,
          content: contentBase64,
          message: `feat(admin): update ${isHero ? "heroCollection" : "collection"} photo items & layout`,
        }),
      })

      const resData = await res.json()

      if (!res.ok || resData.error) {
        throw new Error(resData.error || "Kaydetme sırasında sunucu hatası oluştu.")
      }

      setStatusMsg({
        type: "success",
        text: `${isHero ? "Hero" : "Galeri"} değişiklikleri kaydedildi. Canlı site kısa süre içinde güncellenecektir.`,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kaydetme başarısız."
      setStatusMsg({ type: "error", text: `Hata: ${message}` })
    } finally {
      setIsSaving(false)
    }
  }

  // Upload raw photo file via secure Serverless Proxy (/api/github-proxy)
  const handlePhotoUpload = async (fileBasename: string | number, file: File) => {
    if (!sessionToken) {
      setStatusMsg({
        type: "error",
        text: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      })
      return
    }

    setUploadingSlotId(fileBasename)
    setStatusMsg({ type: "info", text: "Görsel yükleniyor..." })

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const result = reader.result as string
        const base64Data = result.split(",")[1]
        const rawPath = `raw-medias/${fileBasename}.jpg`

        const res = await fetch("/api/github-proxy", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "save-file",
            path: rawPath,
            content: base64Data,
            message: `media(admin): upload high-res raw photo for ${fileBasename}`,
          }),
        })

        const resData = await res.json()

        if (!res.ok || resData.error) {
          throw new Error(resData.error || "Görsel yüklenemedi.")
        }

        setStatusMsg({
          type: "success",
          text: "Görsel başarıyla yüklendi. İşlenip yayına alınacaktır.",
        })
        setUploadingSlotId(null)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Yükleme başarısız."
      setStatusMsg({ type: "error", text: `Yükleme Hatası: ${message}` })
      setUploadingSlotId(null)
    }
  }

  const currentSelectedItem = galleryItems.find((i) => i.id === selectedGalleryId) || galleryItems[0]

  return (
    <AdminGuard onAuthSuccess={handleAuthSuccess}>
      <main className="admin-main">
        {/* Main Navigation Tabs */}
        <div className="admin-tabs-bar">
          <div className="admin-tab-group">
            <button
              onClick={() => setActiveTab("gallery")}
              className={`admin-tab-btn ${activeTab === "gallery" ? "active" : ""}`}
            >
              Galeri
            </button>
            <button
              onClick={() => setActiveTab("hero")}
              className={`admin-tab-btn ${activeTab === "hero" ? "active" : ""}`}
            >
              Ana Sayfa Hero
            </button>
          </div>

          <div>
            <button
              onClick={() => saveJsonData(activeTab)}
              disabled={isSaving}
              className="admin-action-btn"
            >
              {isSaving ? "Kaydediliyor..." : `${activeTab === "hero" ? "Hero'yu" : "Galeriyi"} Kaydet`}
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusMsg && (
          <div
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "4px",
              marginBottom: "2rem",
              backgroundColor:
                statusMsg.type === "success"
                  ? "rgba(16, 185, 129, 0.1)"
                  : statusMsg.type === "error"
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(245, 245, 240, 0.08)",
              border: `1px solid ${
                statusMsg.type === "success"
                  ? "rgba(16, 185, 129, 0.3)"
                  : statusMsg.type === "error"
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(245, 245, 240, 0.2)"
              }`,
              color: statusMsg.type === "success" ? "#34d399" : statusMsg.type === "error" ? "#f87171" : "#f5f5f0",
              fontSize: "0.875rem",
            }}
          >
            {statusMsg.text}
          </div>
        )}

        {/* TAB 1: HERO PHOTOS MANAGEMENT */}
        {activeTab === "hero" && (
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 500, letterSpacing: "-0.01em" }}>
                Hero Görselleri
              </h2>
              <p style={{ color: "#a1a1aa", fontSize: "0.85rem", marginTop: "0.3rem" }}>
                Ana sayfadaki açılış ekranında yer alan 7 ana görseli, başlıkları ve etiketleri buradan düzenleyebilirsiniz.
              </p>
            </div>

            <div className="admin-grid-layout">
              {heroItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "#1c1c19",
                    borderRadius: "6px",
                    border: "1px solid rgba(245, 245, 240, 0.1)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      height: "220px",
                      backgroundColor: "#141412",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.opacity = "0.2"
                      }}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        backgroundColor: "rgba(20, 20, 18, 0.85)",
                        padding: "0.3rem 0.65rem",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "#f5f5f0",
                        border: "1px solid rgba(245, 245, 240, 0.15)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {item.slot}
                    </span>

                    {uploadingSlotId === item.id && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(20, 20, 18, 0.9)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#f5f5f0",
                          fontSize: "0.85rem",
                        }}
                      >
                        Yükleniyor...
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", color: "#a1a1aa", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                        Başlık
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateHeroTitle(item.id, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.6rem 0.8rem",
                          borderRadius: "4px",
                          backgroundColor: "#141412",
                          border: "1px solid rgba(245, 245, 240, 0.12)",
                          color: "#f5f5f0",
                          fontSize: "0.9rem",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", color: "#a1a1aa", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                        Alt Etiket
                      </label>
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => updateHeroCategory(item.id, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.6rem 0.8rem",
                          borderRadius: "4px",
                          backgroundColor: "#141412",
                          border: "1px solid rgba(245, 245, 240, 0.12)",
                          color: "#f5f5f0",
                          fontSize: "0.9rem",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`upload-${item.id}`}
                        style={{
                          display: "block",
                          textAlign: "center",
                          padding: "0.65rem",
                          borderRadius: "4px",
                          backgroundColor: "rgba(245, 245, 240, 0.04)",
                          border: "1px dashed rgba(245, 245, 240, 0.2)",
                          color: "#a1a1aa",
                          fontSize: "0.75rem",
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                        }}
                      >
                        Görsel Seç
                      </label>
                      <input
                        id={`upload-${item.id}`}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handlePhotoUpload(item.id, e.target.files[0])
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GALLERY PHOTOS MANAGEMENT */}
        {activeTab === "gallery" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 500, letterSpacing: "-0.01em" }}>
                  Galeri Sıralaması ({galleryItems.length} Görsel)
                </h2>
                <p style={{ color: "#a1a1aa", fontSize: "0.85rem", marginTop: "0.3rem" }}>
                  Görseller 3D galeride bu sırayla sergilenir. Sırayı değiştirmek için görselleri sola-sağa taşıyabilirsiniz.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => setGalleryViewMode("circular")}
                  style={{
                    backgroundColor: galleryViewMode === "circular" ? "rgba(245, 245, 240, 0.15)" : "transparent",
                    color: galleryViewMode === "circular" ? "#f5f5f0" : "#a1a1aa",
                    border: "1px solid rgba(245, 245, 240, 0.2)",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Dairesel
                </button>

                <button
                  onClick={() => setGalleryViewMode("grid")}
                  style={{
                    backgroundColor: galleryViewMode === "grid" ? "rgba(245, 245, 240, 0.15)" : "transparent",
                    color: galleryViewMode === "grid" ? "#f5f5f0" : "#a1a1aa",
                    border: "1px solid rgba(245, 245, 240, 0.2)",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Liste
                </button>

                <button
                  onClick={addGallerySlot}
                  style={{
                    backgroundColor: "transparent",
                    color: "#f5f5f0",
                    border: "1px solid rgba(245, 245, 240, 0.3)",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  + Yeni Görsel Ekle
                </button>
              </div>
            </div>

            {/* EMPTY GALLERY SAFEGUARD */}
            {galleryItems.length === 0 ? (
              <div
                style={{
                  padding: "4rem 2rem",
                  textAlign: "center",
                  backgroundColor: "#1c1c19",
                  borderRadius: "8px",
                  border: "1px dashed rgba(245, 245, 240, 0.15)",
                }}
              >
                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Henüz galeride görsel bulunmuyor</h3>
                <p style={{ color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                  Yukarıdaki "+ Yeni Görsel Ekle" butonuna basarak yeni bir eser oluşturabilirsiniz.
                </p>
                <button
                  onClick={addGallerySlot}
                  className="admin-action-btn"
                >
                  + Yeni Görsel Ekle
                </button>
              </div>
            ) : (
              <>
                {/* CIRCULAR WHEEL VIEW */}
                {galleryViewMode === "circular" && (
                  <div className="admin-circular-layout">
                    <div className="admin-wheel-stage">
                      <span
                        style={{
                          position: "absolute",
                          top: "20px",
                          left: "20px",
                          fontSize: "0.75rem",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: "#a1a1aa",
                        }}
                      >
                        Dairesel Görünüm
                      </span>

                      <div className="admin-wheel-container">
                        <div
                          style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            backgroundColor: "#141412",
                            border: "1px solid rgba(245, 245, 240, 0.2)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            padding: "0.5rem",
                          }}
                        >
                          <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>{galleryItems.length}</span>
                          <span style={{ fontSize: "0.65rem", color: "#a1a1aa", textTransform: "uppercase" }}>Görsel</span>
                        </div>

                        {galleryItems.map((item, i) => {
                          const total = galleryItems.length
                          const angle = total > 0 ? (i / total) * Math.PI * 2 - Math.PI / 2 : 0
                          const radius = 180
                          const x = Math.cos(angle) * radius
                          const y = Math.sin(angle) * radius
                          const isSelected = currentSelectedItem && item.id === currentSelectedItem.id

                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedGalleryId(item.id)}
                              style={{
                                position: "absolute",
                                left: `calc(50% + ${x}px - 26px)`,
                                top: `calc(50% + ${y}px - 34px)`,
                                width: "52px",
                                height: "68px",
                                borderRadius: "4px",
                                overflow: "hidden",
                                border: isSelected
                                  ? "2px solid #f5f5f0"
                                  : "1px solid rgba(245, 245, 240, 0.2)",
                                boxShadow: isSelected
                                  ? "0 0 20px rgba(245, 245, 240, 0.4)"
                                  : "none",
                                cursor: "pointer",
                                transform: `scale(${isSelected ? 1.25 : 1})`,
                                transition: "all 0.2s ease",
                                backgroundColor: "#141412",
                                zIndex: isSelected ? 10 : 1,
                              }}
                              title={`#${item.id}: ${item.title}`}
                            >
                              <img
                                src={item.img}
                                alt={item.title}
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).style.opacity = "0.2"
                                }}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  inset: "auto 0 0 0",
                                  backgroundColor: "rgba(0,0,0,0.75)",
                                  color: "#fff",
                                  fontSize: "0.55rem",
                                  textAlign: "center",
                                  padding: "1px 0",
                                  fontWeight: 700,
                                }}
                              >
                                #{i + 1}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Selected Item Editor Panel */}
                    {currentSelectedItem && (
                      <div className="admin-selected-panel">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Seçili Görsel
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              padding: "0.2rem 0.6rem",
                              borderRadius: "4px",
                              backgroundColor: "rgba(245, 245, 240, 0.1)",
                              fontWeight: 600,
                            }}
                          >
                            {galleryItems.findIndex((i) => i.id === currentSelectedItem.id) + 1} / {galleryItems.length}
                          </span>
                        </div>

                        <div
                          style={{
                            height: "240px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            backgroundColor: "#141412",
                            position: "relative",
                            border: "1px solid rgba(245, 245, 240, 0.1)",
                          }}
                        >
                          <img
                            src={currentSelectedItem.img}
                            alt={currentSelectedItem.title}
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.opacity = "0.2"
                            }}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />

                          {uploadingSlotId === currentSelectedItem.id && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                backgroundColor: "rgba(20, 20, 18, 0.9)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#f5f5f0",
                                fontSize: "0.85rem",
                              }}
                            >
                              Yükleniyor...
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", color: "#a1a1aa", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                            Başlık
                          </label>
                          <input
                            type="text"
                            value={currentSelectedItem.title}
                            onChange={(e) => updateGalleryTitle(currentSelectedItem.id, e.target.value)}
                            style={{
                              width: "100%",
                              padding: "0.7rem 0.9rem",
                              borderRadius: "4px",
                              backgroundColor: "#141412",
                              border: "1px solid rgba(245, 245, 240, 0.15)",
                              color: "#f5f5f0",
                              fontSize: "0.95rem",
                              outline: "none",
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <label
                            htmlFor={`upload-circular-${currentSelectedItem.id}`}
                            style={{
                              flex: 2,
                              textAlign: "center",
                              padding: "0.75rem",
                              borderRadius: "4px",
                              backgroundColor: "rgba(245, 245, 240, 0.05)",
                              border: "1px dashed rgba(245, 245, 240, 0.3)",
                              color: "#f5f5f0",
                              fontSize: "0.8rem",
                              letterSpacing: "0.03em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                            }}
                          >
                            Görsel Seç
                          </label>
                          <input
                            id={`upload-circular-${currentSelectedItem.id}`}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePhotoUpload(currentSelectedItem.id, e.target.files[0])
                              }
                            }}
                          />
                          <button
                            onClick={() => deleteGallerySlot(currentSelectedItem.id)}
                            style={{
                              flex: 1,
                              padding: "0.75rem",
                              borderRadius: "4px",
                              backgroundColor: "rgba(239, 68, 68, 0.15)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              color: "#f87171",
                              fontSize: "0.8rem",
                              letterSpacing: "0.03em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                            }}
                          >
                            Sil
                          </button>
                        </div>

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          {(() => {
                            const idx = galleryItems.findIndex((i) => i.id === currentSelectedItem.id)
                            return (
                              <>
                                <button
                                  onClick={() => moveGalleryItem(idx, "left")}
                                  disabled={idx === 0}
                                  style={{
                                    flex: 1,
                                    padding: "0.6rem",
                                    borderRadius: "4px",
                                    backgroundColor: "rgba(245, 245, 240, 0.05)",
                                    border: "1px solid rgba(245, 245, 240, 0.15)",
                                    color: "#f5f5f0",
                                    fontSize: "0.75rem",
                                    letterSpacing: "0.03em",
                                    textTransform: "uppercase",
                                    cursor: idx === 0 ? "not-allowed" : "pointer",
                                    opacity: idx === 0 ? 0.3 : 1,
                                  }}
                                >
                                  ← Sola
                                </button>
                                <button
                                  onClick={() => moveGalleryItem(idx, "right")}
                                  disabled={idx === galleryItems.length - 1}
                                  style={{
                                    flex: 1,
                                    padding: "0.6rem",
                                    borderRadius: "4px",
                                    backgroundColor: "rgba(245, 245, 240, 0.05)",
                                    border: "1px solid rgba(245, 245, 240, 0.15)",
                                    color: "#f5f5f0",
                                    fontSize: "0.75rem",
                                    letterSpacing: "0.03em",
                                    textTransform: "uppercase",
                                    cursor: idx === galleryItems.length - 1 ? "not-allowed" : "pointer",
                                    opacity: idx === galleryItems.length - 1 ? 0.3 : 1,
                                  }}
                                >
                                  Sağa →
                                </button>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* GRID VIEW */}
                {galleryViewMode === "grid" && (
                  <div className="admin-grid-layout">
                    {galleryItems.map((item, index) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: "#1c1c19",
                          borderRadius: "6px",
                          border: "1px solid rgba(245, 245, 240, 0.08)",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            height: "220px",
                            backgroundColor: "#141412",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={item.img}
                            alt={item.title}
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.opacity = "0.2"
                            }}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              backgroundColor: "rgba(20, 20, 18, 0.85)",
                              padding: "0.3rem 0.65rem",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              color: "#f5f5f0",
                              border: "1px solid rgba(245, 245, 240, 0.15)",
                            }}
                          >
                            #{index + 1}
                          </span>

                          {uploadingSlotId === item.id && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                backgroundColor: "rgba(20, 20, 18, 0.9)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#f5f5f0",
                                fontSize: "0.85rem",
                              }}
                            >
                              Yükleniyor...
                            </div>
                          )}
                        </div>

                        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.7rem", color: "#a1a1aa", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                              Başlık
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateGalleryTitle(item.id, e.target.value)}
                              style={{
                                width: "100%",
                                padding: "0.6rem 0.8rem",
                                borderRadius: "4px",
                                backgroundColor: "#141412",
                                border: "1px solid rgba(245, 245, 240, 0.12)",
                                color: "#f5f5f0",
                                fontSize: "0.9rem",
                                outline: "none",
                              }}
                            />
                          </div>

                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <label
                              htmlFor={`upload-grid-${item.id}`}
                              style={{
                                flex: 2,
                                textAlign: "center",
                                padding: "0.6rem",
                                borderRadius: "4px",
                                backgroundColor: "rgba(245, 245, 240, 0.04)",
                                border: "1px dashed rgba(245, 245, 240, 0.2)",
                                color: "#a1a1aa",
                                fontSize: "0.75rem",
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                cursor: "pointer",
                              }}
                            >
                              Görsel Seç
                            </label>
                            <input
                              id={`upload-grid-${item.id}`}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handlePhotoUpload(item.id, e.target.files[0])
                                }
                              }}
                            />
                            <button
                              onClick={() => deleteGallerySlot(item.id)}
                              style={{
                                flex: 1,
                                padding: "0.6rem",
                                borderRadius: "4px",
                                backgroundColor: "rgba(239, 68, 68, 0.12)",
                                border: "1px solid rgba(239, 68, 68, 0.25)",
                                color: "#f87171",
                                fontSize: "0.75rem",
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                cursor: "pointer",
                              }}
                            >
                              Sil
                            </button>
                          </div>

                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                            <button
                              onClick={() => moveGalleryItem(index, "left")}
                              disabled={index === 0}
                              style={{
                                flex: 1,
                                padding: "0.5rem",
                                borderRadius: "4px",
                                backgroundColor: "rgba(245, 245, 240, 0.05)",
                                border: "1px solid rgba(245, 245, 240, 0.1)",
                                color: "#f5f5f0",
                                fontSize: "0.75rem",
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                cursor: index === 0 ? "not-allowed" : "pointer",
                                opacity: index === 0 ? 0.3 : 1,
                              }}
                            >
                              ← Sola
                            </button>
                            <button
                              onClick={() => moveGalleryItem(index, "right")}
                              disabled={index === galleryItems.length - 1}
                              style={{
                                flex: 1,
                                padding: "0.5rem",
                                borderRadius: "4px",
                                backgroundColor: "rgba(245, 245, 240, 0.05)",
                                border: "1px solid rgba(245, 245, 240, 0.1)",
                                color: "#f5f5f0",
                                fontSize: "0.75rem",
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                cursor: index === galleryItems.length - 1 ? "not-allowed" : "pointer",
                                opacity: index === galleryItems.length - 1 ? 0.3 : 1,
                              }}
                            >
                              Sağa →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </AdminGuard>
  )
}

export default AdminPage
