import React, { useState } from 'react';

export const SettingsPanel: React.FC = () => {
  const [accountSid, setAccountSid] = useState('AC6bd5b0d891dab63f1048d0bb2e6dca04');
  const [authToken, setAuthToken] = useState('••••••••••••••••••••••••••••••••');
  const [whatsappNum, setWhatsappNum] = useState('whatsapp:+916291745601');
  const [templateSid, setTemplateSid] = useState('HXdc1311d3869ec9e14c9ced8023d7e3e7');
  const [phoneNum, setPhoneNum] = useState('+916291745601');
  const [baseUrl, setBaseUrl] = useState('https://f01b-103-241-12-88.ngrok-free.app');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    // Simulate save duration
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all mock databases? This will restore initial seeds for leads, call histories, templates, and chats, and delete any custom additions.'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-container-padding max-w-2xl mx-auto animate-fade-in text-on-surface select-none">
      
      {/* Title */}
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-text-primary dark:text-text-primary font-bold">
          Twilio System Settings
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Adjust sandbox credentials and Webhook parameters used for message dispatching.
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="mb-6 p-4 bg-status-converted/10 border border-status-converted/35 text-status-converted rounded-xl text-body-md flex items-center gap-2 font-bold animate-fade-in">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>Twilio configurations updated successfully!</span>
        </div>
      )}

      {/* Settings Form Card */}
      <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-6 shadow-xs mb-8">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Account SID */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 font-bold">
              Twilio Account SID
            </label>
            <input
              type="text"
              value={accountSid}
              onChange={(e) => setAccountSid(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all font-mono"
              placeholder="AC..."
              required
            />
          </div>

          {/* Auth Token */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 font-bold">
              Twilio Auth Token
            </label>
            <input
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all font-mono"
              placeholder="token..."
              required
            />
          </div>

          {/* Twilio Numbers row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 font-bold">
                WhatsApp Sender Number
              </label>
              <input
                type="text"
                value={whatsappNum}
                onChange={(e) => setWhatsappNum(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 font-bold">
                Voice Caller Number
              </label>
              <input
                type="text"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all font-mono"
                required
              />
            </div>
          </div>

          {/* Default Template SID */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 font-bold">
              Default Content Template SID
            </label>
            <input
              type="text"
              value={templateSid}
              onChange={(e) => setTemplateSid(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all font-mono"
              required
            />
          </div>

          {/* Ngrok Tunnel URL */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 font-bold">
              Ngrok Webhook Base URL (BASE_URL)
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-border rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all font-mono"
              required
            />
          </div>

          {/* Save Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {saving ? 'Updating System...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Diagnostics / Reset Card */}
      <div className="bg-surface-container-lowest border border-error-container/40 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-error" />
        <h4 className="font-headline-md text-[18px] font-bold text-error mb-2">
          Danger Zone
        </h4>
        <p className="font-body-md text-body-md text-on-surface-variant mb-5">
          If you want to clear your local workspace logs, mock message databases, customized templates, or reset lead scores back to the original seeds, trigger the wipe below.
        </p>
        <button
          onClick={handleResetData}
          className="px-5 py-2.5 bg-error/10 text-error hover:bg-error/20 border border-error/25 rounded-lg font-bold transition-colors cursor-pointer"
        >
          Reset Local Database
        </button>
      </div>

    </div>
  );
};
export default SettingsPanel;
