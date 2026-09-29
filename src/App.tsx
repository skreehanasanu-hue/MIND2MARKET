import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { UserProfile } from './components/UserProfile';
import { FirebaseDiagnosticModal } from './components/FirebaseDiagnosticModal';
import { firebaseConfig } from './firebase/config';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Key,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Code,
  Sparkles,
  Info
} from 'lucide-react';

function AuthMainContent() {
  const { currentUser, loading, emailVerified, logout } = useAuth();
  const [activeAuthTab, setActiveAuthTab] = useState<'login' | 'register'>('login');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'profile' | 'verification' | 'token'>('profile');
  const [idTokenDetails, setIdTokenDetails] = useState<any>(null);
  const [loadingToken, setLoadingToken] = useState(false);

  // Fetch token claims when requested
  const handleInspectToken = async () => {
    if (!currentUser) return;
    try {
      setLoadingToken(true);
      const tokenResult = await currentUser.getIdTokenResult(true);
      setIdTokenDetails(tokenResult);
    } catch (err) {
      console.error('Error getting token result:', err);
    } finally {
      setLoadingToken(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Initializing Firebase Authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">Mind2Market</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase tracking-wider">
                  Firebase Auth
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Project: {firebaseConfig.projectId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDiagnosticOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Firebase Status &amp; Help</span>
            </button>

            {currentUser && (
              <button
                onClick={() => logout()}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Email Verification Banner for Authenticated but Unverified Users */}
      <EmailVerificationBanner />

      {/* Main Body */}
      <main className="flex-1 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {currentUser ? (
          /* Logged In Dashboard View */
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Dashboard Sub-navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setDashboardTab('profile')}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                  dashboardTab === 'profile'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Account &amp; Profile</span>
              </button>

              <button
                onClick={() => setDashboardTab('verification')}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                  dashboardTab === 'verification'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Email Verification Hub</span>
                {!emailVerified && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => {
                  setDashboardTab('token');
                  if (!idTokenDetails) handleInspectToken();
                }}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                  dashboardTab === 'token'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>Token &amp; Claims</span>
              </button>
            </div>

            {/* Tab 1: Profile Management */}
            {dashboardTab === 'profile' && <UserProfile />}

            {/* Tab 2: Email Verification Hub */}
            {dashboardTab === 'verification' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl shrink-0 ${
                      emailVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {emailVerified ? (
                      <ShieldCheck className="w-8 h-8" />
                    ) : (
                      <ShieldAlert className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {emailVerified
                        ? 'Email Address Fully Verified'
                        : 'Email Verification in Progress'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Firebase Authentication enforces email ownership validation via encrypted one-time action links.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                      Target Account Email
                    </span>
                    <div className="text-base font-semibold text-slate-900 break-all">
                      {currentUser.email}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-500">Status:</span>
                      {emailVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          Pending Confirmation
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                      Security Impact
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {emailVerified
                        ? 'Your account token has "email_verified: true". Firestore security rules and backend API routes permit authorized actions for verified users.'
                        : 'Unverified accounts may be restricted in Firestore security rules until the confirmation link in your inbox has been opened.'}
                    </p>
                  </div>
                </div>

                {/* Email instructions walkthrough */}
                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-600" />
                    How to verify your email
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1.5 leading-relaxed">
                    <li>
                      Open your email provider for <strong>{currentUser.email}</strong>.
                    </li>
                    <li>
                      Look for an email from <strong>noreply@{firebaseConfig.authDomain}</strong> with subject <em>&quot;Verify your email for mind2market-50093&quot;</em>.
                    </li>
                    <li>
                      <strong>Check your Spam / Junk folder:</strong> Automated emails from new Firebase projects often land in Spam initially.
                    </li>
                    <li>
                      Click the verification link in the email, then come back here and click &quot;Check Status&quot; or refresh the page.
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* Tab 3: Token & Claims Inspector */}
            {dashboardTab === 'token' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Firebase ID Token Claims &amp; Payload
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live security token issued to the authenticated client by Google Identity Toolkit.
                    </p>
                  </div>
                  <button
                    onClick={handleInspectToken}
                    disabled={loadingToken}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer"
                  >
                    {loadingToken ? 'Refreshing Token...' : 'Refresh Token Claims'}
                  </button>
                </div>

                {idTokenDetails && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-400 block text-[11px]">email_verified</span>
                        <span className="font-bold text-slate-900">
                          {String(idTokenDetails.claims.email_verified)}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-400 block text-[11px]">auth_time</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {new Date(idTokenDetails.claims.auth_time * 1000).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-400 block text-[11px]">sign_in_provider</span>
                        <span className="font-bold text-slate-900">
                          {idTokenDetails.claims.firebase?.sign_in_provider || 'password'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-400 block text-[11px]">iss</span>
                        <span className="font-mono text-[11px] text-slate-700 truncate block">
                          {idTokenDetails.claims.iss.slice(0, 16)}...
                        </span>
                      </div>
                    </div>

                    <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto max-h-80 select-all">
                      {JSON.stringify(idTokenDetails.claims, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Unauthenticated Login / Register Screen */
          <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Value Proposition & Security Highlights */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Production-Ready Firebase Authentication</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Secure User Access <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  with Email Verification
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                Protect your application with Firebase Authentication. Instant registration, password strength auditing, automated verification emails, and seamless Google sign-in.
              </p>

              {/* Feature Cards */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Automated Email Verification
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Triggers confirmation links right after sign-up, with cooldown throttling and live status reloads.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Defensive Password Strength Meter
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visual multi-criteria validation prevents weak credentials before registration hits Firebase.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="p-2 rounded-lg bg-violet-50 text-violet-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Self-Service Password Recovery
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Send password reset emails securely powered by Google Identity Platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Auth Card (Login or Register) */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
                {/* Switcher Tabs */}
                <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveAuthTab('login')}
                    className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                      activeAuthTab === 'login'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAuthTab('register')}
                    className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                      activeAuthTab === 'register'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {activeAuthTab === 'login' ? (
                  <LoginForm
                    onSwitchToRegister={() => setActiveAuthTab('register')}
                    onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
                  />
                ) : (
                  <RegisterForm
                    onSwitchToLogin={() => setActiveAuthTab('login')}
                    onRegisteredSuccess={() => {
                      // Optionally switch or let state show verified notification
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white px-4 sm:px-8 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Mind2Market</span>
            <span>&bull;</span>
            <span>Firebase Auth Integration</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDiagnosticOpen(true)}
              className="text-indigo-600 hover:underline font-medium cursor-pointer"
            >
              Console Setup Checklist
            </button>
            <span>&bull;</span>
            <a
              href="https://firebase.google.com/docs/auth"
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-800 hover:underline inline-flex items-center gap-1"
            >
              Firebase Auth Docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      {/* Firebase Diagnostic & Checklist Modal */}
      <FirebaseDiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthMainContent />
    </AuthProvider>
  );
}
