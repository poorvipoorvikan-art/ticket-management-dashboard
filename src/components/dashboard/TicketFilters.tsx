type SortOption = "newest" | "oldest" | "priority";
interface Props { search: string; status: string; sort: SortOption; onSearch: (value: string) => void; onStatus: (value: string) => void; onSort: (value: SortOption) => void; }
export default function TicketFilters({ search, status, sort, onSearch, onStatus, onSort }: Props) {
  return <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6 md:flex-row md:flex-wrap md:items-center">
    <label className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 md:max-w-sm"><span className="text-xl text-slate-400">⌕</span><input type="search" value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search tickets..." aria-label="Search tickets" className="w-full bg-transparent py-2.5 text-xs text-slate-700 outline-none placeholder:text-slate-400" /></label>
    <select value={status} onChange={e=>onStatus(e.target.value)} aria-label="Filter tickets by status" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600"><option value="All">All statuses</option>{["Open","In Progress","Resolved","Closed"].map(x=><option key={x}>{x}</option>)}</select>
    <select value={sort} onChange={e=>onSort(e.target.value as SortOption)} aria-label="Sort tickets" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="priority">Highest priority</option></select>
  </div>;
}
