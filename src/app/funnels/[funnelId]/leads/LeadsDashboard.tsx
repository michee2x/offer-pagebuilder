'use client';

import { Users, Mail, Phone, Download, Calendar, Globe } from 'lucide-react';

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
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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

function todayCount(leads: Lead[]) {
  const today = new Date().toDateString();
  return leads.filter(l => new Date(l.created_at).toDateString() === today).length;
}

function weekCount(leads: Lead[]) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return leads.filter(l => new Date(l.created_at).getTime() >= cutoff).length;
}

export function LeadsDashboard({ leads, funnelName }: Props) {
  const stats = [
    { label: 'Total Leads',   value: leads.length,        icon: Users    },
    { label: 'Today',         value: todayCount(leads),   icon: Calendar },
    { label: 'Last 7 Days',   value: weekCount(leads),    icon: Globe    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white/90">Leads</h1>
            <p className="text-sm text-white/40 mt-0.5">People who submitted their info on your funnel</p>
          </div>
          {leads.length > 0 && (
            <button
              onClick={() => exportCSV(leads, funnelName)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/8 bg-white/3 px-6 py-5 flex items-center gap-4"
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

        {/* Table */}
        {leads.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-white/3 flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-violet-500/15 text-violet-400 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white/70 font-semibold text-base">No leads yet</p>
              <p className="text-white/30 text-sm mt-1">Leads will appear here once visitors submit your funnel&apos;s opt-in form.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-white/30">Name</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-white/30">Email</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-white/30">Phone</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-white/30">Source</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-white/30">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr
                      key={lead.id}
                      className={`border-b border-white/5 last:border-b-0 hover:bg-white/3 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}
                    >
                      <td className="px-5 py-3.5 font-semibold text-white/80">{lead.name}</td>
                      <td className="px-5 py-3.5 text-white/50">
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-violet-400 transition-colors w-fit">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          {lead.email}
                        </a>
                      </td>
                      <td className="px-5 py-3.5 text-white/40">
                        {lead.phone ? (
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 hover:text-violet-400 transition-colors w-fit">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="opacity-30">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/6 text-white/50 border border-white/8">
                          {lead.source_page || '/'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-white/35 text-xs tabular-nums whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
