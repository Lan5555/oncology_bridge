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
      <div className="block active">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4">
          <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_p]:mt-1 [&_p]:text-[12.5px] [&_p]:text-slate-500"><h1>Admin Sign In</h1><p>Enter administrator credentials to continue</p></div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5" style={{maxWidth:420, marginTop:12}}>
          <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>Username</label><input value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder="admin" /></div>
          <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>Password</label><input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="••••••••" /></div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" onClick={handleAdminLogin}>Sign In</button>
            <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800" onClick={() => router.push('/')}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="block active">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4">
        <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_p]:mt-1 [&_p]:text-[12.5px] [&_p]:text-slate-500">
          <h1>Administration Console</h1>
          <p>System-wide settings, roles and integrations</p>
        </div>
        <div className="flex flex-wrap gap-2 max-[768px]:w-full [&_.btn]:max-[768px]:w-full [&_.btn]:max-[768px]:justify-center">
          <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800" onClick={handleAdminLogout}>Sign out</button>
        </div>
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-[960px]:grid-cols-1" style={{gap: '1rem'}}>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5" style={{padding: '1rem'}}>
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
              <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" onClick={() => onNav && onNav('pg-settings')}>Go to Settings</button>
            </div>
          </div>

          {section === 'overview' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
                <div className="rounded-lg border border-slate-100 bg-slate-100 p-4 [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-slate-950 [&_span]:mt-1 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-slate-500">
                  <strong>24</strong>
                  <span>Facilities</span>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-100 p-4 [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-slate-950 [&_span]:mt-1 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-slate-500">
                  <strong>821</strong>
                  <span>Verified Vials</span>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-100 p-4 [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-slate-950 [&_span]:mt-1 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-slate-500">
                  <strong>7</strong>
                  <span>Near Expiry</span>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-100 p-4 [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-slate-950 [&_span]:mt-1 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-slate-500">
                  <strong>1</strong>
                  <span>Quarantined</span>
                </div>
              </div>
              <div style={{marginTop:12}}>
                <h3 style={{marginBottom:8}}>Quick Actions</h3>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900">Run Health Check</button>
                  <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800">Sync All Facilities</button>
                  <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800">Export Audit</button>
                </div>
              </div>
              <div style={{marginTop:16}}>
                <h3 style={{marginBottom:8}}>Jump to Dashboard</h3>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" onClick={() => goToDashboard('pg-facilities')}>Facility Access</button>
                  <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" onClick={() => goToDashboard('pg-users')}>User Management</button>
                  <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" onClick={() => goToDashboard('pg-audit')}>Audit Log</button>
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
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5" style={{padding:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700}}>Network Admin</div>
                    <div style={{fontSize:12,color:'var(--g400)'}}>Full access across all modules</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800">Edit</button>
                    <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-red-200 bg-red-50 text-red-800">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'integrations' && (
            <div>
              <h3 style={{marginBottom:8}}>External Integrations</h3>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5" style={{padding:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700}}>HMO Sync</div>
                    <div style={{fontSize:12,color:'var(--g400)'}}>Active — Last sync 12m ago</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900">Manual Sync</button>
                    <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800">Settings</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5" style={{padding: '1rem'}}>
          <h3 style={{marginBottom:8}}>Activity Feed</h3>
          <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--p)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">User Dr. Musa updated facility settings</div><div className="mt-0.5 text-[11px] text-slate-400">5m ago · Network Admin</div></div></div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
