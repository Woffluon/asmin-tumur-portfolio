import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import collection from '../collection'
import '../styles/EditorialGallery.css'

gsap.registerPlugin(ScrollTrigger)

const EditorialGallery = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.editorial-teaser__thumb',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.7,
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

  return (
    <section id="gallery" className="editorial-section" ref={sectionRef}>
      <div className="editorial-content">
        <h2>Fotoğraf Koleksiyonu</h2>

        <div className="editorial-meta-row">
          <p className="editorial-copy">
            Çalışmaların tamamını 3B sergi alanında incelemek için önizleme görsellerine tıklayın.
          </p>
        </div>

        <Link
          to="/galeri"
          className="editorial-teaser"
          aria-label="Galeriye git - fotoğrafları 3B koleksiyonda incele"
        >
          <div className="editorial-teaser__grid">
            {collection.slice(0, 7).map((item, index) => (
              <div key={item.img} className="editorial-teaser__thumb">
                <img
                  src={item.img}
                  alt={item.title ? `Fotoğraf: ${item.title}` : `Koleksiyon fotoğrafı ${index + 1}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </Link>

        <Link className="editorial-link" to="/galeri">
          <span>Fotoğraf Galerisine Git</span>
          <span className="editorial-link-icon" aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  )
}

export default EditorialGallery
