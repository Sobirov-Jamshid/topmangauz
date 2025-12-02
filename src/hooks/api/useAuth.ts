"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/authService";
import { 
  LoginRequest, 
  GoogleLoginRequest,
  RegisterRequest, 
  User, 
  UpdateProfileRequest, 
  ChangePasswordRequest,
  EmailVerificationRequest,
  ResendEmailVerificationRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  TokenRefreshRequest,
  TokenVerifyRequest
} from "@/lib/api/types";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getTokens, setTokens } from "@/lib/api/axios";


export function useAuth() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const initialized = useRef(false);
  
  useEffect(() => {
    if (!initialized.current) {
      const { access } = getTokens();
      const hasToken = !!access;
      setIsAuthenticated(hasToken);
      initialized.current = true;
    }
  }, []);

  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: authService.getMe,
    enabled: isAuthenticated === true && initialized.current,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        setIsAuthenticated(false);
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  useEffect(() => {
    if (userError && userError.response?.status === 401) {
      setIsAuthenticated(false);
    }
  }, [userError]);

  const authState = useMemo(() => ({
    isAuthenticated,
    isLoadingUser,
    user,
    userError
  }), [isAuthenticated, isLoadingUser, user, userError]);

  const { 
    mutateAsync: login,
    isPending: isLoggingIn,
    error: loginError,
  } = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: () => {
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: () => {
      setIsAuthenticated(false);
    },
  });

  const setTokensFromSocialLogin = useCallback(
    ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
      setTokens({
        access: accessToken,
        refresh: refreshToken,
      });

      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    [queryClient]
  );


  const { 
    mutateAsync: googleLogin,
    isPending: isGoogleLoggingIn,
    error: googleLoginError,
  } = useMutation({
    mutationFn: async () => {
      const mockCredentials = {
        username: "google_user",
        email: "google@example.com",
        password: "google_password_123"
      };
      return authService.googleLogin(mockCredentials);
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: () => {
      setIsAuthenticated(false);
    },
  });

  const {
    mutateAsync: register,
    isPending: isRegistering,
    error: registerError,
  } = useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
  });

  const {
    mutateAsync: updateProfile,
    isPending: isUpdatingProfile,
    error: updateProfileError,
  } = useMutation({
    mutationFn: (userData: Partial<User>) => authService.updateProfile(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const {
    mutateAsync: updateProfileInfo,
    isPending: isUpdatingProfileInfo,
    error: updateProfileInfoError,
  } = useMutation({
    mutationFn: (profileData: UpdateProfileRequest) => authService.updateProfileInfo(profileData),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const {
    mutateAsync: updateUserDetails,
    isPending: isUpdatingUserDetails,
    error: updateUserDetailsError,
  } = useMutation({
    mutationFn: (userData: { username?: string; first_name?: string; last_name?: string }) => authService.updateUserDetails(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const {
    mutateAsync: changePassword,
    isPending: isChangingPassword,
    error: changePasswordError,
  } = useMutation({
    mutationFn: (passwordData: ChangePasswordRequest) => authService.changePassword(passwordData),
  });

  const {
    mutateAsync: changePasswordGoogle,
    isPending: isChangingPasswordGoogle,
    error: changePasswordGoogleError,
  } = useMutation({
    mutationFn: (passwordData: { old_password: string; new_password: string }) => authService.changePasswordGoogle(passwordData),
  });

  const {
    mutateAsync: uploadAvatar,
    isPending: isUploadingAvatar,
    error: uploadAvatarError,
  } = useMutation({
    mutationFn: (file: File) => authService.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], (old: User | undefined) => 
        old ? { ...old, avatar: data.avatar } : old
      );
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
  const {
    mutateAsync: verifyEmail,
    isPending: isVerifyingEmail,
    error: verifyEmailError,
  } = useMutation({
    mutationFn: (verificationData: EmailVerificationRequest) => 
      authService.verifyEmail(verificationData),
  });

  const {
    mutateAsync: resendEmailVerification,
    isPending: isResendingEmailVerification,
    error: resendEmailVerificationError,
  } = useMutation({
    mutationFn: (emailData: ResendEmailVerificationRequest) => 
      authService.resendEmailVerification(emailData),
  });
  
  const {
    mutateAsync: passwordReset,
    isPending: isPasswordResetting,
    error: passwordResetError,
  } = useMutation({
    mutationFn: (resetData: PasswordResetRequest) => authService.passwordReset(resetData),
  });

  const {
    mutateAsync: passwordResetConfirm,
    isPending: isPasswordResetConfirming,
    error: passwordResetConfirmError,
  } = useMutation({
    mutationFn: (confirmData: PasswordResetConfirmRequest) => authService.passwordResetConfirm(confirmData),
  });

  const {
    mutateAsync: refreshToken,
    isPending: isRefreshingToken,
    error: refreshTokenError,
  } = useMutation({
    mutationFn: (refreshData: TokenRefreshRequest) => authService.refreshToken(refreshData),
  });

  const {
    mutateAsync: verifyToken,
    isPending: isVerifyingToken,
    error: verifyTokenError,
  } = useMutation({
    mutationFn: (verifyData: TokenVerifyRequest) => authService.verifyToken(verifyData),
  });

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
    } finally {
      setIsAuthenticated(false);
      queryClient.clear();
    }
  }, [queryClient]);

  const googleLogout = useCallback(async () => {
    try {
      await authService.googleLogout();
    } catch (error) {
    } finally {
      setIsAuthenticated(false);
      queryClient.clear();
    }
  }, [queryClient]);

  const {
    mutateAsync: googlePasswordChange,
    isPending: isGooglePasswordChanging,
    error: googlePasswordChangeError,
  } = useMutation({
    mutationFn: (passwordData: { new_password1: string; new_password2: string }) => authService.googlePasswordChange(passwordData),
  });

  const {
    mutateAsync: googlePasswordReset,
    isPending: isGooglePasswordResetting,
    error: googlePasswordResetError,
  } = useMutation({
    mutationFn: (resetData: { email: string }) => authService.googlePasswordReset(resetData),
  });

  const {
    mutateAsync: googlePasswordResetConfirm,
    isPending: isGooglePasswordResetConfirming,
    error: googlePasswordResetConfirmError,
  } = useMutation({
    mutationFn: (confirmData: { 
      new_password1: string; 
      new_password2: string; 
      uid: string; 
      token: string 
    }) => authService.googlePasswordResetConfirm(confirmData),
  });

  const {
    mutateAsync: googleTokenRefresh,
    isPending: isGoogleTokenRefreshing,
    error: googleTokenRefreshError,
  } = useMutation({
    mutationFn: (refreshData: { refresh: string }) => authService.googleTokenRefresh(refreshData),
  });

  const {
    mutateAsync: googleTokenVerify,
    isPending: isGoogleTokenVerifying,
    error: googleTokenVerifyError,
  } = useMutation({
    mutationFn: (verifyData: { token: string }) => authService.googleTokenVerify(verifyData),
  });

  const {
    data: googleUserDetails,
    isLoading: isLoadingGoogleUserDetails,
    error: googleUserDetailsError,
  } = useQuery({
    queryKey: ["googleUserDetails"],
    queryFn: () => authService.googleUserDetails(),
    enabled: !!isAuthenticated,
  });

  const {
    mutateAsync: googleUserUpdate,
    isPending: isGoogleUserUpdating,
    error: googleUserUpdateError,
  } = useMutation({
    mutationFn: (userData: { username?: string; first_name?: string; last_name?: string }) => authService.googleUserUpdate(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(["googleUserDetails"], data);
    },
  });

  const clearTokens = useCallback(() => {
    authService.clearTokens();
    setIsAuthenticated(false);
    queryClient.clear();
  }, [queryClient]);

  const getUserProfile = useQuery({
    queryKey: ['userProfile'],
    queryFn: authService.getMe,
    enabled: isAuthenticated === true,
  });

  const getUserFavorites = useQuery({
    queryKey: ['userFavorites'],
    queryFn: () => authService.getFavorites(),
    enabled: isAuthenticated === true,
  });

  const addToFavorites = useMutation({
    mutationFn: authService.addToFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          'Sevimlilarga qo\'shishda xatolik yuz berdi';
    },
  });

  const removeFromFavorites = useMutation({
    mutationFn: authService.removeFromFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          'Sevimlilardan olib tashlashda xatolik yuz berdi';
    },
  });

  const updateProfileInfoMutation = useMutation({
    mutationFn: authService.updateProfileInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail ||
                          error?.response?.data?.message ||
                          'Profilni yangilashda xatolik yuz berdi';
    },
  });

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoadingUser: authState.isLoadingUser,
    userError: authState.userError,
    
    login,
    isLoggingIn,
    loginError,
    
    googleLogin,
    isGoogleLoggingIn,
    googleLoginError,
    setTokensFromSocialLogin,
    register,
    isRegistering,
    registerError,
    
    updateProfile,
    isUpdatingProfile,
    updateProfileError,
    updateProfileInfo,
    isUpdatingProfileInfo,
    updateProfileInfoError,
    updateUserDetails,
    isUpdatingUserDetails,
    updateUserDetailsError,
    
    changePassword,
    isChangingPassword,
    changePasswordError,
    changePasswordGoogle,
    isChangingPasswordGoogle,
    changePasswordGoogleError,
    
    uploadAvatar,
    isUploadingAvatar,
    uploadAvatarError,
    
    verifyEmail,
    isVerifyingEmail,
    verifyEmailError,
    resendEmailVerification,
    isResendingEmailVerification,
    resendEmailVerificationError,
    
    passwordReset,
    isPasswordResetting,
    passwordResetError,
    passwordResetConfirm,
    isPasswordResetConfirming,
    passwordResetConfirmError,
    
    refreshToken,
    isRefreshingToken,
    refreshTokenError,
    verifyToken,
    isVerifyingToken,
    verifyTokenError,
    
    logout,
    googleLogout,
    clearTokens,

    googlePasswordChange,
    isGooglePasswordChanging,
    googlePasswordChangeError,
    googlePasswordReset,
    isGooglePasswordResetting,
    googlePasswordResetError,
    googlePasswordResetConfirm,
    isGooglePasswordResetConfirming,
    googlePasswordResetConfirmError,
    googleTokenRefresh,
    isGoogleTokenRefreshing,
    googleTokenRefreshError,
    googleTokenVerify,
    isGoogleTokenVerifying,
    googleTokenVerifyError,
    googleUserDetails,
    isLoadingGoogleUserDetails,
    googleUserDetailsError,
    googleUserUpdate,
    isGoogleUserUpdating,
    googleUserUpdateError,

    getUserProfile,
    getUserFavorites,
    addToFavorites,
    removeFromFavorites,
    updateProfileInfoMutation,
  };
} 