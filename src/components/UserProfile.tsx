import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { getFriendlyAuthErrorMessage } from '../utils/authErrors';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import {
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Key,
  Copy,
  Check,
  LogOut,
  Calendar,
  Clock,
  Trash2,
  RefreshCw,
  Send,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Edit2
} from 'lucide-react';

export const UserProfile: React.FC = () => {
  const {
    currentUser,
    emailVerified,
    sendVerification,
    refreshUser,
    logout,
    resendCooldown
  } = useAuth();

  const [copiedUid, setCopiedUid] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(currentUser?.displayName || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameNotice, setNameNotice] = useState<{ success: boolean; message: string } | null>(null);

  // Verification states
  const [verifying, setVerifying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Change Password states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!currentUser) return null;

  const copyUid = () => {
    navigator.clipboard.writeText(currentUser.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) return;

    try {
      setNameLoading(true);
      setNameNotice(null);
      await updateProfile(currentUser, { displayName: newDisplayName.trim() });
      setNameNotice({ success: true, message: 'Display name updated successfully!' });
      setIsEditingName(false);
    } catch (err: any) {
      setNameNotice({ success: false, message: getFriendlyAuthErrorMessage(err?.code || '') });
    } finally {
      setNameLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setVerifying(true);
    setVerificationNotice(null);
    const res = await sendVerification();
    setVerificationNotice({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
    setVerifying(false);
  };

  const handleRefreshVerification = async () => {
    setRefreshing(true);
    setVerificationNotice(null);
    const res = await refreshUser();
    setVerificationNotice({
      type: res.isVerified ? 'success' : 'info',
      text: res.message
    });
    setRefreshing(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (newPassword.length < 6) {
      setPasswordNotice({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordNotice({ success: false, message: 'New passwords do not match.' });
      return;
    }

    try {
      setPasswordLoading(true);

      // Re-authenticate if user signed in with password
      if (currentPassword && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }

      await updatePassword(currentUser, newPassword);
      setPasswordNotice({
        success: true,
        message: 'Password changed successfully! Keep it safe.'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setShowPasswordChange(false), 2000);
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err?.code || '');
      setPasswordNotice({ success: false, message: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    try {
      setDeleteLoading(true);

      // Re-authenticate first if password provided
      if (deletePassword && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
        await reauthenticateWithCredential(currentUser, credential);
      }

      await deleteUser(currentUser);
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err?.code || '');
      setDeleteError(msg);
      setDeleteLoading(false);
    }
  };

  // Get Initials for Avatar
  const getInitials = () => {
    if (currentUser.displayName) {
      return currentUser.displayName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return currentUser.email ? currentUser.email[0].toUpperCase() : 'U';
  };

  const creationDate = currentUser.metadata.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown';

  const lastSignIn = currentUser.metadata.lastSignInTime
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Active now';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                {getInitials()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {currentUser.displayName || 'Account Member'}
                </h2>
                <button
                  onClick={() => {
                    setIsEditingName(!isEditingName);
                    setNewDisplayName(currentUser.displayName || '');
                  }}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                  title="Edit display name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm text-slate-600 font-medium">
                  {currentUser.email}
                </span>

                {emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Email
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Inline Edit Name Form */}
        {isEditingName && (
          <form
            onSubmit={handleUpdateName}
            className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
          >
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Update Display Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Enter new display name"
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={nameLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {nameLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {nameNotice && (
          <div
            className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
              nameNotice.success
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {nameNotice.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{nameNotice.message}</span>
          </div>
        )}

        {/* Security & Verification Management Block */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Verification Status */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Verification Status
                </span>
                {emailVerified ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Confirmed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Pending
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {emailVerified
                  ? 'Your email is verified and protected. You have full access to all authenticated capabilities.'
                  : `A verification link was sent to ${currentUser.email}. Click the link to complete account verification.`}
              </p>
            </div>

            {!emailVerified && (
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={verifying || resendCooldown > 0}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Verification'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRefreshVerification}
                    disabled={refreshing}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-all cursor-pointer"
                    title="Reload current status"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Check</span>
                  </button>
                </div>
              </div>
            )}

            {verificationNotice && (
              <div
                className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  verificationNotice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : verificationNotice.type === 'error'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {verificationNotice.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                <span>{verificationNotice.text}</span>
              </div>
            )}
          </div>

          {/* Card: Account Metadata */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Security Details
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Registered On
                </span>
                <span className="font-medium text-slate-800">{creationDate}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Last Active
                </span>
                <span className="font-medium text-slate-800">{lastSignIn}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Provider</span>
                <div className="flex items-center gap-1">
                  {currentUser.providerData.map((p) => (
                    <span
                      key={p.providerId}
                      className="px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-md font-mono text-[10px] font-medium"
                    >
                      {p.providerId === 'password'
                        ? 'Email/Password'
                        : p.providerId === 'google.com'
                        ? 'Google'
                        : p.providerId}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">UID: {currentUser.uid.slice(0, 10)}...</span>
              <button
                type="button"
                onClick={copyUid}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
              >
                {copiedUid ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Full UID</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Collapsible Section */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                Password & Security
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your account password or change security settings.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPasswordChange(!showPasswordChange);
                setPasswordNotice(null);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-all cursor-pointer"
            >
              {showPasswordChange ? 'Hide Form' : 'Change Password'}
            </button>
          </div>

          {showPasswordChange && (
            <form
              onSubmit={handleChangePassword}
              className="mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4 max-w-lg"
            >
              {passwordNotice && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    passwordNotice.success
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {passwordNotice.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordNotice.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <PasswordStrengthMeter password={newPassword} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Danger Zone: Delete Account */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-rose-700 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently remove your user account and authentication records from Firebase.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Account Deletion</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to permanently delete your account for{' '}
              <span className="font-semibold text-slate-900">{currentUser.email}</span>? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Enter Password to Confirm (if using password sign-in)
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your account password"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteError(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
