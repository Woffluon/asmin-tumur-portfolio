import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../styles/ContactSection.css'

gsap.registerPlugin(ScrollTrigger)

const ContactSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'failed'>('idle')
  const email = 'asmntmr@gmail.com'

  useEffect(() => {
    if (!sectionRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-reveal',
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const copyEmail = () => {
    if (!navigator.clipboard) {
      setCopyState('failed')
      window.setTimeout(() => setCopyState('idle'), 3000)
      return
    }

    navigator.clipboard
      .writeText(email)
      .then(() => {
        setCopyState('success')
        window.setTimeout(() => setCopyState('idle'), 2400)
      })
      .catch(() => {
        setCopyState('failed')
        window.setTimeout(() => setCopyState('idle'), 3000)
      })
  }

  return (
    <section id="contact" className="contact-section" ref={sectionRef}>
      <div className="contact-section__inner">
        <p className="contact-availability contact-reveal">
          Yeni iş birlikleri ve sergiler için açık.
        </p>

        <div className="contact-main contact-reveal">
          <h2>İletişim</h2>
          <p>Proje, çekim talepleri ve sergi iş birlikleri için yazabilirsiniz.</p>
        </div>

        <div className="contact-email-row contact-reveal">
          <a href={`mailto:${email}`} className="contact-email">
            {email}
          </a>
          <button type="button" onClick={copyEmail} aria-live="polite">
            {copyState === 'success'
              ? 'Adres kopyalandı'
              : copyState === 'failed'
              ? 'E-posta bağlantısını kullanın'
              : 'Adresi kopyala'}{' '}
            <span aria-hidden="true">↗</span>
          </button>
        </div>

        <div className="contact-channels contact-reveal">
          <a
            href="https://www.instagram.com/broke_.photographer/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Instagram</span>
            <span>@broke_.photographer ↗</span>
          </a>
          <span className="contact-location">İzmir, Türkiye</span>
        </div>

        <div className="contact-footer contact-reveal">
          <a
            className="contact-credit"
            href="https://xn--efearabac-3pb.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Efe Arabacı tarafından yapıldı ↗
          </a>
          <nav aria-label="Footer navigasyonu">
            <Link to="/galeri">Galeri</Link>
            <a href="#story">Hikâye</a>
            <a href="#contact">İletişim</a>
          </nav>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
