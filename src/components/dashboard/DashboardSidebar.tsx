import type { User } from "../../types/auth.types";

interface Props {
  user: User | null;
  initials: string;
  statusFilter: string;
  navigationItems: { label: string; icon: string; filter: string; count?: number }[];
  onNavigate: (filter: string) => void;
  onLogout: () => void;
}

export default function DashboardSidebar({ user, initials, statusFilter, navigationItems, onNavigate, onLogout }: Props) {
  return <>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-[#111827] px-5 py-7 text-white md:flex">
      <div className="mb-12 flex items-center gap-3 px-2">
        <div className="grid size-11 place-items-center rounded-xl bg-indigo-600 text-xl font-bold shadow-lg shadow-indigo-950/30">T</div>
        <div><h2 className="text-xl font-bold tracking-tight">TASK MANAGEMENT</h2><span className="text-xs font-medium tracking-wide text-slate-400">SUPPORT WORKSPACE</span></div>
      </div>
      <div className="mb-4 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-500">WORKSPACE</div>
      <nav className="space-y-1.5" aria-label="Main navigation">
        {navigationItems.map((item, index) => {
          const active = (index === 0 && statusFilter === "All") || (index === 2 && statusFilter === "Open") || (index === 3 && statusFilter === "Resolved");
          return <a key={item.label} href={index === 0 ? "#dashboard" : "#tickets"} onClick={() => onNavigate(item.filter)} className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/30" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <span className="grid size-6 place-items-center text-lg">{item.icon}</span><span>{item.label}</span>
            {item.count !== undefined && <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-200">{item.count}</span>}
          </a>;
        })}
      </nav>
      <div className="mt-auto">
        <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4"><div className="mb-2 flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-400" /><span className="text-xs font-semibold text-slate-300">Workspace active</span></div><p className="text-[11px] leading-5 text-slate-500">Manage customer requests and keep your support team organized.</p></div>
        <div className="flex items-center gap-3 border-t border-white/10 px-1 pt-5">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-500 text-xs font-bold">{initials}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user?.name}</p><p className="mt-1 truncate text-[11px] text-slate-400">{user?.role}</p></div>
          <button type="button" onClick={onLogout} aria-label="Log out" title="Log out" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">↗</button>
        </div>
      </div>
    </aside>
    <nav className="border-b border-slate-200 bg-white px-4 py-2.5 md:hidden" aria-label="Mobile navigation">
      <div className="flex gap-2 overflow-x-auto">{navigationItems.map(item => <a key={item.label} href="#tickets" onClick={() => onNavigate(item.filter)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${statusFilter === item.filter ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{item.label}</a>)}</div>
    </nav>
  </>;
}
