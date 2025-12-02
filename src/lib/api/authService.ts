import apiClient, { setTokens, clearTokens as clearTokensFromAxios } from "./axios";
import { 
  LoginRequest, 
  GoogleLoginRequest,
  RegisterRequest, 
  User, 
  UpdateProfileRequest, 
  ChangePasswordRequest,
  EmailVerificationRequest,
  ResendEmailVerificationRequest,
  AvatarUploadResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  TokenRefreshRequest,
  TokenVerifyRequest
} from "./types";

const API_URL = "https://auth.topmanga.uz/api";

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post(`${API_URL}/auth/login/`, credentials);
    if (response.data.access && response.data.refresh) {
      setTokens({
        access: response.data.access,
        refresh: response.data.refresh
      });
    }
    return response.data;
  },

  googleLogin: async (credentials: GoogleLoginRequest) => {
    const response = await apiClient.post(`${API_URL}/google-auth/login/`, {
      username: credentials.email,
      email: credentials.email,
      password: credentials.password
    });
    if (response.data.access && response.data.refresh) {
      setTokens({
        access: response.data.access,
        refresh: response.data.refresh
      });
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    try {
      const response = await apiClient.post('/auth/registration/', {
        username: data.username,
        email: data.email,
        password1: data.password, // Backend expects password1
        password2: data.password  // Backend expects password2 (confirmation)
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMe: async (): Promise<any> => {
    const response = await apiClient.get(`${API_URL}/auth/me/`);
    return response.data;
  },

  getFavorites: async (page?: number): Promise<any> => {
    const params = page ? { page } : {};
    const response = await apiClient.get(`${API_URL}/favorites/`, { params });
    return response.data;
  },

  addToFavorites: async (mangaId: string): Promise<any> => {
    const response = await apiClient.post(`${API_URL}/favorites/${mangaId}/`);
    return response.data;
  },

  removeFromFavorites: async (mangaId: string): Promise<void> => {
    await apiClient.delete(`${API_URL}/favorites/delete/${mangaId}/`);
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`${API_URL}/auth/me/`, userData);
    return response.data;
  },

  updateProfileInfo: async (data: { first_name?: string; last_name?: string }): Promise<any> => {
    const response = await apiClient.patch(`${API_URL}/auth/update-profile/`, data);
    return response.data;
  },

  updateUserDetails: async (userData: { username?: string; first_name?: string; last_name?: string }): Promise<User> => {
    const response = await apiClient.put(`${API_URL}/auth/me/`, userData);
    return response.data;
  },

  changePassword: async (passwordData: ChangePasswordRequest) => {
    const response = await apiClient.put(`${API_URL}/auth/change-password/`, passwordData);
    return response.data;
  },

  changePasswordGoogle: async (passwordData: { old_password: string; new_password: string }) => {
    const response = await apiClient.put(`${API_URL}/auth/change-password/`, passwordData);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<AvatarUploadResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.patch(`${API_URL}/auth/update-profile/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  verifyEmail: async (verificationData: EmailVerificationRequest) => {

    const response = await apiClient.post(`${API_URL}/auth/verify-email/`, verificationData);

    return response.data;
  },

  resendEmailVerification: async (emailData: ResendEmailVerificationRequest) => {

    const response = await apiClient.post(`${API_URL}/auth/resend-email/`, emailData);

    return response.data;
  },

  passwordReset: async (resetData: PasswordResetRequest) => {
    const response = await apiClient.post(`${API_URL}/auth/password/reset/`, resetData);
    return response.data;
  },

  passwordResetConfirm: async (confirmData: PasswordResetConfirmRequest) => {
    const response = await apiClient.post(`${API_URL}/auth/password/reset/confirm/`, confirmData);
    return response.data;
  },

  refreshToken: async (refreshData: TokenRefreshRequest) => {
    const response = await apiClient.post(`${API_URL}/auth/token/refresh/`, refreshData);
    if (response.data.access) {
      setTokens({
        access: response.data.access,
        refresh: refreshData.refresh
      });
    }
    return response.data;
  },

  verifyToken: async (verifyData: TokenVerifyRequest) => {
    const response = await apiClient.post(`${API_URL}/auth/token/verify/`, verifyData);
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post(`${API_URL}/auth/logout/`);
    } catch (error) {
    } finally {
      clearTokensFromAxios();
    }
  },

  googleLogout: async () => {
    try {
      await apiClient.post(`${API_URL}/google-auth/logout/`);
    } catch (error) {
    } finally {
      clearTokensFromAxios();
    }
  },

  googlePasswordChange: async (passwordData: { new_password1: string; new_password2: string }) => {
    const response = await apiClient.post(`${API_URL}/google-auth/password/change/`, passwordData);
    return response.data;
  },

  googlePasswordReset: async (resetData: { email: string }) => {
    const response = await apiClient.post(`${API_URL}/google-auth/password/reset/`, resetData);
    return response.data;
  },

  googlePasswordResetConfirm: async (confirmData: { 
    new_password1: string; 
    new_password2: string; 
    uid: string; 
    token: string 
  }) => {
    const response = await apiClient.post(`${API_URL}/google-auth/password/reset/confirm/`, confirmData);
    return response.data;
  },

  googleTokenRefresh: async (refreshData: { refresh: string }) => {
    const response = await apiClient.post(`${API_URL}/google-auth/token/refresh/`, refreshData);
    if (response.data.access) {
      setTokens({
        access: response.data.access,
        refresh: refreshData.refresh
      });
    }
    return response.data;
  },

  googleTokenVerify: async (verifyData: { token: string }) => {
    const response = await apiClient.post(`${API_URL}/google-auth/token/verify/`, verifyData);
    return response.data;
  },
  googleUserUpdate: async (userData: { username?: string; first_name?: string; last_name?: string }) => {
    const response = await apiClient.put(`${API_URL}/google-auth/user/`, userData);
    return response.data;
  },

  clearTokens: () => {
    clearTokensFromAxios();
  },
}; 