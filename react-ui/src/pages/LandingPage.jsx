import React from 'react';
import { Link } from 'react-router-dom'; 

function LandingPage() {
  return (
    <div>
      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        background: '#fff',
        borderBottom: '1px solid #eee'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo192.png" alt="Windows" width="32" />
          <div style={{ display: 'flex', gap: '3rem' }}>
            <span>Product</span>
            <span>Solutions</span>
            <span>Pricing</span>
            <span>Enterprise</span>
            <span>Why Postman</span>
            <span>Resources</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button>Contact Sales</button>

          {/* Link to Sign In Page */}
          <Link to="/signin" style={{ display: 'flex', gap: '1rem' }}>
            <button>Sign In</button>
          </Link>
        
        <Link to="/signup">
          <button style={{ background: '#fc4a1a', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>
            Sign Up for Free
          </button>
        </Link>

        </div>
      </nav>

      <div style={{ fontFamily: 'sans-serif', padding: '0.5rem', background: '#fff' }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(90deg, #fc4a1a, #fc4a1a 15%, #f7b733 85%)',
          color: '#fff',
          padding: '1rem 0',
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          82% of orgs are API-first. Collaboration and velocity depend on it.
        </div>

        {/* Main Content */}
        <div style={{ marginLeft: '7rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: '2rem', gap: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '700' }}>
                AI needs context. APIs <br />
                deliver it.
              </span>
            </h1>
            <p style={{ fontSize: '1.1rem', marginTop: '2.5rem', marginBottom: '2rem', maxWidth: '600px', lineHeight: '1.5' }}>
              Postman is the platform where teams build those APIs together.<br />
              With built-in support for the Model Context Protocol (MCP),<br />
              Postman helps you design, test, and manage APIs that power <br />
              both human workflows and intelligent agents.
            </p>
            <Link to="/signup">
            <button style={{ background: '#fc4a1a', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '6px', fontWeight: 'bold', marginRight: '12px' }}>
              Sign Up for Free
            </button> </Link>
            <button style={{ background: '#f4f4f4', color: '#333', border: '1px solid #ddd', padding: '12px 28px', borderRadius: '6px', fontWeight: 'bold' }}>
              Watch a Demo
            </button>
            <div style={{ marginTop: '4rem', fontWeight: 'bold' }}>
              Download the desktop app for
              <div style={{ marginTop: '0.5rem' }}>
                <img src="/windows-icon.png" alt="Windows" width="32" style={{ marginRight: '1rem' }} />
                <img src="/apple-icon.png" alt="macOS" width="32" style={{ marginRight: '1rem' }} />
                <img src="/linux-icon.png" alt="Linux" width="32" />
              </div>
            </div>
          </div>
          <div>
            <img src="/api-blocks.png" alt="API Illustration" width="600" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
