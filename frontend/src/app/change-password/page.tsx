import { Metadata } from 'next'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import { ProtectedRoute } from '@/components/auth/protected-route'
import AuthenticatedLayout from '@/components/layout/authenticatedLayout'
import { getPageTitle, getPageDescription } from '@/lib/app.config'

export const metadata: Metadata = {
  title: getPageTitle('Change Password'),
  description: getPageDescription('Change your account password for security.'),
}

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
            <p className="text-gray-600 mt-2">Update your password to keep your account secure</p>
          </div>
          <ChangePasswordForm />
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}
