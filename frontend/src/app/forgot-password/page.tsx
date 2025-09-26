import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { getPageTitle, getPageDescription } from '@/lib/app.config'

export const metadata: Metadata = {
  title: getPageTitle('Reset Password'),
  description: getPageDescription('Reset your password by entering your email address.'),
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">Enter your email address and we&apos;ll send you a link to reset your password</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}