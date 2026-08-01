import collection from '../collection'

// Global memory cache to prevent duplicate network fetches across session
const preloadedUrls = new Set<string>()

interface NetworkInformation extends EventTarget {
  saveData?: boolean
  effectiveType?: string
}

const isLowPerformanceNetwork = (): boolean => {
  if (typeof navigator === 'undefined') return false

  const nav = navigator as Navigator & { connection?: NetworkInformation }
  if (!nav.connection) return false

  if (nav.connection.saveData === true) return true
  if (nav.connection.effectiveType === '2g' || nav.connection.effectiveType === 'slow-2g') {
    return true
  }

  return false
}

const preloadSingleImage = (url: string): Promise<void> => {
  if (preloadedUrls.has(url)) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    preloadedUrls.add(url)

    const img = new Image()
    img.decoding = 'async'
    if ('fetchPriority' in img) {
      ;(img as HTMLImageElement & { fetchPriority: string }).fetchPriority = 'low'
    }

    img.onload = () => resolve()
    img.onerror = () => resolve() // Fail gracefully without breaking queue
    img.src = url
  })
}

/**
 * Preloads all 23 photo gallery assets and variants in a low-priority background queue.
 * Respects network data-saver settings and idle CPU time.
 */
export const preloadGalleryAssets = (): void => {
  if (typeof window === 'undefined' || isLowPerformanceNetwork()) return

  // Build complete list of all images used in gallery (main img + responsive variants)
  const urlsToPreload: string[] = []

  collection.forEach((item) => {
    if (item.img && !preloadedUrls.has(item.img)) {
      urlsToPreload.push(item.img)
    }
    if (item.mobileImg && !preloadedUrls.has(item.mobileImg)) {
      urlsToPreload.push(item.mobileImg)
    }
    if (item.tabletImg && !preloadedUrls.has(item.tabletImg)) {
      urlsToPreload.push(item.tabletImg)
    }
  })

  if (urlsToPreload.length === 0) return

  const runQueue = () => {
    const CONCURRENCY = 4
    let index = 0

    const nextBatch = () => {
      if (index >= urlsToPreload.length) return

      const batch = urlsToPreload.slice(index, index + CONCURRENCY)
      index += CONCURRENCY

      Promise.all(batch.map(preloadSingleImage)).then(() => {
        scheduleIdle(nextBatch)
      })
    }

    nextBatch()
  }

  scheduleIdle(runQueue)
}

const scheduleIdle = (callback: () => void): void => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => callback(), { timeout: 3000 })
  } else {
    setTimeout(callback, 200)
  }
}

