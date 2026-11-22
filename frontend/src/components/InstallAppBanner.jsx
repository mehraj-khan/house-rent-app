/* eslint-disable */
import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pwa_dismissed') === '1');

  useEffect(() => {
    // اگر پہلے سے انسٹال شدہ ایپ میں کھلا ہو تو بینر نہ دکھائیں
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) return;

    // Android / Desktop Chrome Install Event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // iPhone / iPad Safari check
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIos) setShowIosHint(true);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (dismissed || (!deferredPrompt && !showIosHint)) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleClose = () => {
    sessionStorage.setItem('pwa_dismissed', '1');
    setDismissed(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '92%',
        maxWidth: '420px',
        background: '#0f172a',
        color: '#ffffff',
        padding: '12px 14px',
        borderRadius: '14px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        border: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        zIndex: 99998,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: '#2563eb', padding: '8px', borderRadius: '10px', display: 'flex' }}>
          <Smartphone size={20} color="#fff" />
        </div>
        <div>
          <b style={{ fontSize: '13px', display: 'block' }}>Install HouseRent PK App</b>
          <span style={{ fontSize: '11px', color: '#cbd5e1' }}>
            {deferredPrompt
              ? 'Fast access from your home screen!'
              : 'Tap Share (⬆️) → "Add to Home Screen"'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            style={{
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              padding: '7px 12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Download size={14} /> Install
          </button>
        )}
        <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallAppBanner;