import { httpClient } from './httpClient';

export interface ApiAccount {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: 'Admin' | 'Staff' | 'User';
  isActive: boolean;
}

export interface RegisterWithRolePayload {
  username: string;
  passwordHash: string;
  email: string;
  phoneNumber: string;
  role: 'Staff' | 'User';
}

export interface VerifyOtpPayload {
  email: string;
  otpCode: string;
}

export const accountService = {
  getAll: () => httpClient.get<ApiAccount[]>('/api/account/get-all'),

  registerWithRole: (payload: RegisterWithRolePayload) =>
    httpClient.post<string>('/api/Auth/register-with-role', payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    httpClient.post<string>('/api/Auth/verify-otp', payload),
};
