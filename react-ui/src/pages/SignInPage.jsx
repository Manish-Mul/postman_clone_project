import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/Auth';

function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRedirecting(false);

    console.log('🔐 Attempting login with:', { email, password });

    try {
      // Changed to /auth/login
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
  const token = data.token;
  const userData = data.user;

  console.log('Login successful:', { token, userData });

  if (!token) {
    setError('No token received from server');
    console.error('Token missing in response');
    return;
  }

  const userWithId = {
    ...userData,
    user_id: userData.user_id
  };

  console.log('User object being saved:', userWithId);

  // Save in both context and localStorage
  login(userWithId, token);
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userWithId));

  setRedirecting(true);
  setTimeout(() => {
    navigate('/app');
  }, 1500);
}
 else {
        const errorMsg = data.error || data.message || 'Sign in failed';
        console.error('Login failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network or server error. Is your backend running?');
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f7f7f7',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    }}>
      <img
        src="/logo192.png"
        alt="Postman Logo"
        style={{ width: '60px', marginBottom: '30px' }}
      />

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#fff',
          padding: '2.5rem',
          borderRadius: '10px',
          boxShadow: '0px 3px 10px rgba(0,0,0,0.1)',
          width: '350px',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          Sign in to Postman Clone
        </h2>

        <label htmlFor="email" style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
          Email or username
        </label>
        <input
          id="email"
          type="text"
          placeholder="Email or username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          required
        />

        <label htmlFor="password" style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
          Password
        </label>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              marginLeft: '10px',
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={staySignedIn}
              onChange={() => setStaySignedIn(!staySignedIn)}
              style={{ marginRight: '0.5rem' }}
            />
            Stay signed in
          </label>
          <a href="#" style={{
            fontSize: '0.9rem',
            color: '#007bff',
            textDecoration: 'none'
          }}>
            Forgot password?
          </a>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {redirecting && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            ✓ Login successful! Redirecting...
          </div>
        )}

        <button
          type="submit"
          style={{
            backgroundColor: '#fc4a1a',
            color: 'white',
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Sign In
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <div style={{ margin: '0.5rem 0', color: '#666' }}>or</div>
          <a
            href="/signup"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Create free account
          </a>
        </div>
      </form>
    </div>
  );
}

export default SignInPage;
