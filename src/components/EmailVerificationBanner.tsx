import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, RefreshCw, Send, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const EmailVerificationBanner: React.FC = () => {
  const { currentUser, emailVerified, sendVerification, refreshUser, resendCooldown } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!currentUser || emailVerified) {
    return null;
  }

  const handleResend = async () => {
    setResending(true);
    setNotice(null);
    const res = await sendVerification();
    setNotice({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
    setResending(false);
  };

  const handleRefresh = async () => {
    setChecking(true);
    setNotice(null);
    const res = await refreshUser();
    setNotice({
      type: res.isVerified ? 'success' : 'info',
      text: res.message
    });
    setChecking(false);
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border-b border-amber-300/60 p-4 transition-all">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Icon & Description */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-amber-900">
                Email Verification Required
              </h4>
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-200/70 text-amber-900">
                Action Needed
              </span>
            </div>
            <p className="text-xs text-amber-800/90 mt-0.5 max-w-2xl">
              We sent a verification link to <span className="font-semibold">{currentUser.email}</span>. Please click the link to confirm your identity and unlock full account privileges. (Be sure to check your spam/junk folder!)
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || resendCooldown > 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {resending ? (
              <div className="w-3.5 h-3.5 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-amber-700" />
            )}
            <span>
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Link'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>I&apos;ve Verified</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Notification */}
      {notice && (
        <div className="max-w-6xl mx-auto mt-3">
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
              notice.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : notice.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-amber-100/70 border-amber-300 text-amber-900'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : notice.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Mail className="w-4 h-4 text-amber-700 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
