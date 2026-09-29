import React, { useState } from 'react';
import { firebaseConfig } from '../firebase/config';
import { X, Check, Copy, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

interface FirebaseDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseDiagnosticModal: React.FC<FirebaseDiagnosticModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const copyToClipboard = (text: string, type: 'domain' | 'config') => {
    navigator.clipboard.writeText(text);
    if (type === 'domain') {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    } else {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Firebase Auth Diagnostic</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Active configuration for project <span className="font-semibold text-slate-700">{firebaseConfig.projectId}</span>
            </p>
          </div>
        </div>

        {/* Current Domain Card */}
        <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current App Hostname
            </span>
            <button
              onClick={() => copyToClipboard(currentHostname, 'domain')}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              {copiedDomain ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Hostname</span>
                </>
              )}
            </button>
          </div>
          <div className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/80 break-all select-all">
            {currentHostname || 'localhost'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Tip: If Google Sign-In or auth throws an unauthorized domain error, add this domain to{' '}
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-0.5"
            >
              Firebase Console &gt; Settings &gt; Authorized domains
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Firebase Console Checklist */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Firebase Console Checklist
          </h4>

          <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-900">Enable Email/Password Sign-In Provider</p>
                <p className="text-slate-500 mt-0.5">
                  In Firebase Console &rarr; <strong>Authentication</strong> &rarr; <strong>Sign-in method</strong>, ensure <strong>Email/Password</strong> is enabled.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-900">Email Verification Template</p>
                <p className="text-slate-500 mt-0.5">
                  In Firebase Console &rarr; <strong>Authentication</strong> &rarr; <strong>Templates</strong>, you can customize the sender name, email subject, and verification action URL.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-900">Optional: Enable Google Sign-In Provider</p>
                <p className="text-slate-500 mt-0.5">
                  Under <strong>Sign-in method</strong>, enable <strong>Google</strong> with your project support email if you want 1-click Google authentication.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Config Summary */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-slate-400">Firebase Config Reference</span>
            <button
              onClick={() => copyToClipboard(JSON.stringify(firebaseConfig, null, 2), 'config')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              {copiedConfig ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Config</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-950/70 rounded-lg">
            {JSON.stringify(
              {
                authDomain: firebaseConfig.authDomain,
                projectId: firebaseConfig.projectId,
                storageBucket: firebaseConfig.storageBucket,
                appId: firebaseConfig.appId,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
