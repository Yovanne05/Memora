import { httpClient } from '@/lib/http-client'

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
  success: boolean
}

export const passwordResetService = {
  async requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
    const response = await httpClient.post<ForgotPasswordResponse>(
      '/auth/forgot-password',
      { email }
    )
    return response
  },
}
