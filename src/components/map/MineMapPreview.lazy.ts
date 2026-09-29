import { lazy } from 'react'

// Loaded on demand so MapLibre (shared with the GIS route chunk) never enters the initial bundle.
const MineMapPreview = lazy(() => import('./MineMapPreview'))

export default MineMapPreview
