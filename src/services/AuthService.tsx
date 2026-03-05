import { httpClient } from './httpClient';

// payload types
interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface VerifyOtpPayload {
  email: string;
  otpCode: string;
}

interface ResendOtpPayload {
  email: string;
}

// the service exposes the auth-related endpoints defined in the backend
export const authService = {
  login: (data: LoginPayload) =>
    httpClient.post<any>('/api/Auth/login', data),
  register: (data: RegisterPayload) =>
    // Backend Swagger expects fields like `username`, `passwordHash`, `email`, `phoneNumber`.
    // Map our form fields to those keys so the API doesn't return 400 for unexpected body.
    httpClient.post<any>('/api/Auth/register', {
      username: data.name,
      passwordHash: data.password,
      email: data.email,
      phoneNumber: data.phone,
      // keep original names in case backend accepts them as well
      name: data.name,
      password: data.password,
    }),
  verifyOtp: (data: VerifyOtpPayload) =>
    httpClient.post<any>('/api/Auth/verify-otp', data),
  resendOtp: (data: ResendOtpPayload) =>
    httpClient.post<any>('/api/Auth/resend-otp', data),
};
