// components/Modal.tsx
import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: ReactNode
  iconBgColor?: string
  children?: ReactNode
  onConfirm?: () => void
  confirmText?: string
  confirmColor?: 'green' | 'red' | 'blue'
  cancelText?: string
  isLoading?: boolean
  showActions?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconBgColor = 'bg-blue-100',
  children,
  onConfirm,
  confirmText = 'Confirmar',
  confirmColor = 'blue',
  cancelText = 'Cancelar',
  isLoading = false,
  showActions = true,
}: ModalProps) {
  if (!isOpen) return null

  const getConfirmButtonClass = () => {
    const baseClass = 'flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
    
    switch (confirmColor) {
      case 'green':
        return `${baseClass} bg-green-600 hover:bg-green-700`
      case 'red':
        return `${baseClass} bg-red-600 hover:bg-red-700`
      case 'blue':
        return `${baseClass} bg-blue-600 hover:bg-blue-700`
      default:
        return `${baseClass} bg-blue-600 hover:bg-blue-700`
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop com blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          {icon && (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconBgColor}`}>
              {icon}
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {title}
          </h2>
          
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}

          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={getConfirmButtonClass()}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>{confirmText}</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}