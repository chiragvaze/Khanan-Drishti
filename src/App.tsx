import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import GISRiskMap from './pages/GISRiskMap.lazy'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'


/** Warm the deferred GIS chunk once the browser is idle so opening the map stays instant. */
function prefetchDeferredRoutes() {
  const run = () => void GISRiskMap.preload()
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 5000 })
  else setTimeout(run, 2000)
}

export default function App() {
  useEffect(() => prefetchDeferredRoutes(), [])

  return (
    <>
      <RouterProvider router={router} />
      <Analytics />
      <SpeedInsights />
    </>
  )
}
