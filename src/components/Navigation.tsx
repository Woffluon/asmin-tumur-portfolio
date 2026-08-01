import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../styles/Navigation.css'

declare module 'react' {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    inert?: string | boolean
  }
}

gsap.registerPlugin(CustomEase, ScrollTrigger)

if (!CustomEase.get('jump')) {
  CustomEase.create('jump', '0.85, 0, 0.15, 1')
}

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navRootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleBtnRef = useRef<HTMLButtonElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  // Prevent body scroll & toggle nav-open class when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    document.body.classList.toggle('nav-open', isMenuOpen)
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('nav-open')
    }
  }, [isMenuOpen])

  // Scroll trigger for nav background
  useEffect(() => {
    const navEl = navRootRef.current?.querySelector<HTMLElement>('.nav')
    if (!navEl || location.pathname !== '/') return

    const trigger = ScrollTrigger.create({
      start: 'top -70',
      onEnter: () => navEl.classList.add('nav--scrolled'),
      onLeaveBack: () => navEl.classList.remove('nav--scrolled'),
    })

    return () => {
      trigger.kill()
      navEl.classList.remove('nav--scrolled')
    }
  }, [location.pathname])

  // GSAP animation context for scoped selectors
  useEffect(() => {
    if (!navRootRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onStart: () => {
          menuRef.current?.classList.add('active')
        },
        onReverseComplete: () => {
          menuRef.current?.classList.remove('active')
        },
      })

      tl.to(
        '.menu__bg-box--left, .menu__bg-box--right',
        { rotate: 0, duration: 0.9, ease: 'jump' },
        0
      ).to(
        '.menu__column .menu__link',
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 },
        0.35
      )

      tlRef.current = tl
    }, navRootRef)

    return () => ctx.revert()
  }, [])

  // Play/Reverse timeline on menu toggle
  useEffect(() => {
    if (tlRef.current) {
      if (isMenuOpen) {
        tlRef.current.play()
      } else {
        tlRef.current.reverse()
      }
    }
  }, [isMenuOpen])

  // Keydown listener for Escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
        toggleBtnRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const handleNavigationClick = (
    e: React.MouseEvent,
    target: string,
    isExternal = false
  ) => {
    if (isExternal) {
      setIsMenuOpen(false)
      return
    }

    e.preventDefault()
    setIsMenuOpen(false)

    setTimeout(() => {
      if (target.startsWith('#')) {
        if (location.pathname !== '/') {
          navigate(`/${target}`)
        } else {
          const el = document.querySelector(target)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }
      } else {
        navigate(target)
      }
    }, 600)
  }

  return (
    <div ref={navRootRef}>
      <nav className={`nav ${location.pathname === '/galeri' ? 'nav--visible nav--gallery' : ''}`}>
        <div className="nav__inner">
          <Link
            to="/"
            className="nav__logo"
            onClick={(e) => handleNavigationClick(e, '/')}
          >
            Asmin Tumur
          </Link>

          <button
            ref={toggleBtnRef}
            className={`nav__btn-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={handleToggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            aria-label={isMenuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
          >
            <div className="toggle-icon">
              <span className="bar bar-1"></span>
              <span className="bar bar-2"></span>
            </div>
            <span className="toggle-text">{isMenuOpen ? 'KAPAT' : 'MENÜ'}</span>
          </button>
        </div>
      </nav>

      <div
        id="site-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigasyon Menüsü"
        className="menu"
        inert={!isMenuOpen ? ('' as unknown as boolean) : undefined}
      >
        <div className="menu__bg">
          <div className="menu__bg-side menu__bg-side--left">
            <div className="menu__bg-box menu__bg-box--left"></div>
          </div>
          <div className="menu__bg-side menu__bg-side--right">
            <div className="menu__bg-box menu__bg-box--right"></div>
          </div>
        </div>

        <div className="menu__content">
          <div className="menu__column">
            <a
              href="/"
              className="menu__link"
              onClick={(e) => handleNavigationClick(e, '/')}
            >
              Ana Sayfa
            </a>
            <a
              href="/galeri"
              className="menu__link"
              onClick={(e) => handleNavigationClick(e, '/galeri')}
            >
              Galeri
            </a>
            <a
              href="#gallery"
              className="menu__link"
              onClick={(e) => handleNavigationClick(e, '#gallery')}
            >
              Sergi
            </a>
            <a
              href="#story"
              className="menu__link"
              onClick={(e) => handleNavigationClick(e, '#story')}
            >
              Hikaye
            </a>
          </div>

          <div className="menu__column">
            <a
              href="#contact"
              className="menu__link"
              onClick={(e) => handleNavigationClick(e, '#contact')}
            >
              İletişim
            </a>
            <a
              href="https://www.instagram.com/broke_.photographer/"
              target="_blank"
              rel="noopener noreferrer"
              className="menu__link"
              onClick={(e) => handleNavigationClick(e, 'https://www.instagram.com/broke_.photographer/', true)}
            >
              Instagram
            </a>
            <a
              href="mailto:asmntmr@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="menu__link"
              onClick={(e) => handleNavigationClick(e, 'mailto:asmntmr@gmail.com', true)}
            >
              E-Posta
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navigation
