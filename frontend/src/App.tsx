import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import QuizPage from './pages/QuizPage';
import './App.css';

function AuthForms() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose the right route depending on whether we are signing up or signing in
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering 
      ? { email, username, password } 
      : { email, password };

    try {
      console.log(`Sending request to ${endpoint}...`);
      
      const response = await fetch(`https://localhost:8443${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Success! Backend says: ${JSON.stringify(data)}`);
        // When auth is officially done , we can add a programmatic redirect here
      } else {
        alert(`Request Failed: ${data.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to connect to the backend API. Is NestJS running?");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '30px', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#1a1a1a', color: 'white', textAlign: 'center' }}>
      <h2>{isRegistering ? 'Create an Account' : 'Welcome to Transcendence'}</h2>
      <p style={{ color: '#aaa', fontSize: '14px' }}>Please authenticate to access the quiz arena.</p>

      {/* 42 OAuth Strategy Button */}
      <a href="https://localhost:8443/api/auth/42" style={{ textDecoration: 'none' }}>
        <button type="button" style={{ width: '100%', padding: '12px', marginBottom: '20px', fontSize: '16px', backgroundColor: '#00babc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          🔒 Login with 42 Intra
        </button>
      </a>

      <div style={{ margin: '15px 0', color: '#666', fontSize: '14px' }}>— OR —</div>

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white' }}
        />
        
        {isRegistering && (
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white' }}
          />
        )}

        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white' }}
        />

        <button type="submit" style={{ padding: '12px', fontSize: '16px', backgroundColor: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isRegistering ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      {/* Toggle Button between Login and Register views */}
      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
        <span 
          onClick={() => setIsRegistering(!isRegistering)} 
          style={{ color: '#00babc', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegistering ? 'Sign In here' : 'Create an account'}
        </span>
      </p>

      {/* Dev Backdoor to quickly bypass Auth while writing game loops */}
      <div style={{ marginTop: '30px', borderTop: '1px dashed #444', paddingTop: '15px' }}>
        <Link to="/quiz">
          <button type="button" style={{ background: 'transparent', color: '#ff9900', border: '1px dashed #ff9900', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            🛠️ Bypass Auth (Dev Mode)
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthForms />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
}
