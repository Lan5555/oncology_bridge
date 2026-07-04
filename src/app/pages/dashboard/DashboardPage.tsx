import { DrugSplitChart, InventoryChart, RedistributionEfficiencyChart } from "../../components/Charts";
import { ModalId, PageId } from "../../lib/types";



import type React from 'react';
interface DashboardPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNav, onOpenModal }) => {
  return (
    <div className="page active">
      <div className="ph">
    <div className="ph-left" style={{display: 'flex', alignItems: 'center', gap: '16px', flex: '1'}}>
      <div style={{width: '48px', height: '48px', background: 'var(--pl)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)', flexShrink: '0'}}>
        <svg viewBox="0 0 24 24" style={{width: '28px', height: '28px', fill: 'none', stroke: 'currentColor', strokeWidth: '2'}}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <div>
        <h1 style={{fontSize: '24px', letterSpacing: '-0.03em', lineHeight: '1.2'}}>Network Overview</h1>
        <p style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
          <span style={{color: 'var(--g800)', fontWeight: '600'}}>Lagos–Ibadan Corridor</span> 
          <span style={{color: 'var(--g300)'}}>•</span> June 2026 
          <span style={{color: 'var(--g300)'}}>•</span> <span className="pill b" style={{borderRadius: '4px', padding: '1px 6px'}}>Network Admin</span>
        </p>
      </div>
    </div>
    <div className="ph-actions">
      <button className="btn btn-outline" style={{boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}} onClick={() => onOpenModal('modal-export')}><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export Report</button>
      <button className="btn btn-primary" style={{boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'}} onClick={() => onNav('pg-scan')}><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M2 12h5M7 7h14M7 17h14"/></svg>Scan Vial</button>
    </div>
  </div>

  <div className="alert warn expiry-banner">
    <svg viewBox="0 0 24 24" style={{flexShrink: '0', marginTop: '2px'}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    <p style={{margin: '0', lineHeight: '1.5'}}><strong style={{fontSize: '14px'}}>7 near-expiry alerts:</strong> Trastuzumab (Lot TZ-2204-B) at LUTH expires in <span style={{color: 'var(--err)', fontWeight: '700'}}>38 days</span> — redistribution recommended.</p>
    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
      <button className="btn btn-primary" style={{background: 'var(--warn)', fontSize: '11px', padding: '5px 12px', border: 'none'}} onClick={() => onNav('pg-expiry')}>View All</button>
      <button className="btn btn-outline" style={{fontSize: '11px', padding: '5px 12px', borderColor: 'var(--warn)'}}>Dismiss</button>
    </div>
  </div>

  <div className="stat-grid">
    <div className="stat-card">
      <div className="stat-top"><span className="stat-lbl">Network Nodes</span><div className="stat-ico b"><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div></div>
      <div className="stat-val">24 <small style={{fontSize: '12px', color: 'var(--g400)', fontWeight: '400'}}>Hubs</small></div>
      <div className="stat-delta up"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>100% Uptime</div>
      <div className="sbar"><div className="sbar-f b" style={{width: '100%', boxShadow: '0 0 8px var(--p)'}}></div></div>
    </div>
    <div className="stat-card">
      <div className="stat-top"><span className="stat-lbl">GS1 Authenticated</span><div className="stat-ico g"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 12 14 15 11"/></svg></div></div>
      <div className="stat-val">1,847 <small style={{fontSize: '12px', color: 'var(--g400)', fontWeight: '400'}}>Vials</small></div>
      <div className="stat-delta up"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>+12% Velocity</div>
      <div className="sbar"><div className="sbar-f g" style={{width: '88%'}}></div></div>
    </div>
    <div className="stat-card">
      <div className="stat-top"><span className="stat-lbl">Stock-Out Risk</span><div className="stat-ico a"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div></div>
      <div className="stat-val">28%</div>
      <div className="stat-delta down"><svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>-22% Improvement</div>
      <div className="sbar"><div className="sbar-f a" style={{width: '28%'}}></div></div>
    </div>
    <div className="stat-card">
      <div className="stat-top"><span className="stat-lbl">Value Recovered</span><div className="stat-ico g"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div></div>
      <div className="stat-val">₦42.8M</div>
      <div className="stat-delta up"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>Redistribution Gain</div>
      <div className="sbar"><div className="sbar-f g" style={{width: '75%'}}></div></div>
    </div>
    <div className="stat-card">
      <div className="stat-top"><span className="stat-lbl">Chain Integrity</span><div className="stat-ico g"><svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M17 7l-5 5-5-5M7 17l5-5 5 5"/></svg></div></div>
      <div className="stat-val">98.4%</div>
      <div className="stat-delta up"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>Real-time Monitoring</div>
      <div className="sbar"><div className="sbar-f g" style={{width: '98%'}}></div></div>
    </div>
  </div>

  <div className="g-main" style={{marginBottom: '1rem'}}>
    <div className="card">
      <div className="ch">
        <div><div className="ct">Biologic Inventory — Network Wide</div><div className="cs">Verified vials across 24 facilities</div></div>
      </div>
      <div className="chart-legend">
        <span className="leg"><span className="leg-dot" style={{background: '#0EA5E9'}}></span>Trastuzumab</span>
        <span className="leg"><span className="leg-dot" style={{background: '#06B6D4'}}></span>Rituximab</span>
        <span className="leg"><span className="leg-dot" style={{background: '#10B981'}}></span>Bevacizumab</span>
      </div>
      <div style={{position: 'relative', height: '200px'}}><InventoryChart /></div>
    </div>
    <div className="card">
      <div className="ch"><div><div className="ct">Drug Availability Split</div><div className="cs">Current stock composition</div></div></div>
      <div className="chart-legend">
        <span className="leg"><span className="leg-dot" style={{background: '#0EA5E9'}}></span>Trastuzumab 38%</span>
        <span className="leg"><span className="leg-dot" style={{background: '#06B6D4'}}></span>Rituximab 27%</span>
        <span className="leg"><span className="leg-dot" style={{background: '#10B981'}}></span>Bevacizumab 19%</span>
        <span className="leg"><span className="leg-dot" style={{background: '#F59E0B'}}></span>Other 16%</span>
      </div>
      <div style={{position: 'relative', height: '170px'}}><DrugSplitChart /></div>
    </div>
  </div>

  <div className="card" style={{marginBottom: '1rem'}}>
    <div className="ch"><div><div className="ct">Therapeutic Stock Levels</div><div className="cs">Network-wide availability vs. target safety stock</div></div></div>
    <div className="stock-grid">
      <div className="stock-item">
        <div className="stock-info">
          <div><span className="stock-name">Trastuzumab</span><span className="stock-count">312 vials (HER2+)</span></div>
          <span className="stock-status" style={{color: 'var(--ok)', background: 'var(--okl)'}}>Optimal</span>
        </div>
        <div className="prog-bar"><div className="prog-fill" style={{width: '87%', background: 'var(--ok)'}}></div></div>
      </div>
      <div className="stock-item">
        <div className="stock-info">
          <div><span className="stock-name">Rituximab</span><span className="stock-count">226 vials (CD20)</span></div>
          <span className="stock-status" style={{color: 'var(--p)', background: 'var(--pl)'}}>Stable</span>
        </div>
        <div className="prog-bar"><div className="prog-fill" style={{width: '71%', background: 'var(--p)'}}></div></div>
      </div>
      <div className="stock-item">
        <div className="stock-info">
          <div><span className="stock-name">Bevacizumab</span><span className="stock-count">158 vials (VEGF)</span></div>
          <span className="stock-status" style={{color: 'var(--ac)', background: 'var(--pll)'}}>Fair</span>
        </div>
        <div className="prog-bar"><div className="prog-fill" style={{width: '62%', background: 'var(--ac)'}}></div></div>
      </div>
      <div className="stock-item">
        <div className="stock-info">
          <div><span className="stock-name">Pertuzumab</span><span className="stock-count">89 vials</span></div>
          <span className="stock-status" style={{color: 'var(--warn)', background: 'var(--warnl)'}}>Low</span>
        </div>
        <div className="prog-bar"><div className="prog-fill" style={{width: '41%', background: 'var(--warn)'}}></div></div>
      </div>
      <div className="stock-item">
        <div className="stock-info">
          <div><span className="stock-name">Cetuximab</span><span className="stock-count">44 vials (EGFR)</span></div>
          <span className="stock-status" style={{color: 'var(--err)', background: 'var(--errl)'}}>Critical</span>
        </div>
        <div className="prog-bar"><div className="prog-fill" style={{width: '22%', background: 'var(--err)'}}></div></div>
      </div>
    </div>
  </div>

  <div className="card">
    <div className="ch">
      <div><div className="ct">Network Redistribution Efficiency</div><div className="cs">Days from near-expiry flag to successful transfer</div></div>
      <div style={{display: 'flex', gap: '12px'}}>
        <span className="leg"><span className="leg-dot" style={{background: 'var(--p)'}}></span>Avg. Days to Transfer</span>
        <span className="leg"><span className="leg-dot" style={{background: 'var(--ac)'}}></span>Target (48h)</span>
      </div>
    </div>
    <div style={{position: 'relative', height: '240px'}}><RedistributionEfficiencyChart /></div>
  </div>
    </div>
  );
}

export default DashboardPage;
