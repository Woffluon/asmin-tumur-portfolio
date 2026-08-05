import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import heroCollection, { HeroCollectionItem } from '../heroCollection'
import '../styles/OpeningHero.css'

const OpeningHero = () => {
  const heroRef = useRef<HTMLElement>(null)

  // Map slots to helper
  const getSlot = (slotName: string): HeroCollectionItem => {
    return (
      heroCollection.find((item) => item.slot === slotName) || {
        id: slotName,
        slot: slotName,
        title: "Fotoğraf",
        category: "Portre",
        img: "/medias/1.webp",
      }
    )
  }

  const left1 = getSlot("left_1")
  const left2 = getSlot("left_2")
  const left3 = getSlot("left_3")
  const mainCenter = getSlot("main_center")
  const right1 = getSlot("right_1")
  const right2 = getSlot("right_2")
  const right3 = getSlot("right_3")

  useEffect(() => {
    if (!heroRef.current) return

    const previousOverflow = document.body.style.overflow
    let scrollLocked = false

    const ctx = gsap.context(() => {
      const navEl = document.querySelector('.nav')
      const isCompact = window.matchMedia('(max-width: 1023px)').matches
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const releaseScroll = () => {
        if (!scrollLocked) return
        document.body.style.overflow = previousOverflow
        navEl?.removeAttribute('inert')
        scrollLocked = false
      }

      if (reduceMotion) {
        gsap.set('.letter-wrapper, .item-copy-wrapper p', { y: 0 })
        gsap.set('.header-item-1', { left: 0, scale: 1 })
        gsap.set('.header-item-2', { right: 0, scale: 1 })
        gsap.set('.item-main .item-img img', {
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
          scale: 1,
        })
        gsap.set('.item-side .item-img', {
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
        })
        if (!isCompact) gsap.set('.header', { bottom: 0 })
        if (navEl) gsap.set(navEl, { y: 0, opacity: 1 })
        gsap.set('.hero-scroll-hint', { y: 0, opacity: 1 })
        return
      }

      gsap.set('.letter-wrapper', { y: 400 })
      gsap.set('.item-copy-wrapper p', { y: 50 })
      gsap.set('.hero-scroll-hint', { y: 12, opacity: 0 })
      if (navEl) gsap.set(navEl, { y: -100, opacity: 0 })
      document.body.style.overflow = 'hidden'
      navEl?.setAttribute('inert', '')
      scrollLocked = true

      const tl = gsap.timeline({
        paused: true,
        delay: 0.3,
        defaults: { duration: 1, ease: 'power3.out' },
        onComplete: releaseScroll,
      })

      tl.to('.letter-wrapper', {
        y: 0,
        stagger: 0.1,
      })

      if (isCompact) {
        const firstItem = heroRef.current?.querySelector<HTMLElement>('.header-item-1')
        const secondItem = heroRef.current?.querySelector<HTMLElement>('.header-item-2')

        gsap.set('.item-main .item-img img', { scale: 1 })

        const heroWidth = heroRef.current?.getBoundingClientRect().width

        if (firstItem && secondItem && heroWidth) {
          const heroCenter = heroWidth / 2
          const firstBounds = firstItem.getBoundingClientRect()
          const secondBounds = secondItem.getBoundingClientRect()

          gsap.set(firstItem, { x: heroCenter - firstBounds.right })
          gsap.set(secondItem, { x: heroCenter - secondBounds.left })
        }

        tl.to('.item-main .item-img img', {
            clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
            duration: 1.15,
          })
          .to('.header-item-1', { x: 0, scale: 1, duration: 1.15 }, '<')
          .to('.header-item-2', { x: 0, scale: 1, duration: 1.15 }, '<')
          .to('.item-copy-wrapper p', { y: 0, stagger: 0.05, duration: 0.7 })
      } else {
        tl.to('.header-item-1', { left: '12vw' })
          .to('.header-item-2', { right: '12vw' }, '<')
          .to('.item-main .item-img img', {
            clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
          }, '<')
          .to('.header-item-1', { left: 0, scale: 1 })
          .to('.header-item-2', { right: 0, scale: 1 }, '<')
          .to('.item-main .item-img img', { scale: 1 }, '<')
          .to('.item-side .item-img', {
            clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
            stagger: 0.1,
          }, '<')
          .to('.header', { bottom: '0' }, '<')
          .to('.item-copy-wrapper p', { y: 0, stagger: 0.05 }, '<')
      }

      if (navEl) {
        const navTween = { y: 0, opacity: 1, duration: 0.8 }

        tl.to(navEl, navTween)
      }

      tl.to('.hero-scroll-hint', { y: 0, opacity: 1, duration: 0.6 }, '<')

      tl.play()
    }, heroRef)

    return () => {
      if (scrollLocked) {
        document.body.style.overflow = previousOverflow
        document.querySelector('.nav')?.removeAttribute('inert')
      }
      ctx.revert()
    }
  }, [])

  const renderSideItem = (item: HeroCollectionItem) => (
    <div className="item item-side" key={item.id}>
      <div className="item-copy">
        <div className="item-copy-wrapper">
          <p>{item.title}</p>
        </div>
        <div className="item-copy-wrapper">
          <p>({item.category})</p>
        </div>
      </div>
      <div className="item-img">
        <picture>
          <source
            type="image/avif"
            srcSet={item.mobileImg?.replace('.webp', '.avif') + " 640w, " + item.tabletImg?.replace('.webp', '.avif') + " 1080w, " + item.img.replace('.webp', '.avif') + " 1920w"}
            sizes="(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1920px"
          />
          <source
            type="image/webp"
            srcSet={(item.mobileImg || item.img) + " 640w, " + (item.tabletImg || item.img) + " 1080w, " + item.img + " 1920w"}
            sizes="(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1920px"
          />
          <img
            src={item.img}
            alt={item.title}
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>
    </div>
  )

  return (
    <section ref={heroRef} className="opening-hero">
      <div className="container">
        <div className="items">
          {/* Left Column */}
          <div className="items-col">
            {renderSideItem(left1)}
            {renderSideItem(left2)}
            {renderSideItem(left3)}
          </div>

          {/* Main Featured Center Column */}
          <div className="items-col">
            <div className="item-main">
              <div className="item-copy">
                <div className="item-copy-wrapper">
                  <p>{mainCenter.title}</p>
                </div>
                <div className="item-copy-wrapper">
                  <p>({mainCenter.category})</p>
                </div>
              </div>
              <div className="item-img">
                <picture>
                  <source
                    type="image/avif"
                    srcSet={mainCenter.mobileImg?.replace('.webp', '.avif') + " 640w, " + mainCenter.tabletImg?.replace('.webp', '.avif') + " 1080w, " + mainCenter.img.replace('.webp', '.avif') + " 1920w"}
                    sizes="(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1920px"
                  />
                  <source
                    type="image/webp"
                    srcSet={(mainCenter.mobileImg || mainCenter.img) + " 640w, " + (mainCenter.tabletImg || mainCenter.img) + " 1080w, " + mainCenter.img + " 1920w"}
                    sizes="(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1920px"
                  />
                  <img
                    src={mainCenter.img}
                    alt={mainCenter.title}
                    loading="eager"
                    decoding="async"
                  />
                </picture>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="items-col">
            {renderSideItem(right1)}
            {renderSideItem(right2)}
            {renderSideItem(right3)}
          </div>
        </div>

        <h1 className="header">
          <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
            Asmin Tumur — Profesyonel Fotoğrafçı
          </span>
          <div className="header-item header-item-1" aria-hidden="true">
            <div className="letter"><div className="letter-wrapper">A</div></div>
            <div className="letter"><div className="letter-wrapper">S</div></div>
            <div className="letter"><div className="letter-wrapper">M</div></div>
            <div className="letter"><div className="letter-wrapper">İ</div></div>
            <div className="letter"><div className="letter-wrapper">N</div></div>
          </div>
          <div className="header-item header-item-2" aria-hidden="true">
            <div className="letter"><div className="letter-wrapper">T</div></div>
            <div className="letter"><div className="letter-wrapper">U</div></div>
            <div className="letter"><div className="letter-wrapper">M</div></div>
            <div className="letter"><div className="letter-wrapper">U</div></div>
            <div className="letter"><div className="letter-wrapper">R</div></div>
          </div>
        </h1>

        <p className="hero-scroll-hint" aria-hidden="true">
          Devam etmek için kaydır <span className="scroll-hint-icon" aria-hidden="true">↓</span>
        </p>
      </div>
    </section>
  )
}

export default OpeningHero
