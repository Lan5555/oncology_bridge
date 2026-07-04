import type React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="page active">
      <div className="ph">
    <div className="ph-left"><h1>Settings</h1><p>System configuration and network preferences</p></div>
  </div>
  <div className="g-main">
    <div className="g-stack">
      <div className="card">
        <div className="ch"><div className="ct">General Configuration</div></div>
        <div className="form-group"><label>Network Name</label><input type="text" defaultValue="Lagos–Ibadan Oncology Network"/></div>
        <div className="form-row">
          <div className="form-group"><label>Alert Threshold (Days)</label><input type="number" defaultValue="60"/></div>
          <div className="form-group"><label>Currency Display</label><select><option>NGN (₦)</option><option>USD ($)</option></select></div>
        </div>
        <div className="form-group">
          <label>Notification Email</label>
          <input type="email" defaultValue="admin@oncologybridge.org"/>
        </div>
        <button className="btn btn-primary">Update Profile</button>
      </div>

      <div className="card">
        <div className="ch"><div className="ct">Security & Access</div></div>
        <div className="form-group" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--g50)', borderRadius: 'var(--rsm)', marginBottom: '10px'}}>
          <div>
            <div style={{fontSize: '13px', fontWeight: '600'}}>Two-Factor Authentication</div>
            <div style={{fontSize: '11px', color: 'var(--g500)'}}>Require OTP for all admin actions</div>
          </div>
          <input type="checkbox" style={{width: '40px', height: '20px'}} defaultChecked/>
        </div>
        <div className="form-group" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--g50)', borderRadius: 'var(--rsm)', marginBottom: '10px'}}>
          <div>
            <div style={{fontSize: '13px', fontWeight: '600'}}>Biometric Verification</div>
            <div style={{fontSize: '11px', color: 'var(--g500)'}}>Use FaceID/TouchID for high-value transfers</div>
          </div>
          <input type="checkbox" style={{width: '40px', height: '20px'}}/>
        </div>
        <div className="form-group" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--g50)', borderRadius: 'var(--rsm)'}}>
          <div>
            <div style={{fontSize: '13px', fontWeight: '600'}}>IP Lockdown</div>
            <div style={{fontSize: '11px', color: 'var(--g500)'}}>Restrict access to whitelisted facility IPs</div>
          </div>
          <input type="checkbox" style={{width: '40px', height: '20px'}} defaultChecked/>
        </div>
      </div>
    </div>

    <div className="g-stack">
      <div className="card">
        <div className="ch"><div className="ct">Data & Sync</div></div>
        <div className="form-group">
          <label>Sync Frequency</label>
          <select><option>Real-time (Push)</option><option>Every 5 minutes</option><option>Every 15 minutes</option></select>
        </div>
        <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem'}}>
          <input type="checkbox" id="chk-offline" style={{width: 'auto'}} defaultChecked/>
          <label htmlFor="chk-offline" style={{marginBottom: '0'}}>Enable Offline-First Mode</label>
        </div>
        <div className="divider"></div>
        <div className="form-group">
          <label>API Key (Read-only)</label>
          <div style={{display: 'flex', gap: '8px'}}>
            <input type="password" defaultValue="••••••••••••••••" readOnly style={{background: 'var(--g50)'}}/>
            <button className="btn btn-outline">Copy</button>
          </div>
        </div>
      </div>
      <div className="card" style={{background: 'var(--errl)', borderColor: 'var(--err)'}}>
        <div className="ch"><div className="ct" style={{color: 'var(--err)'}}>Danger Zone</div></div>
        <p style={{fontSize: '12px', color: 'var(--err)', marginBottom: '12px'}}>Actions here affect the entire Lagos–Ibadan network.</p>
        <button className="btn btn-danger" style={{width: '100%', justifyContent: 'center'}}>Purge Network Cache</button>
      </div>
    </div>
  </div>
    </div>
  );
}

export default SettingsPage;
