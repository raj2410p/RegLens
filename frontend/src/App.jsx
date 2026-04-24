import React, { useState, useEffect } from 'react';
import './index.css';

const API = 'http://localhost:5000/api';

/* ── Risk Chip ── */
function RiskChip({ level }) {
  return <span className={`chip chip-${level?.toLowerCase()}`}>{level}</span>;
}

/* ── Risk Score Gauge (Pure CSS) ── */
function RiskScoreGauge({ score }) {
  const color = score >= 70 ? '#e11d48' : score >= 30 ? '#d97706' : '#059669';
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48" cy="48" r={radius}
          stroke="currentColor" strokeWidth="8"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="48" cy="48" r={radius}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease-out' }}
          strokeLinecap="round"
          className="text-primary-color"
          stroke={color}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-black leading-none">{score}</span>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Score</span>
      </div>
    </div>
  );
}

/* ── Compliance Report (Printable) ── */
function ComplianceReport({ data, onClose }) {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto p-8 sm:p-16 printable-report">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">RegLens Compliance Audit</h1>
            <p className="text-slate-500 font-medium mt-1">Status Report · Automated Risk Assessment</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Generated On</p>
            <p className="text-lg font-bold">{new Date(data.timestamp).toLocaleDateString()} {new Date(data.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Verified</p>
            <p className="text-3xl font-black">{data.summary.totalTransactions}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Flagged Activity</p>
            <p className="text-3xl font-black text-rose-600">{data.summary.flaggedTransactions}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alert Rate</p>
            <p className="text-3xl font-black text-slate-900">{data.summary.flagRate}</p>
          </div>
        </div>

        {/* Risk Patterns */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-l-4 border-slate-900 pl-4">Critical Risk Patterns Identified</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.topRiskPatterns.map(p => (
              <div key={p.name} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl">
                <span className="font-semibold text-slate-700">{p.name}</span>
                <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">{p.count} hits</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-l-4 border-slate-900 pl-4">High Risk Alerts (Manual Review Required)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-white text-left">
                <th className="px-4 py-3 rounded-tl-xl font-bold">Reference</th>
                <th className="px-4 py-3 font-bold">Entity</th>
                <th className="px-4 py-3 font-bold">Amount</th>
                <th className="px-4 py-3 rounded-tr-xl font-bold">Triggers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border border-slate-100 border-t-0 rounded-b-xl overflow-hidden">
              {data.criticalAlerts.map(tx => (
                <tr key={tx._id}>
                  <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-400">{tx.transactionId}</td>
                  <td className="px-4 py-3 font-medium">{tx.sender} → {tx.receiver}</td>
                  <td className="px-4 py-3 font-black text-rose-600">{tx.currency} {tx.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs italic text-slate-500">{tx.triggeredRules.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-12 border-t border-slate-200 text-center text-slate-400 text-xs">
          <p>© 2026 RegLens Compliance Engine. This is an automated summary report.</p>
          <div className="mt-8 no-print flex justify-center gap-4">
            <button onClick={() => window.print()} className="btn btn-primary px-8 py-3">Print to PDF</button>
            <button onClick={onClose} className="btn btn-ghost px-8 py-3">Close Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar Nav Item ── */
function NavItem({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
        ${active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </button>
  );
}

/* ══════════════════════════════
   PAGE: TRANSACTIONS (full table)
══════════════════════════════ */
function TransactionsPage({ transactions, loading, filter, setFilter, setSelected }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-slate-500 text-sm mt-0.5">Full ledger view with advanced filtering</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">All Transactions</span>
            {!loading && (
              <span className="text-[10px] font-bold bg-slate-200 text-slate-500 rounded-full px-2 py-0.5">{transactions.length}</span>
            )}
          </div>
          <select
            className="input-field text-xs py-1.5 w-auto min-w-[140px]"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="ALL">All Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left border-b border-slate-100">
                {['ID', 'Sender', 'Receiver', 'Amount', 'Currency', 'Country', 'Type', 'Risk', 'Flagged', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={10} className="text-center py-10 text-slate-400 text-xs">Loading…</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-slate-400 text-xs">No records. Upload a file to begin.</td></tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{tx.transactionId}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{tx.sender}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{tx.receiver}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{tx.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500">{tx.currency}</td>
                    <td className="px-4 py-3 text-slate-600">{tx.country}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{tx.transactionType}</td>
                    <td className="px-4 py-3"><RiskChip level={tx.riskLevel} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold ${tx.flagged ? 'text-rose-600' : 'text-slate-400'}`}>
                        {tx.flagged ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 font-semibold text-xs hover:underline" onClick={() => setSelected(tx)}>
                        Review →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   PAGE: SETTINGS
══════════════════════════════ */
function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure risk rules, integrations, and system preferences</p>
      </div>

      {/* AI Engine */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-sm flex items-center gap-2">
          <span className="text-blue-600">✦</span> AI Engine
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Provider</p>
            <p className="font-semibold">Google Gemini 1.5 Flash</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Status</p>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Coverage</p>
            <p className="font-semibold">All risk levels (Low, Medium, High)</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Mode</p>
            <p className="font-semibold">Explain + Query</p>
          </div>
        </div>
      </div>

      {/* Risk Thresholds */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-sm">⚖ Risk Engine Rules</h2>
        <div className="space-y-3 text-sm">
          {[
            { rule: 'Threshold Proximity', value: '$9,000–$9,999 (AML trigger zone)', status: 'Active' },
            { rule: 'AML Reporting Threshold', value: '$10,000+', status: 'Active' },
            { rule: 'Velocity Check', value: '3+ transfers same sender/receiver in 24h', status: 'Active' },
            { rule: 'Geo-Risk Jurisdictions', value: 'North Korea, Iran, Syria, Cayman Is., Panama', status: 'Active' },
          ].map(r => (
            <div key={r.rule} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
              <div>
                <p className="font-medium">{r.rule}</p>
                <p className="text-slate-400 text-xs mt-0.5">{r.value}</p>
              </div>
              <span className="chip chip-low">{r.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Formats */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-sm">📁 Supported File Formats</h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { fmt: 'CSV', status: 'live' },
            { fmt: 'JSON', status: 'live' },
            { fmt: 'XML (Basic)', status: 'live' },
            { fmt: 'PDF (AI-Powered)', status: 'live' },
            { fmt: 'ISO 20022', status: 'stub' },
            { fmt: 'SWIFT MT', status: 'stub' },
            { fmt: 'ACH / NACHA', status: 'stub' },
            { fmt: 'SEPA', status: 'stub' },
            { fmt: 'OFX / BAI2', status: 'stub' },
          ].map(f => (
            <div key={f.fmt} className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2">
              <span className="font-medium">{f.fmt}</span>
              <span className={`font-bold ${f.status === 'live' ? 'text-emerald-600' : 'text-slate-400'}`}>
                {f.status === 'live' ? '✓ Live' : '○ Stub'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   MAIN APP
══════════════════════════════ */
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([]); // { role: 'user' | 'ai', text: string }
  const [report, setReport] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => { load(); }, [filter]);

  async function load() {
    setLoading(true);
    try {
      const [txRes, sumRes] = await Promise.all([
        fetch(`${API}/transactions?riskLevel=${filter}`),
        fetch(`${API}/summary`),
      ]);
      setTransactions(await txRes.json());
      setStats(await sumRes.json());
    } catch (_) { }
    setLoading(false);
  }

  async function upload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setLoading(true);
    try {
      const r = await fetch(`${API}/upload`, { method: 'POST', body: fd });
      const d = await r.json();
      alert(d.message || d.error);
      load();
    } catch (_) { alert('Upload failed – check backend.'); }
    setLoading(false);
    e.target.value = '';
  }

  async function generateReport() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/report`);
      setReport(await r.json());
    } catch (_) { alert('Report generation failed.'); }
    setLoading(false);
  }

  async function ask(e) {
    e.preventDefault();
    const text = query.trim();
    if (!text) return;
    
    setQuery('');
    setChat(prev => [...prev, { role: 'user', text }]);

    try {
      const r = await fetch(`${API}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      const d = await r.json();

      let aiText = d.message;
      if (r.status === 429) aiText = `⚠ ${d.error}`;

      setChat(prev => [...prev, { role: 'ai', text: aiText }]);

      if (d.intent === 'FILTER' && d.filters?.riskLevel) {
        setFilter(d.filters.riskLevel);
        setPage('dashboard');
      }
    } catch (_) { 
      setChat(prev => [...prev, { role: 'ai', text: 'Assistant unavailable.' }]);
    }
  }

  async function saveNote(id, note) {
    await fetch(`${API}/transactions/${id}/note`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    }).catch(() => { });
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '◫' },
    { key: 'transactions', label: 'Transactions', icon: '⇄' },
    { key: 'settings', label: 'Settings', icon: '⚙' },
  ];

  /* ── Sidebar ── */
  const Sidebar = () => (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 text-white flex flex-col
      transition-transform duration-300 ease-in-out
      ${navOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:relative lg:flex-shrink-0
    `}>
      <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
        <img src="/logo.png" alt="RegLens Logo" className="w-8 h-8 rounded-lg shadow-lg" />
        <div>
          <span className="text-lg font-black tracking-tight">RegLens</span>
          <p className="text-slate-500 text-[10px] mt-0.5">Risk Review Assistant</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest px-2 mb-3">Navigation</p>
        {navItems.map(n => (
          <NavItem
            key={n.key}
            label={n.label}
            icon={n.icon}
            active={page === n.key}
            onClick={() => { setPage(n.key); setNavOpen(false); }}
          />
        ))}
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">

      {/* Mobile overlay */}
      {navOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setNavOpen(false)} />
      )}

      <Sidebar />

      {/* ══ Main column ══ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="RegLens Logo" className="w-7 h-7 rounded-md" />
            <span className="font-bold text-slate-900">RegLens</span>
          </div>
          <button onClick={() => setNavOpen(true)} className="p-1 text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8 max-w-screen-2xl mx-auto w-full">

          {/* ── DASHBOARD PAGE ── */}
          {page === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Risk Review Dashboard</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Transaction monitoring · Compliance analytics</p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <label htmlFor="upload" className="btn btn-primary cursor-pointer gap-2">
                    {loading ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    )}
                    {loading ? 'Processing…' : 'Upload File'}
                  </label>
                  <input id="upload" type="file" className="hidden" accept=".csv,.json,.xml,.pdf" onChange={upload} />
                  
                  <button onClick={generateReport} className="btn btn-ghost gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Report
                  </button>
                </div>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
                  <div className="stat-card">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Records</p>
                    <p className="text-3xl font-extrabold mt-1">{stats.total}</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Flagged</p>
                    <p className="text-3xl font-extrabold mt-1 text-amber-600">{stats.flagged}</p>
                  </div>
                  <div className="stat-card border-l-4 border-rose-500">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">High Risk</p>
                    <p className="text-3xl font-extrabold mt-1 text-rose-600">{stats.highRisk}</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Audit Health</p>
                    <p className="text-3xl font-extrabold mt-1 text-emerald-600">Secure</p>
                  </div>
                </div>
              )}

              {/* AI Assistant Messaging UI */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[400px] animate-slide-up delay-100">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-extrabold text-lg">✦</span>
                    <span className="font-bold text-sm">RegLens Risk Assistant</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AI Active
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col">
                  {chat.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 px-10">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xl font-black">✦</div>
                      <p className="text-sm font-bold text-slate-800">How can I help with your compliance audit?</p>
                      <p className="text-xs text-slate-400 max-w-[280px]">Ask about specific risk levels, suspicious patterns, or data summaries.</p>
                      
                      <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {['Show high risk', "Summarize today's alerts", 'Any North Korea activity?'].map(s => (
                          <button key={s} onClick={() => { setQuery(s); }} className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                            "{s}"
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    chat.map((msg, i) => (
                      <div key={i} className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                        {msg.text}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-slate-100">
                  <form onSubmit={ask} className="flex gap-2">
                    <input
                      className="input-field"
                      placeholder="Type your question..."
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary px-5">Send</button>
                  </form>
                </div>
              </div>

              {/* Ledger Preview */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-slide-up delay-200">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Recent Ledger</span>
                    {!loading && <span className="text-[10px] font-bold bg-slate-200 text-slate-500 rounded-full px-2 py-0.5">{transactions.length}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <select className="input-field text-xs py-1.5 w-auto min-w-[130px]" value={filter} onChange={e => setFilter(e.target.value)}>
                      <option value="ALL">All Levels</option>
                      <option value="LOW">Low Risk</option>
                      <option value="MEDIUM">Medium Risk</option>
                      <option value="HIGH">High Risk</option>
                    </select>
                    <button className="btn btn-ghost text-xs" onClick={() => setPage('transactions')}>View All →</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left border-b border-slate-100">
                        {['Reference', 'Entity', 'Amount', 'Country', 'Risk', 'Action'].map(h => (
                          <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading ? (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-xs">Loading…</td></tr>
                      ) : transactions.length === 0 ? (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-xs">No records. Upload a file to begin.</td></tr>
                      ) : (
                        transactions.slice(0, 8).map(tx => (
                          <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">{tx.transactionId}</td>
                            <td className="px-5 py-3.5">
                              <span className="font-medium text-slate-900">{tx.sender}</span>
                              <span className="text-slate-400 text-xs"> → {tx.receiver}</span>
                            </td>
                            <td className="px-5 py-3.5 font-semibold whitespace-nowrap">{tx.currency} {tx.amount.toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-slate-600 text-xs">{tx.country}</td>
                            <td className="px-5 py-3.5"><RiskChip level={tx.riskLevel} /></td>
                            <td className="px-5 py-3.5">
                              <button className="text-blue-600 font-semibold text-xs hover:underline" onClick={() => setSelected(tx)}>Review →</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TRANSACTIONS PAGE ── */}
          {page === 'transactions' && (
            <TransactionsPage
              transactions={transactions}
              loading={loading}
              filter={filter}
              setFilter={setFilter}
              setSelected={setSelected}
            />
          )}

          {/* ── SETTINGS PAGE ── */}
          {page === 'settings' && <SettingsPage />}

        </main>
      </div>

      {/* ══ Detail Drawer ══ */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSelected(null)}
      />
      <div className={`
        fixed top-0 right-0 h-full z-[70] bg-white shadow-2xl flex flex-col
        w-full sm:w-[440px] lg:w-[520px]
        transition-transform duration-300 ease-out
        ${selected ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {selected && (
          <>
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <div>
                <p className="font-bold text-base">Transaction Detail</p>
                <p className="text-slate-400 text-xs mt-0.5 font-mono">{selected.transactionId}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-7">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center justify-between gap-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Aggregated Risk Factor</p>
                  <RiskChip level={selected.riskLevel} />
                </div>
                <RiskScoreGauge score={selected.riskScore} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Compliance Verdict</p>
                <div className="flex flex-col gap-2">
                  <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-center ${selected.flagged ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                    {selected.flagged ? '⚠ Triggered Automated Investigation' : '✓ Verified Standard Activity'}
                  </div>
                  <p className="text-[11px] text-slate-400 italic text-center px-4">
                    {selected.flagged
                      ? 'Detected via multi-layered rule evaluation and behavioral heuristics.'
                      : 'Pattern matches routine institutional flow with no known compliance red flags.'}
                  </p>
                </div>
              </div>

              {selected.triggeredRules?.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Triggered Rules</p>
                  <ul className="space-y-2">
                    {selected.triggeredRules.map((r, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-700 leading-relaxed">
                        <span className="text-rose-400 mt-px flex-shrink-0">●</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">AI Narrative</p>
                <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded-r-xl text-xs text-slate-700 italic leading-relaxed">
                  {selected.aiExplanation ? (
                    selected.aiExplanation
                  ) : selected.flagged ? (
                    <span className="text-slate-500">AI analysis is being generated for this flagged activity...</span>
                  ) : (
                    <span className="text-emerald-700 font-medium not-italic">
                      ✓ System Verification: This transaction is assessed as routine. No rule-based triggers or suspicious patterns detected.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Analyst Notes</p>
                <textarea
                  className="input-field min-h-[100px] text-xs resize-none"
                  defaultValue={selected.analystNote}
                  placeholder="Add review notes…"
                  onBlur={e => saveNote(selected._id, e.target.value)}
                />
                <p className="text-slate-400 text-[10px] mt-2">Auto-saved on blur.</p>
              </div>

              <div className="border-t border-slate-100 pt-6 grid grid-cols-2 gap-x-6 gap-y-5 text-xs">
                {[
                  ['Sender', selected.sender],
                  ['Receiver', selected.receiver],
                  ['Type', selected.transactionType],
                  ['Country', selected.country],
                  ['Currency', selected.currency],
                  ['Format', selected.sourceFormat],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-slate-400 text-[9px] font-bold uppercase">{label}</p>
                    <p className="font-semibold mt-0.5 text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══ Report Component ══ */}
      {report && <ComplianceReport data={report} onClose={() => setReport(null)} />}
    </div>
  );
}
