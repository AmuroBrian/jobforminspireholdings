// app/page.js
'use client'

import ApplicationModal from './components/ApplicationModal'

export default function HomePage() {
  const handleSubmit = async (data) => {
    console.log('Form submitted:', data)
  }

  const handleClose = () => {
    console.log('Modal closed')
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <ApplicationModal
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </main>
  )
}
