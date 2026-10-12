import type React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="block animate-fade-up">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap max-md:flex-col max-md:items-stretch max-md:gap-4">
    <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-g900 [&_h1]:tracking-[-0.4px] [&_p]:text-[12.5px] [&_p]:text-g500 [&_p]:mt-[3px]"><h1>Settings</h1><p>System configuration and network preferences</p></div>
  </div>
  <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-lg:grid-cols-1">
    <div className="flex flex-col gap-4">
      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
        <div className="flex items-center justify-between mb-4 gap-2"><div className="text-[15px] font-bold text-g900">General Configuration</div></div>
        <div className="mb-4"><label>Network Name</label><input type="text" defaultValue="Lagos–Ibadan Oncology Network" className="p-2"/></div>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div className="mb-4"><label>Alert Threshold (Days)</label><input type="number" defaultValue="60" className="p-2"/></div>
          <div className="mb-4"><label>Currency Display</label><select className="p-2"><option>NGN (₦)</option><option>USD ($)</option></select></div>
        </div>
        <div className="mb-4">
          <label>Notification Email</label>
          <input type="email" defaultValue="admin@oncologybridge.org" className="p-2"/>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd">Update Profile</button>
      </div>

      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
        <div className="flex items-center justify-between mb-4 gap-2"><div className="text-[15px] font-bold text-g900">Security & Access</div></div>
        <div className="mb-4" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--g50)', borderRadius: 'var(--rsm)', marginBottom: '10px'}}>
          <div>
            <div style={{fontSize: '13px', fontWeight: '600'}}>Two-Factor Authentication</div>
            <div style={{fontSize: '11px', color: 'var(--g500)'}}>Require OTP for all admin actions</div>
          </div>
          <input type="checkbox" style={{width: '40px', height: '20px'}} defaultChecked/>
        </div>
        <div className="mb-4" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--g50)', borderRadius: 'var(--rsm)', marginBottom: '10px'}}>
          <div>
            <div style={{fontSize: '13px', fontWeight: '600'}}>Biometric Verification</div>
            <div style={{fontSize: '11px', color: 'var(--g500)'}}>Use FaceID/TouchID for high-value transfers</div>
          </div>
          <input type="checkbox" style={{width: '40px', height: '20px'}}/>
        </div>
        <div className="mb-4" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--g50)', borderRadius: 'var(--rsm)'}}>
          <div>
            <div style={{fontSize: '13px', fontWeight: '600'}}>IP Lockdown</div>
            <div style={{fontSize: '11px', color: 'var(--g500)'}}>Restrict access to whitelisted facility IPs</div>
          </div>
          <input type="checkbox" className="p-2" style={{width: '40px', height: '20px'}} defaultChecked/>
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-4">
      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
        <div className="flex items-center justify-between mb-4 gap-2"><div className="text-[15px] font-bold text-g900">Data & Sync</div></div>
        <div className="mb-4">
          <label>Sync Frequency</label>
          <select className="p-2"><option>Real-time (Push)</option><option>Every 5 minutes</option><option>Every 15 minutes</option></select>
        </div>
        <div className="mb-4" style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem'}}>
          <input type="checkbox" id="chk-offline" style={{width: 'auto'}} defaultChecked/>
          <label htmlFor="chk-offline" style={{marginBottom: '0'}}>Enable Offline-First Mode</label>
        </div>
        <div className="h-px bg-g100 my-5"></div>
        <div className="mb-4">
          <label>API Key (Read-only)</label>
          <div style={{display: 'flex', gap: '8px'}}>
            <input type="password" defaultValue="••••••••••••••••" readOnly style={{background: 'var(--g50)'}}/>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p">Copy</button>
          </div>
        </div>
      </div>
      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4" style={{background: 'var(--errl)', borderColor: 'var(--err)'}}>
        <div className="flex items-center justify-between mb-4 gap-2"><div className="text-[15px] font-bold text-g900" style={{color: 'var(--err)'}}>Danger Zone</div></div>
        <p style={{fontSize: '12px', color: 'var(--err)', marginBottom: '12px'}}>Actions here affect the entire Lagos–Ibadan network.</p>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-errl text-[#991b1b] border border-[#fecaca] dk:text-w dk:border-err" style={{width: '100%', justifyContent: 'center'}}>Purge Network Cache</button>
      </div>
    </div>
  </div>
    </div>
  );
}

export default SettingsPage;
