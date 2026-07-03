import { ModalId, PageId } from "../../lib/types";


interface UsersPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

export default function UsersPage({ onNav, onOpenModal }: UsersPageProps) {
  return (
    <div className="page active">
      <div className="ph">
    <div className="ph-left"><h1>User Management</h1><p>Role-based access control · Three-tier RBAC system</p></div>
    <div className="ph-actions"><button className="btn btn-primary" onClick={() => onOpenModal('modal-user')}><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add User</button></div>
  </div>

  <div className="g3" style={{marginBottom: '1rem'}}>
    <div className="card" style={{borderTop: '3px solid var(--p)'}}><div className="ch"><div><div className="ct">Role A — Submitting Pharmacist</div></div></div><p style={{fontSize: '12px', color: 'var(--g500)', marginBottom: '10px'}}>Scan GS1, log inventory, flag surplus stock</p><div className="stat-val" style={{fontSize: '22px', marginBottom: '0'}}>14</div></div>
    <div className="card" style={{borderTop: '3px solid var(--ac)'}}><div className="ch"><div><div className="ct">Role B — Requesting Pharmacist</div></div></div><p style={{fontSize: '12px', color: 'var(--g500)', marginBottom: '10px'}}>View availability, raise stock-out alerts, request transfers</p><div className="stat-val" style={{fontSize: '22px', marginBottom: '0'}}>18</div></div>
    <div className="card" style={{borderTop: '3px solid var(--ok)'}}><div className="ch"><div><div className="ct">Role C — Network Admin</div></div></div><p style={{fontSize: '12px', color: 'var(--g500)', marginBottom: '10px'}}>Verify facilities, audit logs, approve transfers</p><div className="stat-val" style={{fontSize: '22px', marginBottom: '0'}}>3</div></div>
  </div>

  <div className="card">
    <div className="user-row" style={{padding: '12px 0'}}><div className="user-av" style={{background: 'var(--p)', width: '40px', height: '40px'}}><img src="https://images.unsplash.com/photo-1559839734-2b71f153678f?w=100&h=100&fit=crop" alt="AO"/></div><div><div className="user-name" style={{fontSize: '14px'}}>Dr. Adeola Okonkwo</div><div className="user-role">Role C — Network Admin · <span style={{color: 'var(--p)', fontWeight: '600'}}>LUTH</span></div></div><div className="user-actions"><span className="badge g">Active</span><button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '11px'}}>Permissions</button><button className="btn btn-ghost" style={{padding: '4px 8px', fontSize: '11px'}}>Edit</button></div></div>
    <div className="user-row" style={{padding: '12px 0'}}><div className="user-av" style={{background: 'var(--pd)', width: '40px', height: '40px'}}><img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop" alt="BU"/></div><div><div className="user-name" style={{fontSize: '14px'}}>Pharm. Bisi Usman</div><div className="user-role">Role A — Submitting Pharmacist · <span style={{color: 'var(--p)', fontWeight: '600'}}>EKO Hospital</span></div></div><div className="user-actions"><span className="badge g">Active</span><button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '11px'}}>Permissions</button><button className="btn btn-ghost" style={{padding: '4px 8px', fontSize: '11px'}}>Edit</button></div></div>
    <div className="user-row" style={{padding: '12px 0'}}><div className="user-av" style={{background: 'var(--ac)', width: '40px', height: '40px'}}><img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop" alt="CN"/></div><div><div className="user-name" style={{fontSize: '14px'}}>Pharm. Chidi Nwosu</div><div className="user-role">Role B — Requesting Pharmacist · <span style={{color: 'var(--p)', fontWeight: '600'}}>LASUTH</span></div></div><div className="user-actions"><span className="badge g">Active</span><button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '11px'}}>Permissions</button><button className="btn btn-ghost" style={{padding: '4px 8px', fontSize: '11px'}}>Edit</button></div></div>
    <div className="user-row" style={{padding: '12px 0'}}><div className="user-av" style={{background: 'var(--ok)', width: '40px', height: '40px'}}><img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop" alt="FS"/></div><div><div className="user-name" style={{fontSize: '14px'}}>Dr. Funke Sotunde</div><div className="user-role">Role C — Network Admin · <span style={{color: 'var(--p)', fontWeight: '600'}}>Ibadan</span></div></div><div className="user-actions"><span className="badge g">Active</span><button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '11px'}}>Permissions</button><button className="btn btn-ghost" style={{padding: '4px 8px', fontSize: '11px'}}>Edit</button></div></div>
    <div className="user-row" style={{padding: '12px 0'}}><div className="user-av" style={{background: 'var(--g400)', width: '40px', height: '40px'}}><img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop" alt="ML"/></div><div><div className="user-name" style={{fontSize: '14px'}}>Dr. Musa Lawal</div><div className="user-role">Role B — Requesting Pharmacist · <span style={{color: 'var(--p)', fontWeight: '600'}}>Lagos Island GH</span></div></div><div className="user-actions"><span className="badge a">Pending</span><button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '11px'}}>Permissions</button><button className="btn btn-ghost" style={{padding: '4px 8px', fontSize: '11px'}}>Edit</button></div></div>
  </div>
    </div>
  );
}
