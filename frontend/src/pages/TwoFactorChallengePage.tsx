import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * TwoFactorChallengePage
 * ----------------------
 * Standalone 2FA step at route /2fa, reached either by the credential
 * login (when twoFactorRequired) or by the 42 OAuth callback redirect.
 * The pending access_token cookie is already set; this posts the code to
 * /api/auth/2fa/login, which upgrades it to a full token on success.
 */
export default function TwoFactorChallengePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/2fa/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/account');
      } else {
        alert(`2FA failed: ${data.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert('Failed to connect to the backend API. Is NestJS running?');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '30px', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#1a1a1a', color: 'white', textAlign: 'center' }}>
      <h2>Two-Factor Authentication</h2>
      <p style={{ color: '#aaa', fontSize: '14px' }}>
        Enter the 6-digit code from your authenticator app.
      </p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white', textAlign: 'center', letterSpacing: '4px' }}
        />
        <button type="submit" style={{ padding: '12px', fontSize: '16px', backgroundColor: '#00babc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Verify
        </button>
      </form>
      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        <span
          onClick={() => navigate('/')}
          style={{ color: '#00babc', cursor: 'pointer', textDecoration: 'underline' }}
        >
          ← Back to login
        </span>
      </p>
    </div>
  );
}
