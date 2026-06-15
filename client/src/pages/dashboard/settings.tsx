import React, { useState, useEffect } from 'react';
import { apiService } from '../../api';
import { ConfirmDialog } from '../../components/confirmDialog';

export const SettingsPanel: React.FC = () => {
  const currentUser = apiService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // 1. Profile States
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // 2. Account Registration States (Admin only)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('manager');
  const [regSaving, setRegSaving] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // 3. Server Config States (Twilio details wrapped in accordion)
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [whatsappNum, setWhatsappNum] = useState('');
  const [templateSid, setTemplateSid] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [serverSaving, setServerSaving] = useState(false);
  const [serverSuccess, setServerSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Confirm Dialog states
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const loadConfig = async () => {
        try {
          const cfg = await apiService.getServerConfig();
          setAccountSid(cfg.accountSid);
          setAuthToken(cfg.authToken);
          setWhatsappNum(cfg.whatsappNum);
          setPhoneNum(cfg.phoneNum);
          setTemplateSid(cfg.templateSid);
          setBaseUrl(cfg.baseUrl);
        } catch (err) {
          console.error('Failed to load server configuration:', err);
          setServerError('Failed to fetch server credentials from API');
        }
      };
      loadConfig();
    }
  }, [isAdmin]);

  // Profile Save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!profileName.trim() || !profileEmail.trim()) {
      setProfileError('Name and Email are required.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setProfileError('New passwords do not match.');
      return;
    }

    setProfileSaving(true);
    try {
      await apiService.updateProfile({
        name: profileName.trim(),
        email: profileEmail.trim(),
        password: newPassword ? newPassword : undefined,
      });
      setProfileSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Register New User
  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(false);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('All fields are required.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    setRegSaving(true);
    try {
      await apiService.registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
      });
      setRegSuccess(true);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegRole('manager');
      setTimeout(() => setRegSuccess(false), 3000);
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Failed to register new account.');
    } finally {
      setRegSaving(false);
    }
  };

  // Twilio Server Config Save
  const handleServerSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSaving(true);
    setServerSuccess(false);

    try {
      await apiService.updateServerConfig({
        accountSid: accountSid.trim(),
        authToken: authToken.trim(),
        whatsappNum: whatsappNum.trim(),
        phoneNum: phoneNum.trim(),
        templateSid: templateSid.trim(),
        baseUrl: baseUrl.trim(),
      });
      setServerSuccess(true);
      setTimeout(() => setServerSuccess(false), 3000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to update configuration.');
    } finally {
      setServerSaving(false);
    }
  };

  const handleResetData = () => {
    setResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in text-slate-800 dark:text-slate-100 select-none space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h2 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
          System Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Configure admin profiles, register organization accounts, and wrap system parameters.
        </p>
      </div>

      {/* 1. USER PROFILE SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white mb-4">
          User Account Configuration
        </h3>

        {profileSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/35 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs flex items-center gap-2 font-bold animate-fade-in">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {profileError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 text-red-655 dark:text-red-400 rounded-lg text-xs flex items-center gap-2 font-bold animate-fade-in">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100 font-sans font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100 font-sans font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <div>
              <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                New Password (Optional)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100 font-sans font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100 font-sans font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2.5 bg-primary text-white font-sans text-xs font-bold rounded-lg hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {profileSaving ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. CREATE USER ACCOUNT SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white mb-1.5">
          Create User Account
        </h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-4">
          Add team members and define system access boundaries
        </p>

        {!isAdmin ? (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-500 font-semibold leading-relaxed select-none">
            🔒 Account registration and creation utilities are restricted to Administrators.
          </div>
        ) : (
          <>
            {regSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/35 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs flex items-center gap-2 font-bold animate-fade-in">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>New account created successfully!</span>
              </div>
            )}

            {regError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 text-red-655 dark:text-red-400 rounded-lg text-xs flex items-center gap-2 font-bold animate-fade-in">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleUserRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter user name"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100 font-sans font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@organization.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100 font-sans font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100 font-sans font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                    System Role *
                  </label>
                  <div className="relative">
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-4 pr-8 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                      <option value="manager">Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[16px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={regSaving}
                  className="px-5 py-2.5 bg-primary text-white font-sans text-xs font-bold rounded-lg hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {regSaving ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* 3. SERVER CONFIGURATION WRAPPER (ACCORDION CARD) */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
          {/* Accordion Trigger Header */}
          <div
            onClick={() => setShowServerConfig(!showServerConfig)}
            className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all select-none"
          >
            <div>
              <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                Server Configuration
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                Twilio sandbox credentials and tunnel webhook variables
              </p>
            </div>
            <span
              className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-200 ${
                showServerConfig ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </div>

          {/* Collapsible content */}
          {showServerConfig && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/10 space-y-4 animate-fade-in text-left">
              {serverSuccess && (
                <div className="mb-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/35 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs flex items-center gap-2 font-bold animate-fade-in">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Twilio configurations updated successfully!</span>
                </div>
              )}

              {serverError && (
                <div className="mb-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 text-red-655 dark:text-red-400 rounded-lg text-xs flex items-center gap-2 font-bold animate-fade-in">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleServerSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Twilio Account SID
                  </label>
                  <input
                    type="text"
                    value={accountSid}
                    onChange={(e) => setAccountSid(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Twilio Auth Token
                  </label>
                  <input
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                      WhatsApp Sender Number
                    </label>
                    <input
                      type="text"
                      value={whatsappNum}
                      onChange={(e) => setWhatsappNum(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                      Voice Caller Number
                    </label>
                    <input
                      type="text"
                      value={phoneNum}
                      onChange={(e) => setPhoneNum(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Default Content Template SID
                  </label>
                  <input
                    type="text"
                    value={templateSid}
                    onChange={(e) => setTemplateSid(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Ngrok Webhook Base URL (BASE_URL)
                  </label>
                  <input
                    type="url"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={serverSaving}
                    className="px-5 py-2.5 bg-primary text-white font-sans text-xs font-bold rounded-lg hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    {serverSaving ? 'Updating System...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 4. DANGER ZONE */}
      <div className="bg-white dark:bg-slate-900 border border-red-200/50 dark:border-red-950/30 rounded-xl p-5 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
        <h4 className="font-sans font-bold text-sm text-red-650 dark:text-red-400 mb-2">
          Danger Zone
        </h4>
        <p className="text-xs text-slate-550 dark:text-slate-400 mb-5 leading-normal">
          If you want to clear your local workspace logs, mock message databases, customized templates, or reset lead scores back to the original seeds, trigger the database reset below.
        </p>
        <button
          onClick={handleResetData}
          className="px-4 py-2 bg-red-50 text-red-655 border border-red-200 hover:bg-red-100 dark:bg-red-950/25 dark:text-red-400 dark:border-red-900/55 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer"
        >
          Reset Local Database
        </button>
      </div>

      {/* Reset DB Confirm Dialog */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        title="Reset Local Database"
        message="Are you sure you want to reset all mock databases? This will restore initial seeds for leads, call histories, templates, and chats, and delete any custom additions. This action cannot be undone."
        confirmText="Reset Database"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmReset}
        onCancel={() => setResetConfirmOpen(false)}
      />

    </div>
  );
};

export default SettingsPanel;
