// components/Toaster.tsx
import { Toaster as SonnerToaster } from 'sonner'

interface ToasterProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  theme?: 'light' | 'dark' | 'system'
  richColors?: boolean
  closeButton?: boolean
  expand?: boolean
  duration?: number
}

export default function Toaster({
  position = 'top-right',
  theme = 'light',
  richColors = true,
  closeButton = true,
  expand = false,
  duration = 4000,
}: ToasterProps) {
  return (
    <SonnerToaster
      position={position}
      theme={theme}
      richColors={richColors}
      closeButton={closeButton}
      expand={expand}
      duration={duration}
      toastOptions={{
        style: {
          borderRadius: '12px',
        },
        className: 'sonner-toast',
      }}
    />
  )
}