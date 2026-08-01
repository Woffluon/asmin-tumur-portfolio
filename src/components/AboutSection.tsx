import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StoryCanvas from './StoryCanvas'
import '../styles/AboutSection.css'

gsap.registerPlugin(ScrollTrigger)

const story = [
  'Merhaba, ben Asmin.',
  'Markaların ve farklı hedefleri olan insanların ihtiyaç duyduğu fotoğraf ve video içeriklerini, tek bir doğruya bağlı kalmadan yorumluyorum.',
  'Model çekimleri, hayvanlar, sosyal medya, klipler ve kısa filmler. Her proje kendi diliyle konuşur.',
  'Ben o dili görünür kılarım. Çünkü iyi bir içerik, insanın işini kolaylaştırır.',
]

const sceneMotions = [
  {
    enter: { y: 64, rotateX: -38, z: -120, filter: 'blur(10px)', opacity: 0 },
    reveal: { y: 0, rotateX: 0, z: 0, filter: 'blur(0px)', opacity: 1 },
    exit: { y: -50, rotateX: 28, z: -80, filter: 'blur(8px)', opacity: 0 },
    stagger: 0.022,
  },
  {
    enter: { x: -80, skewX: -10, z: -90, filter: 'blur(8px)', opacity: 0 },
    reveal: { x: 0, skewX: 0, z: 0, filter: 'blur(0px)', opacity: 1 },
    exit: { x: 75, skewX: 8, z: -70, filter: 'blur(8px)', opacity: 0 },
    stagger: { each: 0.018, from: 'start' },
  },
  {
    enter: { scale: 0.82, rotateZ: 4, z: -140, filter: 'blur(12px)', opacity: 0 },
    reveal: { scale: 1, rotateZ: 0, z: 0, filter: 'blur(0px)', opacity: 1 },
    exit: { scale: 1.15, rotateZ: -3, z: 80, filter: 'blur(8px)', opacity: 0 },
    stagger: 0.018,
  },
  {
    enter: { y: 70, scale: 0.9, z: -100, filter: 'blur(12px)', opacity: 0 },
    reveal: { y: 0, scale: 1, z: 0, filter: 'blur(0px)', opacity: 1 },
    exit: {},
    stagger: { each: 0.024, from: 'center' },
  },
] as const

const StoryWords = ({ text }: { text: string }) => (
  <>
    {text.split(/(\s+)/).map((part, index) => (
      part.trim()
        ? <span className="story-word" key={`${part}-${index}`}>{part}</span>
        : part
    ))}
  </>
)

const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const storyScenes = useMemo(() => story, [])
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const nav = document.querySelector<HTMLElement>('.nav')

    if (!section || !stage || reduceMotion) return

    const setStoryNavigation = (hidden: boolean) => {
      if (!nav) return
      gsap.killTweensOf(nav)
      nav.classList.toggle('nav--story-hidden', hidden)
      gsap.to(nav, {
        y: hidden ? -110 : 0,
        opacity: hidden ? 0 : 1,
        duration: hidden ? 0.45 : 0.65,
        ease: hidden ? 'power4.in' : 'power4.out',
        overwrite: 'auto',
      })
    }

    const ctx = gsap.context(() => {
      const scenes = gsap.utils.toArray<HTMLElement>('.story-scene')
      const scrollHint = section.querySelector<HTMLElement>('.story-scroll-hint')

      gsap.set(scenes, { visibility: 'hidden' })
      gsap.set(scenes[0], { visibility: 'visible' })
      if (scrollHint) {
        gsap.set(scrollHint, { clipPath: 'inset(100% 0% 0% 0%)', y: 16 })
      }
      scenes.forEach((scene, index) => {
        gsap.set(scene.querySelectorAll<HTMLElement>('.story-word'), sceneMotions[index].enter)
      })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          pin: stage,
          scrub: 1.0,
          anticipatePin: 1,
          onEnter: () => setStoryNavigation(true),
          onEnterBack: () => setStoryNavigation(true),
          onLeave: () => setStoryNavigation(false),
          onLeaveBack: () => setStoryNavigation(false),
        },
      })

      if (scrollHint) {
        timeline
          .to(scrollHint, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.35, ease: 'power2.out' }, 0.05)
          .to(scrollHint, { clipPath: 'inset(0% 0% 100% 0%)', y: -12, duration: 0.3, ease: 'power2.in' }, 1.1)
      }

      scenes.forEach((scene, index) => {
        const start = index * 2.4
        const words = scene.querySelectorAll<HTMLElement>('.story-word')
        const motion = sceneMotions[index]

        timeline.to(words, {
          ...motion.reveal,
          duration: 0.78,
          stagger: motion.stagger,
          ease: 'power3.out',
        }, start)

        if (index < scenes.length - 1) {
          timeline.to(words, {
            ...motion.exit,
            duration: 0.58,
            stagger: 0.012,
            ease: 'power2.in',
          }, start + 1.55)

          timeline.set(scene, { visibility: 'hidden' }, start + 2.2)
          timeline.set(scenes[index + 1], { visibility: 'visible' }, start + 2.22)
        }
      })
    }, section)

    return () => {
      setStoryNavigation(false)
      ctx.revert()
    }
  }, [reduceMotion, storyScenes.length])

  return (
    <section ref={sectionRef} id="story" className="about-section" aria-label="Asmin Tumur hakkında">
      <div ref={stageRef} className="about-stage">
        {!reduceMotion && <StoryCanvas />}

        <p className="story-scroll-hint" aria-hidden="true">
          Hikâyeyi keşfetmek için kaydır <span className="scroll-hint-icon" aria-hidden="true">↓</span>
        </p>

        <div className="about-container">
          {storyScenes.map((text, index) => (
            <p
              className={`story-scene ${index === storyScenes.length - 1 ? 'story-scene--final' : ''}`}
              key={text}
            >
              <StoryWords text={text} />
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutSection





