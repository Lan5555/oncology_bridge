import type React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="block active">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4">
    <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_p]:mt-1 [&_p]:text-[12.5px] [&_p]:text-slate-500"><h1>Settings</h1><p>System configuration and network preferences</p></div>
  </div>
  <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-[960px]:grid-cols-1">
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between gap-2"><div className="text-[15px] font-bold text-slate-950">General Configuration</div></div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>Network Name</label><input type="text" defaultValue="Lagos–Ibadan Oncology Network"/></div>
        <div className="grid grid-cols-2 gap-4 max-[768px]:grid-cols-1">
          <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>Alert Threshold (Days)</label><input type="number" defaultValue="60"/></div>
          <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>Currency Display</label><select><option>NGN (₦)</option><option>USD ($)</option></select></div>
        </div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
          <label>Notification Email</label>
          <input type="email" defaultValue="admin@oncologybridge.org"/>
        </div>
        <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900">Update Profile</button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between gap-2"><div className="text-[15px] font-bold text-slate-950">Security & Access</div></div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--g50)', borderRadius: 'var(--rsm)', marginBottom: '10px'}}>
          <div>
            <div style={{fontSize: '13px', fontWeight: '600'}}>Two-Factor Authentication</div>
            <div style={{fontSize: '11px', color: 'var(--g500)'}}>Require OTP for all admin actions</div>
          </div>
          <input type="checkbox" style={{width: '40px', height: '20px'}} defaultChecked/>
        </div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--g50)', borderRadius: 'var(--rsm)', marginBottom: '10px'}}>
          <div>
            <div style={{fontSize: '13px', fontWeight: '600'}}>Biometric Verification</div>
            <div style={{fontSize: '11px', color: 'var(--g500)'}}>Use FaceID/TouchID for high-value transfers</div>
          </div>
          <input type="checkbox" style={{width: '40px', height: '20px'}}/>
        </div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--g50)', borderRadius: 'var(--rsm)'}}>
          <div>
            <div style={{fontSize: '13px', fontWeight: '600'}}>IP Lockdown</div>
            <div style={{fontSize: '11px', color: 'var(--g500)'}}>Restrict access to whitelisted facility IPs</div>
          </div>
          <input type="checkbox" style={{width: '40px', height: '20px'}} defaultChecked/>
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between gap-2"><div className="text-[15px] font-bold text-slate-950">Data & Sync</div></div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
          <label>Sync Frequency</label>
          <select><option>Real-time (Push)</option><option>Every 5 minutes</option><option>Every 15 minutes</option></select>
        </div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]" style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem'}}>
          <input type="checkbox" id="chk-offline" style={{width: 'auto'}} defaultChecked/>
          <label htmlFor="chk-offline" style={{marginBottom: '0'}}>Enable Offline-First Mode</label>
        </div>
        <div className="my-5 h-px bg-slate-100 text-center text-slate-400"></div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
          <label>API Key (Read-only)</label>
          <div style={{display: 'flex', gap: '8px'}}>
            <input type="password" defaultValue="••••••••••••••••" readOnly style={{background: 'var(--g50)'}}/>
            <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800">Copy</button>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5" style={{background: 'var(--errl)', borderColor: 'var(--err)'}}>
        <div className="mb-4 flex items-center justify-between gap-2"><div className="text-[15px] font-bold text-slate-950" style={{color: 'var(--err)'}}>Danger Zone</div></div>
        <p style={{fontSize: '12px', color: 'var(--err)', marginBottom: '12px'}}>Actions here affect the entire Lagos–Ibadan network.</p>
        <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-red-200 bg-red-50 text-red-800" style={{width: '100%', justifyContent: 'center'}}>Purge Network Cache</button>
      </div>
    </div>
  </div>
    </div>
  );
}

export default SettingsPage;
