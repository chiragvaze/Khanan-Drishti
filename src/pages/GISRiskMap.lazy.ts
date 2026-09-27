import { lazy } from 'react'

// MapLibre is ~950 KB (about half the bundle) and is only used by the GIS route,
// so that route lives in its own chunk. `preload` lets the app warm it when idle.
const loadGISRiskMap = () => import('./GISRiskMap')

const GISRiskMap = Object.assign(lazy(loadGISRiskMap), { preload: loadGISRiskMap })

export default GISRiskMap
