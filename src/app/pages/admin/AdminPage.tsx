"use client";

import { ModalId, PageId } from '@/app/lib/types';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import UsersPage from '@/app/pages/dashboard/UsersPage';
import FacilitiesPage from '@/app/pages/dashboard/FacilitiesPage';
import AuditPage from '@/app/pages/dashboard/AuditPage';


interface AdminPageProps {
  onNav?: (id: PageId) => void;
  onOpenModal?: (id: ModalId) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNav }) => {
  const [section, setSection] = useState<'overview' | 'roles' | 'integrations' | 'users' | 'facilities' | 'audit'>('overview');
  const [search, setSearch] = useState('');
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState<boolean>(() => typeof window !== 'undefined' && window.localStorage.getItem('adminAuth') === '1');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const handleAdminLogin = () => {
    if (!adminUser || !adminPass) return;
    // naive local auth — replace with real auth call
    window.localStorage.setItem('adminAuth', '1');
    setIsAuthed(true);
  };

  const handleAdminLogout = () => {
    window.localStorage.removeItem('adminAuth');
    setIsAuthed(false);
  };

  const goToDashboard = (target: PageId) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('adminTarget', target);
    router.push('/pages/dashboard');
  };

  if (!isAuthed) {
    return (
      <div className="page active">
        <div className="ph">
          <div className="ph-left"><h1>Admin Sign In</h1><p>Enter administrator credentials to continue</p></div>
        </div>
        <div className="card" style={{maxWidth:420, marginTop:12}}>
          <div className="form-group"><label>Username</label><input value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder="admin" /></div>
          <div className="form-group"><label>Password</label><input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="••••••••" /></div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn btn-primary" onClick={handleAdminLogin}>Sign In</button>
            <button className="btn btn-ghost" onClick={() => router.push('/')}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-left">
          <h1>Administration Console</h1>
          <p>System-wide settings, roles and integrations</p>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost" onClick={handleAdminLogout}>Sign out</button>
        </div>
      </div>

      <div className="g-main" style={{gap: '1rem'}}>
        <div className="card" style={{padding: '1rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '1rem'}}>
              <div style={{display:'flex',gap: '8px',flexWrap:'wrap'}}>
                <button className={`tab-btn ${section === 'overview' ? 'on' : ''}`} onClick={() => setSection('overview')}>Overview</button>
                <button className={`tab-btn ${section === 'users' ? 'on' : ''}`} onClick={() => setSection('users')}>Users</button>
                <button className={`tab-btn ${section === 'facilities' ? 'on' : ''}`} onClick={() => setSection('facilities')}>Facilities</button>
                <button className={`tab-btn ${section === 'audit' ? 'on' : ''}`} onClick={() => setSection('audit')}>Audit</button>
                <button className={`tab-btn ${section === 'roles' ? 'on' : ''}`} onClick={() => setSection('roles')}>Roles</button>
                <button className={`tab-btn ${section === 'integrations' ? 'on' : ''}`} onClick={() => setSection('integrations')}>Integrations</button>
              </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} style={{padding:'8px 10px',borderRadius:8,border:'1px solid var(--g200)'}} />
              <button className="btn btn-outline" onClick={() => onNav && onNav('pg-settings')}>Go to Settings</button>
            </div>
          </div>

          {section === 'overview' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
                <div className="summary-card">
                  <strong>24</strong>
                  <span>Facilities</span>
                </div>
                <div className="summary-card">
                  <strong>821</strong>
                  <span>Verified Vials</span>
                </div>
                <div className="summary-card">
                  <strong>7</strong>
                  <span>Near Expiry</span>
                </div>
                <div className="summary-card">
                  <strong>1</strong>
                  <span>Quarantined</span>
                </div>
              </div>
              <div style={{marginTop:12}}>
                <h3 style={{marginBottom:8}}>Quick Actions</h3>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <button className="btn btn-primary">Run Health Check</button>
                  <button className="btn btn-outline">Sync All Facilities</button>
                  <button className="btn btn-ghost">Export Audit</button>
                </div>
              </div>
              <div style={{marginTop:16}}>
                <h3 style={{marginBottom:8}}>Jump to Dashboard</h3>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <button className="btn btn-outline" onClick={() => goToDashboard('pg-facilities')}>Facility Access</button>
                  <button className="btn btn-outline" onClick={() => goToDashboard('pg-users')}>User Management</button>
                  <button className="btn btn-outline" onClick={() => goToDashboard('pg-audit')}>Audit Log</button>
                </div>
              </div>
            </div>
          )}

          {section === 'users' && (
            <div style={{marginTop:12}}>
              <UsersPage onNav={(id: PageId) => { window.localStorage.setItem('adminTarget', id); router.push('/pages/dashboard'); }} onOpenModal={() => {}} />
            </div>
          )}

          {section === 'facilities' && (
            <div style={{marginTop:12}}>
              <FacilitiesPage onNav={(id: PageId) => { window.localStorage.setItem('adminTarget', id); router.push('/pages/dashboard'); }} onOpenModal={() => {}} />
            </div>
          )}

          {section === 'audit' && (
            <div style={{marginTop:12}}>
              <AuditPage />
            </div>
          )}

          {section === 'roles' && (
            <div>
              <h3 style={{marginBottom:8}}>Roles & Permissions</h3>
              <div className="card" style={{padding:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700}}>Network Admin</div>
                    <div style={{fontSize:12,color:'var(--g400)'}}>Full access across all modules</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-outline">Edit</button>
                    <button className="btn btn-danger">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'integrations' && (
            <div>
              <h3 style={{marginBottom:8}}>External Integrations</h3>
              <div className="card" style={{padding:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700}}>HMO Sync</div>
                    <div style={{fontSize:12,color:'var(--g400)'}}>Active — Last sync 12m ago</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-primary">Manual Sync</button>
                    <button className="btn btn-outline">Settings</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{padding: '1rem'}}>
          <h3 style={{marginBottom:8}}>Activity Feed</h3>
          <div className="log-item"><div className="log-dot" style={{background: 'var(--p)'}}></div><div className="log-content"><div className="log-action">User Dr. Musa updated facility settings</div><div className="log-meta">5m ago · Network Admin</div></div></div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
