import { useState, useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import KhananLogo from '../shared/KhananLogo'

export function StartupIntro() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isLogoFrame, setIsLogoFrame] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Check if we should skip
    const urlParams = new URLSearchParams(window.location.search)
    const shouldSkip = urlParams.get('skipIntro') === 'true'
    // Temporarily disable the sessionStorage check so it plays on every refresh for testing
    // const hasPlayed = sessionStorage.getItem('khanan_intro_played') === 'true'

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReducedMotion(prefersReducedMotion)

    if (shouldSkip) {
      setIsVisible(false)
      return
    }

    // Set flag so it doesn't play again this session
    sessionStorage.setItem('khanan_intro_played', 'true')

    // Prevent body scroll while visible
    document.body.style.overflow = 'hidden'

    if (prefersReducedMotion) {
      // Reduced motion fallback: show static logo, then fade
      const timer = setTimeout(() => {
        completeIntro()
      }, 1500)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ''
      }
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const completeIntro = () => {
    setIsFadingOut(true)
    setTimeout(() => {
      setIsVisible(false)
      document.body.style.overflow = ''
    }, 800) // 800ms fade duration
  }

  const handleVideoEnded = () => {
    completeIntro()
  }

  const handleVideoError = () => {
    // If video fails, fail gracefully and immediately show dashboard
    console.warn('Startup video failed to load, skipping intro.')
    setIsVisible(false)
    document.body.style.overflow = ''
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] bg-brand-charcoal flex items-center justify-center',
        'transition-opacity duration-[800ms] ease-in-out',
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
    >
      {reducedMotion ? (
        <KhananLogo variant="full" size="lg" tone="onDark" className="animate-pulse" />
      ) : (
        <>
          {/* BACKGROUND LAYER: Visibly clear cinematic extension */}
          <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
            <video
              src="/videos/khanan-drishti-intro.mp4"
              autoPlay
              muted
              playsInline
              className={cn(
                "w-full h-full object-cover scale-[1.04] transition-all duration-1000",
                isLogoFrame 
                  ? "blur-[15px] brightness-[0.35]" 
                  : "blur-[8px] brightness-[0.78] saturate-[0.9]"
              )}
            />
            {/* Subtle radial vignette instead of heavy black overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(15,20,25,0.4)_100%)]" />
          </div>

          {/* FOREGROUND LAYER: Perfectly scaled 16:9 wrapper with soft feathered mask */}
          <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">
            <div 
              className="relative flex items-center justify-center aspect-video w-full"
              style={{
                maxHeight: '100vh',
                maxWidth: 'min(100vw, 177.78vh)', // 16/9 aspect ratio bounding box
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, rgba(0,0,0,0.8) 78%, rgba(0,0,0,0.4) 88%, transparent 98%)',
                maskImage: 'radial-gradient(ellipse at center, black 60%, rgba(0,0,0,0.8) 78%, rgba(0,0,0,0.4) 88%, transparent 98%)'
              }}
            >
              <video
                ref={videoRef}
                src="/videos/khanan-drishti-intro.mp4"
                autoPlay
                muted
                playsInline
                onTimeUpdate={(e) => {
                  const video = e.currentTarget;
                  // Transition the background in the final 1.5 seconds when logo appears
                  if (video.duration && video.currentTime >= video.duration - 1.5) {
                    setIsLogoFrame(true);
                  }
                }}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* SKIP BUTTON */}
          <button
            onClick={completeIntro}
            className="absolute bottom-6 right-6 text-brand-amber/60 hover:text-brand-amber text-xs tracking-[0.2em] uppercase font-mono transition-colors z-20 px-4 py-2"
            aria-label="Skip intro"
          >
            Skip Intro &rarr;
          </button>
        </>
      )}
    </div>
  )
}
