/**
 * Utility to map Firebase Auth error codes to clear, actionable user messages.
 */
export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in or use a different email.';
    case 'auth/invalid-email':
      return 'The email address is not formatted correctly.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in the Firebase Console. Please go to Authentication > Sign-in method and enable Email/Password.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters with a mix of letters, numbers, and symbols.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check the spelling or register.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or use the "Forgot Password" link.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to too many failed attempts. Please wait a few moments or reset your password.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before finishing authentication.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/unauthorized-domain':
      return `This domain (${typeof window !== 'undefined' ? window.location.hostname : 'current domain'}) is not authorized in Firebase. Add it to Authorized Domains in Firebase Console > Authentication > Settings > Authorized domains.`;
    case 'auth/requires-recent-login':
      return 'This sensitive operation requires you to sign in again before proceeding.';
    case 'auth/expired-action-code':
      return 'The verification or reset link has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return 'The action code is invalid or has already been used.';
    default:
      return 'An unexpected authentication error occurred. Please try again.';
  }
}
