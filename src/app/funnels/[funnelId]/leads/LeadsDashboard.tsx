'use client';

import { useState, useMemo } from 'react';
import { Users, Mail, Phone, Download, Calendar, Globe, Search, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source_page: string;
  created_at: string;
}

interface Props {
  leads: Lead[];
  funnelName: string;
}

type SortKey = 'name' | 'email' | 'created_at';
type SortDir = 'asc' | 'desc';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
    hour:  '2-digit',
    minute: '2-digit',
  });
}

function exportCSV(leads: Lead[], funnelName: string) {
  const header = ['Name', 'Email', 'Phone', 'Source Page', 'Date'];
  const rows = leads.map(l => [
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.email}"`,
    `"${l.phone ?? ''}"`,
    `"${l.source_page}"`,
    `"${formatDate(l.created_at)}"`,
  ].join(','));

  const csv  = [header.join(','), ...rows].join('\n');
  // \uFEFF = UTF-8 BOM so Excel opens with correct encoding
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href:     url,
    download: `${funnelName.replace(/\s+/g, '_')}_leads.csv`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === 'asc'
    ? <ArrowUp className="w-3 h-3 text-violet-400" />
    : <ArrowDown className="w-3 h-3 text-violet-400" />;
}

function todayCount(leads: Lead[]) {
  const today = new Date().toDateString();
  return leads.filter(l => new Date(l.created_at).toDateString() === today).length;
}

function weekCount(leads: Lead[]) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return leads.filter(l => new Date(l.created_at).getTime() >= cutoff).length;
}

export function LeadsDashboard({ leads, funnelName }: Props) {
  const [query, setQuery]     = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const stats = [
    { label: 'Total Leads',   value: leads.length,        icon: Users    },
    { label: 'Today',         value: todayCount(leads),   icon: Calendar },
    { label: 'Last 7 Days',   value: weekCount(leads),    icon: Globe    },
  ];

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const base = q
      ? leads.filter(l =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (l.phone ?? '').includes(q) ||
          l.source_page.toLowerCase().includes(q)
        )
      : leads;

    return [...base].sort((a, b) => {
      if (sortKey === 'created_at') {
        const va = new Date(a.created_at).getTime();
        const vb = new Date(b.created_at).getTime();
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const va = (a[sortKey] as string).toLowerCase();
      const vb = (b[sortKey] as string).toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [leads, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const avatarColors = [
    'bg-blue-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500',
    'bg-cyan-500', 'bg-indigo-500', 'bg-purple-500', 'bg-rose-500',
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-transparent">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white/90">Leads</h1>
            <p className="text-sm text-white/40 mt-0.5">
              People who submitted their info on your funnel
            </p>
          </div>
          {leads.length > 0 && (
            <button
              onClick={() => exportCSV(filtered, funnelName)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.65)] transition-all text-sm font-bold border-transparent"
            >
              <Download className="w-4 h-4" />
              Export CSV
              <span className="ml-0.5 px-1.5 py-0.5 text-[10px] bg-black/10 rounded-full font-bold tabular-nums">
                {filtered.length}
              </span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300 shadow-2xl rounded-2xl px-6 py-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-white tabular-nums">{value}</p>
                <p className="text-xs text-white/40 font-medium mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table or Empty */}
        {leads.length === 0 ? (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl flex flex-col items-center justify-center py-20 gap-4 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-violet-500/15 text-violet-400 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white/70 font-semibold text-base">No leads yet</p>
              <p className="text-white/30 text-sm mt-1">
                Leads will appear here once visitors submit your funnel&apos;s opt-in form.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">

            {/* Search bar */}
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-3">
              <Search className="w-4 h-4 text-white/25 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, email, phone or source…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
              />
              {query && (
                <>
                  <span className="text-[10px] text-white/30 font-medium tabular-nums shrink-0">
                    {filtered.length} of {leads.length}
                  </span>
                  <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60 transition-colors shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-3.5">
                      <button
                        onClick={() => toggleSort('name')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                      >
                        Name <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3.5">
                      <button
                        onClick={() => toggleSort('email')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                      >
                        Email <SortIcon col="email" sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-white/30">Phone</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-white/30">Source</th>
                    <th className="text-left px-5 py-3.5">
                      <button
                        onClick={() => toggleSort('created_at')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                      >
                        Date <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center text-white/30 text-sm">
                        No leads match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((lead, i) => (
                      <tr
                        key={lead.id}
                        className={`border-b border-white/5 last:border-b-0 hover:bg-white/[0.04] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} text-white flex items-center justify-center text-[10px] font-black shrink-0 uppercase`}>
                              {lead.name.slice(0, 2)}
                            </div>
                            <span className="font-semibold text-white/80">{lead.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-white/50">
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1.5 hover:text-violet-400 transition-colors w-fit"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            {lead.email}
                          </a>
                        </td>
                        <td className="px-5 py-3.5 text-white/40">
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1.5 hover:text-violet-400 transition-colors w-fit"
                            >
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="opacity-30">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-white/50 border border-white/[0.08]">
                            {lead.source_page || '/'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-white/35 text-xs tabular-nums whitespace-nowrap">
                          {formatDate(lead.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] text-white/25 font-medium">
                Showing {filtered.length} of {leads.length} lead{leads.length !== 1 ? 's' : ''}
              </span>
              <span className="text-[10px] text-white/20">
                CSV export includes current view
              </span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
