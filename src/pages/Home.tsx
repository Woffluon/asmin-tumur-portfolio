import { Helmet } from 'react-helmet-async'
import OpeningHero from '../components/OpeningHero'
import AboutSection from '../components/AboutSection'
import EditorialGallery from '../components/EditorialGallery'
import ContactSection from '../components/ContactSection'
import { useGalleryPreloader } from '../hooks/useGalleryPreloader'
import '../styles/Home.css'

const photographerSchema = {
  '@context': 'https://schema.org',
  '@type': 'Photographer',
  'name': 'Asmin Tumur',
  'jobTitle': 'Profesyonel Fotoğrafçı',
  'url': 'https://asmintumur.com/',
  'image': 'https://asmintumur.com/medias/1.webp',
  'sameAs': [
    'https://www.instagram.com/broke_.photographer/'
  ],
  'knowsAbout': [
    'Portre Fotoğrafçılığı',
    'Mimari Fotoğrafçılık',
    'Sokak Fotoğrafçılığı',
    'Kentsel Görsel Sanatlar'
  ],
  'address': {
    '@type': 'PostalAddress',
    'addressCountry': 'TR'
  }
}

const Home = () => {
  useGalleryPreloader()

  return (
    <>
      <Helmet>
        <title>Asmin Tumur — Fotoğraf Portfolyosu</title>
        <meta name="description" content="Asmin Tumur'un portre, mimari ve sokak çalışmalarından oluşan fotoğraf portfolyosu." />
        <link rel="canonical" href="https://asmintumur.com/" />
        <meta property="og:title" content="Asmin Tumur — Fotoğraf Portfolyosu" />
        <meta property="og:description" content="Asmin Tumur'un portre, mimari ve sokak çalışmalarından oluşan fotoğraf portfolyosu." />
        <meta property="og:url" content="https://asmintumur.com/" />
        <script type="application/ld+json">
          {JSON.stringify(photographerSchema)}
        </script>
      </Helmet>
      <main className="home-main-wrapper">
        <OpeningHero />
        <AboutSection />
        <EditorialGallery />
        <ContactSection />
      </main>
    </>
  )
}

export default Home
