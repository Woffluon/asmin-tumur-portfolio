import { useCallback, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import collection from '../collection'
import '../styles/Gallery.css'

type EngineApi = {
  open: (index: number) => void
  close: () => void
  move: (offset: number) => void
  zoom: (amount: number) => void
}

interface GalleryEngineProps {
  galleryRef: React.RefObject<HTMLDivElement | null>
  galleryContainerRef: React.RefObject<HTMLDivElement | null>
  titleContainerRef: React.RefObject<HTMLDivElement | null>
  onReady: (api: EngineApi) => void
  onState: (active: boolean, index: number, zoom: number) => void
}

const GalleryEngine: React.FC<GalleryEngineProps> = ({
  galleryRef,
  galleryContainerRef,
  titleContainerRef,
  onReady,
  onState,
}) => {
  useEffect(() => {
    gsap.registerPlugin(SplitText)

    const gallery = galleryRef.current
    const galleryContainer = galleryContainerRef.current
    const titleContainer = titleContainerRef.current
    if (!gallery || !galleryContainer || !titleContainer) return

    const cards: HTMLElement[] = []
    const states: {
      angle: number
      cr: number
      tr: number
      cx: number
      tx: number
      cy: number
      ty: number
      cs: number
      ts: number
    }[] = []

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const config = {
      imageCount: collection.length,
      radius: 275,
      sensitivity: 500,
      effectFalloff: 250,
      cardMoveAmount: 50,
      lerpFactor: 0.15,
      isMobile: window.innerWidth < 1000,
    }

    const parallax = { tx: 0, ty: 0, tz: 0, x: 0, y: 0, z: 0 }
    let active = false
    let transitioning = false
    let intro = false
    let current = 0
    let zoomLevel = 1
    let introTl: gsap.core.Timeline | null = null
    let currentTitle: HTMLParagraphElement | null = null

    const baseScale = (width = window.innerWidth) =>
      width < 768 ? 0.6 : width < 1200 ? 0.8 : 1

    const resetTargets = () =>
      states.forEach((s) => {
        s.tr = 0
        s.ts = 1
        s.tx = 0
        s.ty = 0
      })

    const cardX = (i: number) => config.radius * Math.cos(states[i].angle)
    const cardY = (i: number) => config.radius * Math.sin(states[i].angle)
    const cardRotation = (i: number) => (states[i].angle * 180) / Math.PI + 90

    const renderTitle = (index: number) => {
      if (currentTitle) currentTitle.remove()

      const title = document.createElement('p')
      title.textContent = collection[index % collection.length].title
      titleContainer.appendChild(title)
      currentTitle = title

      const words = new SplitText(title, { type: 'words', wordsClass: 'word' }).words
      gsap.set(words, { y: '125%' })
      gsap.to(words, {
        y: '0%',
        duration: 0.75,
        delay: 1.05,
        stagger: 0.1,
        ease: 'power4.out',
      })
    }

    const position = (index: number, opening = false) => {
      current = (index + cards.length) % cards.length
      transitioning = true
      active = true
      zoomLevel = 1
      resetTargets()

      const angle = states[current].angle
      let rotation = Math.PI * 1.5 - angle
      if (rotation > Math.PI) rotation -= Math.PI * 2
      if (rotation < -Math.PI) rotation += Math.PI * 2

      gsap.to(gallery, {
        onStart: () =>
          cards.forEach((card, i) =>
            gsap.to(card, {
              x: cardX(i),
              y: cardY(i),
              rotationY: 0,
              scale: 1,
              duration: 1.25,
              ease: 'power4.out',
            })
          ),
        scale: 5,
        y: 1300,
        rotation: (rotation * 180) / Math.PI + 360,
        duration: opening ? 2 : 1.25,
        ease: 'power4.inOut',
        onComplete: () => {
          transitioning = false
          onState(true, current, zoomLevel)
        },
      })

      gsap.to(parallax, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () =>
          gsap.set(galleryContainer, {
            rotateX: parallax.x,
            rotateY: parallax.y,
            rotation: parallax.z,
          }),
      })

      renderTitle(current)
      onState(true, current, zoomLevel)
    }

    const open = (index: number) => {
      if (!intro && !transitioning) position(index, !active)
    }

    const close = () => {
      if (!active || transitioning || intro) return
      transitioning = true

      if (currentTitle) {
        const words = currentTitle.querySelectorAll('.word')
        gsap.to(words, {
          y: '-125%',
          duration: 0.75,
          stagger: 0.1,
          ease: 'power4.out',
          onComplete: () => {
            currentTitle?.remove()
            currentTitle = null
          },
        })
      }

      gsap.to(gallery, {
        scale: baseScale(),
        y: 0,
        x: 0,
        rotation: 0,
        duration: 2.5,
        ease: 'power4.inOut',
        onComplete: () => {
          active = false
          transitioning = false
          zoomLevel = 1
          Object.assign(parallax, { tx: 0, ty: 0, tz: 0, x: 0, y: 0, z: 0 })
          onState(false, current, 1)
        },
      })
    }

    const move = (offset: number) => {
      if (active && !transitioning && zoomLevel === 1) position(current + offset)
    }

    const zoom = (amount: number) => {
      if (!active || transitioning) return
      const next = Math.min(2.4, Math.max(1, Number((zoomLevel + amount).toFixed(1))))
      if (next === zoomLevel) return

      zoomLevel = next
      gsap.to(gallery, {
        scale: 5 * zoomLevel,
        y: 1300 * zoomLevel,
        duration: 0.7,
        ease: 'power3.out',
      })
      onState(true, current, zoomLevel)
    }

    // Clear previous DOM nodes safely
    while (gallery.firstChild) gallery.removeChild(gallery.firstChild)
    while (titleContainer.firstChild) titleContainer.removeChild(titleContainer.firstChild)

    // Build cards using safe DOM operations without innerHTML
    for (let i = 0; i < config.imageCount; i += 1) {
      const angle = (i / config.imageCount) * Math.PI * 2
      const card = document.createElement('div')
      const item = collection[i % collection.length]

      card.className = 'card'
      card.setAttribute('aria-hidden', 'true')

      const img = document.createElement('img')
      img.src = item.img
      img.alt = item.title || ''
      img.loading = 'lazy'
      img.decoding = 'async'
      card.appendChild(img)

      gsap.set(card, {
        x: config.radius * Math.cos(angle),
        y: config.radius * Math.sin(angle),
        rotation: (angle * 180) / Math.PI + 90,
        transformPerspective: 800,
        transformOrigin: 'center center',
      })

      gallery.appendChild(card)
      cards.push(card)
      states.push({
        angle,
        cr: 0,
        tr: 0,
        cx: 0,
        tx: 0,
        cy: 0,
        ty: 0,
        cs: 1,
        ts: 1,
      })
    }

    const playIntro = () => {
      intro = true
      const vw = window.innerWidth
      const vh = window.innerHeight
      const mobile = config.isMobile
      const gap = mobile ? 54 : 84
      const lineY = mobile ? 140 : 220

      gsap.set(gallery, { scale: mobile ? baseScale() * 0.75 : baseScale() })
      cards.forEach((card, i) =>
        gsap.set(card, {
          x: (Math.random() - 0.5) * vw * (mobile ? 0.95 : 0.85),
          y: (Math.random() - 0.5) * vh * (mobile ? 0.75 : 0.55),
          opacity: mobile ? 1 : 0,
          rotationY: 0,
          rotation: cardRotation(i),
          scale: mobile ? 0.92 : 0.95,
        })
      )

      introTl = gsap.timeline({ defaults: { ease: 'power3.inOut' } }).timeScale(0.55)
      if (mobile) introTl.to(gallery, { scale: baseScale(), duration: 3.1 }, 0)
      if (!mobile)
        introTl.to(cards, {
          opacity: 1,
          duration: 0.55,
          stagger: 0.02,
          ease: 'power2.out',
        })

      introTl
        .to(
          cards,
          {
            duration: mobile ? 1.55 : 1.35,
            stagger: mobile ? 0.022 : 0.03,
            x: (i: number) => -((cards.length - 1) * gap) / 2 + i * gap,
            y: lineY,
            scale: 1,
            rotationY: 0,
            rotation: 0,
          },
          mobile ? 0 : '<.05'
        )
        .to(
          cards,
          {
            duration: mobile ? 1.75 : 1.45,
            stagger: mobile ? 0.015 : 0.02,
            x: (i: number) => cardX(i),
            y: (i: number) => cardY(i),
            rotation: (i: number) => cardRotation(i),
            ease: 'power4.inOut',
          },
          '>-0.15'
        )
        .eventCallback('onComplete', () => {
          gsap.set(gallery, { scale: baseScale() })
          intro = false
          resetTargets()
        })
    }

    const mousemove = (event: MouseEvent) => {
      if (active || transitioning || intro || config.isMobile || prefersReducedMotion)
        return

      const px = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2)
      const py = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2)

      parallax.ty = px * 15
      parallax.tx = -py * 15
      parallax.tz = (px + py) * 5

      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect()
        const dx = event.clientX - rect.left - rect.width / 2
        const dy = event.clientY - rect.top - rect.height / 2
        const distance = Math.hypot(dx, dy)
        const factor =
          distance < config.sensitivity
            ? Math.max(0, 1 - distance / config.effectFalloff)
            : 0

        states[i].tr = 180 * factor
        states[i].ts = 1 + 0.3 * factor
        states[i].tx = config.cardMoveAmount * factor * Math.cos(states[i].angle)
        states[i].ty = config.cardMoveAmount * factor * Math.sin(states[i].angle)
      })
    }

    const keydown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (event.key === 'Escape') close()
      if (event.key === 'ArrowLeft') move(-1)
      if (event.key === 'ArrowRight') move(1)
      if (event.key === '+' || event.key === '=') zoom(0.2)
      if (event.key === '-') zoom(-0.2)
    }

    const resize = () => {
      config.isMobile = window.innerWidth < 1000
      if (!active && !intro) gsap.set(gallery, { scale: baseScale() })
    }

    window.addEventListener('mousemove', mousemove)
    window.addEventListener('keydown', keydown)
    window.addEventListener('resize', resize)

    onReady({ open, close, move, zoom })
    resize()

    if (!prefersReducedMotion) {
      gsap.delayedCall(0, playIntro)
    } else {
      gsap.set(gallery, { scale: baseScale() })
      cards.forEach((card, i) =>
        gsap.set(card, {
          x: cardX(i),
          y: cardY(i),
          rotation: cardRotation(i),
          scale: 1,
          opacity: 1,
        })
      )
    }

    let frame = 0
    const animate = () => {
      if (!active && !transitioning && !intro && !prefersReducedMotion) {
        parallax.x += (parallax.tx - parallax.x) * config.lerpFactor
        parallax.y += (parallax.ty - parallax.y) * config.lerpFactor
        parallax.z += (parallax.tz - parallax.z) * config.lerpFactor

        gsap.set(galleryContainer, {
          rotateX: parallax.x,
          rotateY: parallax.y,
          rotation: parallax.z,
        })

        states.forEach((s, i) => {
          s.cr += (s.tr - s.cr) * config.lerpFactor
          s.cs += (s.ts - s.cs) * config.lerpFactor
          s.cx += (s.tx - s.cx) * config.lerpFactor
          s.cy += (s.ty - s.cy) * config.lerpFactor

          gsap.set(cards[i], {
            x: cardX(i) + s.cx,
            y: cardY(i) + s.cy,
            rotationY: s.cr,
            scale: s.cs,
            rotation: cardRotation(i),
            transformPerspective: 1000,
          })
        })
      }
      frame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      introTl?.kill()
      window.removeEventListener('mousemove', mousemove)
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('resize', resize)
      gsap.killTweensOf([gallery, ...cards, parallax])
    }
  }, [galleryRef, galleryContainerRef, titleContainerRef, onReady, onState])

  return null
}

const Gallery = () => {
  const api = useRef<EngineApi | null>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const galleryContainerRef = useRef<HTMLDivElement>(null)
  const titleContainerRef = useRef<HTMLDivElement>(null)

  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(1)

  const canMove = zoom === 1
  const onReady = useCallback((engine: EngineApi) => {
    api.current = engine
  }, [])

  const onState = useCallback(
    (isActive: boolean, currentIndex: number, currentZoom: number) => {
      setActive(isActive)
      setIndex(currentIndex)
      setZoom(currentZoom)
    },
    []
  )

  return (
    <div className={`gallery-page-container ${active ? 'is-inspecting' : ''}`}>
      <Helmet>
        <title>Galeri — Asmin Tumur Fotoğraf Portfolyosu</title>
        <meta name="description" content="Asmin Tumur fotoğraf galerisi. Portre, mimari ve sokak karelerinden oluşan interaktif eser seçkisi." />
        <link rel="canonical" href="https://asmintumur.com/galeri" />
        <meta property="og:title" content="Galeri — Asmin Tumur Fotoğraf Portfolyosu" />
        <meta property="og:description" content="Portre, mimari ve sokak karelerinden oluşan interaktif eser seçkisi." />
        <meta property="og:url" content="https://asmintumur.com/galeri" />
      </Helmet>
      <main className="gallery-stage">
        <div ref={galleryContainerRef} className="gallery-container">
          <div ref={galleryRef} className="gallery" />
        </div>
        <div ref={titleContainerRef} className="title-container" />

        <button
          className="gallery-inspect-toggle"
          type="button"
          onClick={() => (active ? api.current?.close() : api.current?.open(index))}
          aria-pressed={active}
        >
          {active ? 'İncelemeyi kapat' : 'Fotoğrafları incele'}{' '}
          <span aria-hidden="true">{active ? '×' : '↗'}</span>
        </button>

        <footer className="gallery-footer">
          <p>
            A visual study by{' '}
            <a
              href="https://xn--efearabac-3pb.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Efe Arabacı
            </a>
          </p>
        </footer>

        {active && (
          <div className="gallery-controls" aria-label="Fotoğraf kontrolleri">
            <div className="gallery-keyboard-hint" aria-hidden="true">
              <span>[←] [→] Gezin | [ESC] Kapat</span>
            </div>
            <div className="gallery-zoom-controls">
              <button
                type="button"
                onClick={() => api.current?.zoom(-0.2)}
                disabled={zoom <= 1}
                aria-label="Fotoğrafı küçült"
              >
                −
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => api.current?.zoom(0.2)}
                disabled={zoom >= 2.4}
                aria-label="Fotoğrafı büyüt"
              >
                +
              </button>
            </div>
            <div className="gallery-controls-divider" aria-hidden="true" />
            <div className="gallery-arrow-controls">
              <button
                type="button"
                onClick={() => api.current?.move(-1)}
                disabled={!canMove}
                aria-label="Önceki fotoğraf"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => api.current?.move(1)}
                disabled={!canMove}
                aria-label="Sonraki fotoğraf"
              >
                →
              </button>
            </div>
          </div>
        )}
      </main>

      <GalleryEngine
        galleryRef={galleryRef}
        galleryContainerRef={galleryContainerRef}
        titleContainerRef={titleContainerRef}
        onReady={onReady}
        onState={onState}
      />
    </div>
  )
}

export default Gallery
