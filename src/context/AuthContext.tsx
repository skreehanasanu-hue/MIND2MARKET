import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  reload
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { getFriendlyAuthErrorMessage } from '../utils/authErrors';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  emailVerified: boolean;
  resendCooldown: number;
  sendVerification: () => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<{ success: boolean; isVerified: boolean; message: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cooldown countdown timer for resending verification email
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Send Email Verification
  const sendVerification = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!auth.currentUser) {
      return { success: false, message: 'No user is currently signed in.' };
    }

    if (auth.currentUser.emailVerified) {
      return { success: true, message: 'Your email address is already verified!' };
    }

    if (resendCooldown > 0) {
      return {
        success: false,
        message: `Please wait ${resendCooldown}s before requesting another verification email.`
      };
    }

    try {
      await sendEmailVerification(auth.currentUser);
      setResendCooldown(60); // 60s cooldown
      return {
        success: true,
        message: `Verification email sent to ${auth.currentUser.email}. Please check your inbox and spam folder.`
      };
    } catch (err: any) {
      const code = err?.code || '';
      let msg = getFriendlyAuthErrorMessage(code);
      if (code === 'auth/too-many-requests') {
        msg = 'Verification requests throttled by Firebase. Please wait a couple minutes before trying again.';
        setResendCooldown(60);
      }
      return { success: false, message: msg };
    }
  }, [resendCooldown]);

  // Refresh User status (checks if user clicked verification link)
  const refreshUser = useCallback(async (): Promise<{ success: boolean; isVerified: boolean; message: string }> => {
    if (!auth.currentUser) {
      return { success: false, isVerified: false, message: 'No user signed in.' };
    }

    try {
      await reload(auth.currentUser);
      const updatedUser = auth.currentUser;
      setCurrentUser({ ...updatedUser });

      if (updatedUser.emailVerified) {
        return {
          success: true,
          isVerified: true,
          message: 'Success! Your email has been verified.'
        };
      } else {
        return {
          success: true,
          isVerified: false,
          message: 'Email is not verified yet. Please click the link in your verification email.'
        };
      }
    } catch (err: any) {
      return {
        success: false,
        isVerified: false,
        message: 'Could not refresh user status. Please check your network connection.'
      };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await signOut(auth);
    setCurrentUser(null);
  }, []);

  // Password Reset
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return {
        success: true,
        message: `Password reset instructions sent to ${email.trim()}. Please check your email inbox.`
      };
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err?.code || '');
      return { success: false, message: msg };
    }
  }, []);

  // Google Sign-In
  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err?.code || '');
      return { success: false, message: msg };
    }
  }, []);

  const value = {
    currentUser,
    loading,
    emailVerified: Boolean(currentUser?.emailVerified),
    resendCooldown,
    sendVerification,
    refreshUser,
    logout,
    resetPassword,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
