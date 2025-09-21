import React, { useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import './Auth.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // -------- Google Sign-In --------
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const r = await fetch('http://localhost:5000/api/auth/login-with-firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await r.json();
      if (data?.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else setError(data?.message || 'Login failed');
    } catch (e) {
      setError(e.message || 'Google sign-in failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account using Google</p>
        </div>

        {error && <div className="error-message"><AlertCircle size={16} />{error}</div>}

        <div className="auth-form auth-actions">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="auth-button primary"
          >
            Continue with Google <ArrowRight size={20} />
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={onSwitchToRegister} className="link-button">
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
 