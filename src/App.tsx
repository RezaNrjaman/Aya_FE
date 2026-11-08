import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import { CartProvider } from '@/features/m5/CartContext'
import { ToastProvider } from '@/components/ui'
import { router } from './router'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
