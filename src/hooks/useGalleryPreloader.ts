import { useEffect } from 'react'
import { preloadGalleryAssets } from '../utils/preloadGalleryAssets'

export const useGalleryPreloader = (): void => {
  useEffect(() => {
    preloadGalleryAssets()
  }, [])
}
