'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import apiClient from '@/lib/api.client'
import { AxiosError } from 'axios'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordResponse {
  message: string
}

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { executeRecaptcha } = useGoogleReCaptcha()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData & { recaptchaToken?: string }): Promise<ForgotPasswordResponse> => {
      const response = await apiClient.post('/auth/forgot-password', data)
      return response.data
    },
    onSuccess: () => {
      setIsSubmitted(true)
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // Execute reCAPTCHA verification
    let recaptchaToken: string | undefined
    if (executeRecaptcha) {
      recaptchaToken = await executeRecaptcha('forgot_password')
    }

    forgotPasswordMutation.mutate({
      ...data,
      recaptchaToken,
    })
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="size-4 text-green-600" />
            <AlertDescription className="text-green-800">
              If an account with the email <strong>{getValues('email')}</strong> exists,
              we&apos;ve sent a password reset link to that address.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Didn&apos;t receive the email? Check your spam folder or try again in a few minutes.
            </p>

            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false)
                  forgotPasswordMutation.reset()
                }}
              >
                Try different email
              </Button>

              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href="/login">Back to sign in</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {forgotPasswordMutation.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {forgotPasswordMutation.error instanceof AxiosError
                ? forgotPasswordMutation.error.response?.data?.detail || 'An unexpected error occurred'
                : 'An unexpected error occurred'}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={forgotPasswordMutation.isPending}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? 'Sending reset link...' : 'Send reset link'}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              disabled={forgotPasswordMutation.isPending}
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
