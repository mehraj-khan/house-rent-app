/* eslint-disable */
import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pwa_dismissed') === '1');

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(standalone);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (isStandalone || dismissed) return null;

  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else {
      // اگر براؤزر نے خود پاپ اپ نہ دیا ہو (جیسے iPhone یا لوکل ٹیسٹنگ) تو گائیڈ دکھائیں
      setShowGuide(!showGuide);
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
        zIndex: 99998,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#2563eb', padding: '8px', borderRadius: '10px', display: 'flex' }}>
            <Smartphone size={20} color="#fff" />
          </div>
          <div>
            <b style={{ fontSize: '13px', display: 'block' }}>Install HouseRent PK App</b>
            <span style={{ fontSize: '11px', color: '#cbd5e1' }}>
              Mobile app ki tarah home screen par chalayein!
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              whiteSpace: 'nowrap',
            }}
          >
            <Download size={14} /> Install
          </button>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {showGuide && (
        <div style={{ marginTop: '10px', padding: '10px', background: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#e2e8f0', lineHeight: '1.5' }}>
          {isIos ? (
            <>📱 <b>iPhone / Safari:</b> Neeche <b>Share (⬆️)</b> button dabayein → <b>"Add to Home Screen"</b> par click karein!</>
          ) : (
            <>📲 <b>Android / Chrome:</b> Upar kone mein <b>⋮ (3 dots)</b> dabayein → <b>"Install app"</b> ya <b>"Add to Home screen"</b> par click karein! <i>(Live HTTPS site par 1-click popup bhi khulta hai)</i></>
          )}
        </div>
      )}
    </div>
  );
};

export default InstallAppBanner;