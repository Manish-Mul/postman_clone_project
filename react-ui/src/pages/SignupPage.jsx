import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password_hash: password, 
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setEmail('');
        setUsername('');
        setPassword('');
      } else {
        setError(data.error || 'Sign up failed');
      }
    } catch (err) {
      setError('Network or server error');
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #fff 60%, #fae1c3 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 3px 16px rgba(0,0,0,0.10)',
          padding: '2rem',
          width: '350px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <img 
          src="/logo192.png" 
          alt="Postman Logo" 
          style={{ marginLeft:'115px', width: '60px', marginBottom: '30px' }} 
        />
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Create Postman Clone account...
        </h2>

        <label style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
          Work email
        </label>
        <input
          type="email"
          placeholder="Work email"
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

        <label style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
          Username
        </label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          required
        />

        <label style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
          Password
        </label>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type={showPassword ? "text" : "password"}
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
              fontWeight: 600
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.7rem', fontSize: '0.97rem', color: '#333' }}>
          <input
            type="checkbox"
            checked={marketing}
            onChange={() => setMarketing(!marketing)}
            style={{ marginRight: '0.6rem' }}
          />
          Receive product updates, news, and other marketing communications
        </label>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', fontSize: '0.97rem', color: '#333' }}>
          <input
            type="checkbox"
            checked={staySignedIn}
            onChange={() => setStaySignedIn(!staySignedIn)}
            style={{ marginRight: '0.6rem' }}
          />
          Stay signed in
        </label>

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

        {success &&
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green" width="20px" height="20px" style={{ marginRight: '8px' }}>
              <path d="M20.292 5.708l-11 11-5-5 1.414-1.414 3.586 3.586 9.586-9.586z" />
            </svg>
            Success!
          </div>
        }

        <span style={{ fontSize: '0.95rem', color: '#666', marginBottom: '1rem' }}>
          By creating an account, you agree to our&nbsp;
          <a href="#" style={{ color: '#007bff', textDecoration: 'none' }}>terms</a>
          &nbsp;and&nbsp;
          <a href="#" style={{ color: '#007bff', textDecoration: 'none' }}>privacy policy</a>.
        </span>

        <button
          type="submit"
          style={{
            background: '#fc4a1a',
            color: 'white',
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontSize: '1.08rem',
            cursor: 'pointer'
          }}
        >
          Create Free Account
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: '#999'
        }}>
          <span>or</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '0.7rem', color: '#555', fontSize: '0.97rem' }}>
          Already have an account?&nbsp;
          <Link to="/signin" style={{ color: '#007bff', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </form>
    </div>
  );
}

export default SignupPage;
