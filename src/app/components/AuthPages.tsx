'use client';

import { AuthView } from "../lib/types";



interface AuthPagesProps {
  view: AuthView;
  onDoLogin: () => void;
  onShowAuth: (view: 'login' | 'register') => void;
  onToggleTheme: () => void;
}

export default function AuthPages({ view, onDoLogin, onShowAuth, onToggleTheme }: AuthPagesProps) {
  if (view === 'login') {
    return (
      <div className="auth-page active">
        <button className="notif-btn" title="Toggle Dark Mode" onClick={onToggleTheme} style={{position: 'fixed', top: '20px', right: '20px', zIndex: '1001'}}>
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          </button>
          <div className="card" style={{width: '100%', maxWidth: '400px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <div className="logo-mark" style={{margin: '0 auto 1rem', width: '48px', height: '48px'}}>
                <svg viewBox="0 0 24 24" style={{width: '24px', height: '24px'}}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h2 style={{fontSize: '20px', fontWeight: '700', color: 'var(--g900)'}}>Welcome back</h2>
              <p style={{fontSize: '13px', color: 'var(--g500)', marginTop: '4px'}}>Lagos–Ibadan Oncology Network</p>
            </div>
            <div className="form-group"><label>Email Address</label><input type="email" placeholder="name@facility.org"/></div>
            <div className="form-group"><label>Password</label><input type="password" placeholder="••••••••"/></div>
            <button className="btn btn-primary" style={{width: '100%', justifyContent: 'center', padding: '10px', marginTop: '1rem'}} onClick={onDoLogin}>Sign In</button>
            <div style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: 'var(--g500)'}}>
              Don't have an account? <a href="#" style={{color: 'var(--p)', fontWeight: '600', textDecoration: 'none'}} onClick={() => onShowAuth('register')}>Register facility</a>
            </div>
          </div>      </div>
    );
  }

  return (
    <div className="auth-page active">
        <div className="card" style={{width: '100%', maxWidth: '460px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}>
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <h2 style={{fontSize: '20px', fontWeight: '700', color: 'var(--g900)'}}>Register Facility</h2>
            <p style={{fontSize: '13px', color: 'var(--g500)', marginTop: '4px'}}>Join the redistribution network</p>
          </div>
          <div className="form-group"><label>Facility Name</label><input type="text" placeholder="e.g. LUTH Pharmacy"/></div>
          <div className="form-row">
            <div className="form-group"><label>Facility Type</label><select><option>Donor Hub</option><option>Recipient Hub</option></select></div>
            <div className="form-group"><label>Admin Name</label><input type="text" placeholder="Full Name"/></div>
          </div>
          <div className="form-group"><label>Work Email</label><input type="email" placeholder="admin@facility.org"/></div>
          <div className="form-row">
            <div className="form-group"><label>Password</label><input type="password" placeholder="••••••••"/></div>
            <div className="form-group"><label>Confirm</label><input type="password" placeholder="••••••••"/></div>
          </div>
          <button className="btn btn-primary" style={{width: '100%', justifyContent: 'center', padding: '10px', marginTop: '1rem'}} onClick={() => onShowAuth('login')}>Create Account</button>
          <div style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: 'var(--g500)'}}>
            Already registered? <a href="#" style={{color: 'var(--p)', fontWeight: '600', textDecoration: 'none'}} onClick={() => onShowAuth('login')}>Sign in</a>
          </div>
        </div>    </div>
  );
}
