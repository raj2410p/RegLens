import React, { useState, useEffect } from 'react';
import './index.css';

const API = 'http://localhost:5000/api';

/* ── Risk Chip ── */
function RiskChip({ level }) {
  return <span className={`chip chip-${level?.toLowerCase()}`}>{level}</span>;
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
  const [reply, setReply] = useState('');
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

  async function ask(e) {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const r = await fetch(`${API}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const d = await r.json();

      // Handle rate limit (429)
      if (r.status === 429) {
        setReply(`⚠ ${d.error}`);
        return;
      }

      setReply(d.message);
      if (d.intent === 'FILTER' && d.filters?.riskLevel) {
        setFilter(d.filters.riskLevel);
        setPage('dashboard');
      }
    } catch (_) { setReply('Assistant unavailable.'); }
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
      <div className="px-6 py-5 border-b border-slate-800">
        <span className="text-lg font-black tracking-tight">RegLens</span>
        <p className="text-slate-500 text-[10px] mt-0.5">Risk Review Assistant</p>
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
          <span className="font-bold text-slate-900">RegLens</span>
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
                <label htmlFor="upload" className="btn btn-primary self-start sm:self-auto cursor-pointer gap-2">
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
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="stat-card">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</p>
                    <p className="text-3xl font-extrabold mt-1">{stats.total}</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Flagged</p>
                    <p className="text-3xl font-extrabold mt-1 text-amber-600">{stats.flagged}</p>
                  </div>
                  <div className="stat-card border-l-4 border-rose-400">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">High Risk</p>
                    <p className="text-3xl font-extrabold mt-1 text-rose-600">{stats.highRisk}</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Health</p>
                    <p className="text-3xl font-extrabold mt-1 text-emerald-600">Stable</p>
                  </div>
                </div>
              )}

              {/* AI Assistant */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-black text-base">✦</span>
                  <span className="font-semibold text-sm">Compliance Assistant</span>
                </div>
                <form onSubmit={ask} className="flex gap-2">
                  <input
                    className="input-field"
                    placeholder="e.g. show high risk, summarize today's flagged activity…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary flex-shrink-0">Ask</button>
                </form>
                {reply && (
                  <div className="text-sm text-slate-700 italic bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded-r-lg">
                    <span className="font-semibold not-italic text-blue-600">AI: </span>{reply}
                  </div>
                )}
              </div>

              {/* Ledger Preview */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Risk Level</p>
                  <RiskChip level={selected.riskLevel} />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Score</p>
                  <p className="text-2xl font-black">{selected.riskScore}<span className="text-sm font-medium text-slate-400">/100</span></p>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Compliance Verdict</p>
                <div className="flex items-center gap-2.5">
                  <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${selected.flagged ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {selected.flagged ? 'Flagged Activity' : 'Clear / Routine'}
                  </div>
                  <span className="text-[10px] text-slate-400 italic">
                    {selected.flagged
                      ? 'Detected via multi-rule risk evaluation'
                      : 'Verified against all established compliance rules'}
                  </span>
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
    </div>
  );
}
