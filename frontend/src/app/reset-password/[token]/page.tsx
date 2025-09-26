import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { getPageTitle, getPageDescription } from '@/lib/app.config'

export const metadata: Metadata = {
  title: getPageTitle('Set New Password'),
  description: getPageDescription('Enter your new password to complete the reset process.'),
}

interface ResetPasswordPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-600 mt-2">Enter your new password below</p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  )
}