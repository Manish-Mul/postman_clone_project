import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './layout.module.css';
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/Auth';
import { Context } from '../../contexts/Store';
import WorkspaceDropdown from '../workspace/WorkspaceDropdown';

const Header = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const { state } = useContext(Context);
  const navigate = useNavigate();

  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const profileRef = useRef(null);

  // Dropdown closed 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleLogout = () => {
    console.log('Logout clicked');
    logout();
    setShowProfileDropdown(false);
    console.log('Redirecting...');
    window.location.replace('http://localhost:5173/signin');
  };

  return (
    <header
      className={`${styles.header} ${
        darkMode ? styles.darkHeader : styles.lightHeader
      }`}
    >
      {/* Left Menu */}
      <ul className={styles.header_menu__left}>
        <li>Home</li>
        <li 
          onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
          style={{ 
            cursor: 'pointer', 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Workspaces
          <i 
            className="feather-chevron-down" 
            style={{ 
              fontSize: '16px',
              transition: 'transform 0.2s ease',
              transform: showWorkspaceDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          ></i>
        </li>
        <li>Reports</li>
        <li>Explore</li>
      </ul>

      <WorkspaceDropdown 
        isOpen={showWorkspaceDropdown} 
        onClose={() => setShowWorkspaceDropdown(false)} 
      />

      {/* Search Box */}
      <div className={styles.search_box}>
        <i className="feather-search"></i>
        <input type="text" placeholder="Search Postman Clone" />
      </div>

      {/* Right Menu */}
      <div className={styles.header_menu__right} style={{ overflow: 'visible' }}>
        <div className={styles.iconMenu}>
          <button><i className="feather-cloud"></i></button>
        </div>
        <div className={styles.inviteMenu}>
          <button><i className="feather-user-plus"></i> Invite</button>
        </div>
        <div className={styles.iconMenu}><button><i className="feather-rss"></i></button></div>
        <div className={styles.iconMenu}><button><i className="feather-settings"></i></button></div>
        <div className={styles.iconMenu}><button><i className="feather-bell"></i></button></div>
        
        {/* Profile Button with Dropdown */}
        <div 
          ref={profileRef}
          className={styles.userMenu}
          style={{ position: 'relative', cursor: 'pointer', zIndex: 10000 }}
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>

          {/* Dropdown WITHOUT Portal*/}
         {showProfileDropdown && (
  <div
    onClick={(e) => e.stopPropagation()}
    style={{
      position: 'fixed',
      top: '60px',
      right: '20px',
      background: darkMode ? '#2c2c2c' : '#ffffff',  
      border: '1px solid',
      borderColor: darkMode ? '#444' : '#ddd',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      minWidth: '240px',
      zIndex: 99999,
      overflow: 'visible'
    }}
  >
    {/* User Info Section */}
    <div style={{
      padding: '16px',
      borderBottom: '1px solid',
      borderColor: darkMode ? '#444' : '#e0e0e0',
      background: darkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)'
    }}>
      <div style={{ 
        fontWeight: '600', 
        marginBottom: '4px', 
        fontSize: '15px',
        color: darkMode ? '#fff' : '#1a1a1a'  
      }}>
        {user?.username || 'User'}
      </div>
      <div style={{ 
        fontSize: '13px', 
        color: darkMode ? '#aaa' : '#666' 
      }}>
        {user?.email}
      </div>
    </div>

    {/* Menu Items */}
    <div style={{ padding: '8px 0' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log('Profile clicked');
          setShowProfileDropdown(false);
        }}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: 'none',
          background: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: darkMode ? '#fff' : '#1a1a1a', 
          transition: 'background 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <i className="feather-user" style={{ fontSize: '18px' }}></i>
        My Profile
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log('Settings clicked');
          setShowProfileDropdown(false);
        }}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: 'none',
          background: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: darkMode ? '#fff' : '#1a1a1a',  
          transition: 'background 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <i className="feather-settings" style={{ fontSize: '18px' }}></i>
        Settings
      </button>

      <div style={{ 
        height: '1px', 
        background: darkMode ? '#444' : '#e0e0e0',  
        margin: '8px 12px' 
      }}></div>

      <button
        onClick={() => {
          console.log('Logout button CLICKED');
          handleLogout();
        }}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: 'none',
          background: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fc4a1a',  
          fontWeight: '500',
          transition: 'background 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(252, 74, 26, 0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <i className="feather-log-out" style={{ fontSize: '18px' }}></i>
        Logout
      </button>
    </div>
  </div>
)}


        </div>

        <div className={styles.upgradeMenu}>
          <div>
            <button>Upgrade</button>
            <button><i className="feather-chevron-down"></i></button>
          </div>
        </div>

        <div className={styles.iconMenu}>
          <button
            onClick={toggleTheme}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <i className={darkMode ? 'feather-eye' : 'feather-eye-off'}></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
