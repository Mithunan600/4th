import React, { useState } from 'react';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // -------- Google Sign-In --------
  const handleGoogleRegister = async () => {
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
        onRegister(data.user);
      } else setError(data?.message || 'Registration failed');
    } catch (e) {
      setError(e.message || 'Google sign-in failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Register with Google</p>
        </div>

        {error && <div className="error-message"><AlertCircle size={16} />{error}</div>}

        <div className="auth-form auth-actions">
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="auth-button primary"
          >
            Continue with Google <ArrowRight size={20} />
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin} className="link-button">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
