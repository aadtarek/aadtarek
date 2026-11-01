import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Spinner } from './components/ui'
import Home from './pages/Home'

// Heavy tools load on demand to keep the first page fast.
const NewDesign = lazy(() => import('./pages/NewDesign'))
const Editor = lazy(() => import('./pages/editor/Editor'))
const CvBuilder = lazy(() => import('./pages/cv/CvBuilder'))
const RemoveBg = lazy(() => import('./pages/RemoveBg'))
const PdfEditor = lazy(() => import('./pages/pdf/PdfEditor'))

function Loading() {
  return (
    <div className="flex h-full items-center justify-center text-brand-600">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

export default function App() {
  return (
    // Hash URLs (/#/editor/…) work on any static host, including Hostinger shared hosting, with no server config.
    <HashRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<NewDesign />} />
          <Route path="/editor/:id" element={<Editor />} />
          <Route path="/cv" element={<CvBuilder />} />
          <Route path="/remove-bg" element={<RemoveBg />} />
          <Route path="/pdf" element={<PdfEditor />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
