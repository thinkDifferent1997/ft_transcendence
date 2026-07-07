import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * AccountPage
 * -----------
 * Landing after a full login. Lets the user enrol in 2FA:
 *   - POST /api/auth/2fa/setup  -> shows the QR code + secret
 *   - POST /api/auth/2fa/enable -> confirms with a 6-digit code
 * Auth is carried by the httpOnly access_token cookie (credentials:
 * 'include'), so no token is handled in JS.
 */
export default function AccountPage() {
  const [setup, setSetup] = useState<
    null | { secret: string; qrCodeDataUrl: string }
  >(null);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');

  const startSetup = async () => {
    setStatus('');
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        setStatus('Setup failed — are you logged in?');
        return;
      }
      const data = await res.json();
      setSetup({ secret: data.secret, qrCodeDataUrl: data.qrCodeDataUrl });
    } catch {
      setStatus('Network error.');
    }
  };

  const enable = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('✅ 2FA enabled! Log out and back in to see the challenge.');
        setSetup(null);
        setCode('');
      } else {
        setStatus(`Failed: ${data.message || res.statusText}`);
      }
    } catch {
      setStatus('Network error.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '30px', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#1a1a1a', color: 'white', textAlign: 'center' }}>
      <h2>Your Account</h2>
      <p style={{ color: '#aaa', fontSize: '14px' }}>You are logged in.</p>

      <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
        <h3 style={{ fontSize: '16px' }}>Two-Factor Authentication</h3>

        {!setup && (
          <button
            type="button"
            onClick={startSetup}
            style={{ width: '100%', padding: '12px', fontSize: '16px', backgroundColor: '#00babc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Enable Two-Factor Authentication
          </button>
        )}

        {setup && (
          <div>
            <p style={{ color: '#aaa', fontSize: '13px' }}>
              Scan this in your authenticator app, or enter the secret manually.
            </p>
            <img
              src={setup.qrCodeDataUrl}
              alt="2FA QR code"
              style={{ width: '180px', height: '180px', background: 'white', padding: '8px', borderRadius: '4px' }}
            />
            <p style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', color: '#ccc' }}>
              {setup.secret}
            </p>

            <form onSubmit={enable} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white', textAlign: 'center', letterSpacing: '4px' }}
              />
              <button
                type="submit"
                style={{ padding: '12px', fontSize: '16px', backgroundColor: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Confirm &amp; Enable
              </button>
            </form>
          </div>
        )}

        {status && (
          <p style={{ marginTop: '15px', fontSize: '14px', color: status.startsWith('✅') ? '#4caf50' : '#ff6b6b' }}>
            {status}
          </p>
        )}
      </div>

      <div style={{ marginTop: '30px', borderTop: '1px dashed #444', paddingTop: '15px' }}>
        <Link to="/quiz">
          <button type="button" style={{ background: 'transparent', color: '#ff9900', border: '1px dashed #ff9900', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Go to Quiz →
          </button>
        </Link>
      </div>
    </div>
  );
}
