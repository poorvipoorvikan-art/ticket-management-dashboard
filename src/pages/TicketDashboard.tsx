import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "../hooks/useTickets";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import { useDebounce } from "../hooks/useDebounce";
import { useToggle } from "../hooks/useToggle";
import { useDashboardTickets } from "../hooks/useDashboardTickets";
import type { Ticket, TicketFormData } from "../types/ticket.types";
import TicketTable from "../components/TicketTable";
import { Modal } from "../components/common/Modal";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import DashboardStats from "../components/dashboard/DashboardStats";
import TicketFilters from "../components/dashboard/TicketFilters";
import DashboardPagination from "../components/dashboard/DashboardPagination";

const TicketForm = lazy(() => import("../components/TicketForm"));
type SortOption = "newest" | "oldest" | "priority";
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "🌄Good morning";
  if (hour >= 12 && hour < 17) return "🌇Good afternoon";
  if (hour >= 17 && hour < 21) return "🌆Good evening";
  return "🌃Good night";
};
function getActionErrorMessage(error: unknown, action: string): string {
  if (typeof error === "object" && error !== null && "status" in error) {
    if (error.status === 401) return "Your session has expired. Please sign in again.";
    if (error.status === 403) return `You do not have permission to ${action}.`;
  }
  if (typeof error === "object" && error !== null && "data" in error && typeof error.data === "object" && error.data !== null && "message" in error.data && typeof error.data.message === "string") return error.data.message;
  return `Unable to ${action}. Please try again.`;
}

export default function TicketDashboard() {
  const { tickets, loading, isFetching, error, refetch, createTicket, updateTicket, deleteTicket } = useTickets();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { canViewAllTickets, canCreateTicket, canEditTicket, canDeleteTicket } = usePermissions();
  const { value: showForm, setTrue: openForm, setFalse: closeFormState } = useToggle();
  const [selectedTicket,setSelectedTicket] = useState<Ticket|null>(null);
  const [actionError,setActionError] = useState("");
  const [searchTerm,setSearchTerm] = useState("");
  const [statusFilter,setStatusFilter] = useState("All");
  const [sortBy,setSortBy] = useState<SortOption>("newest");
  const [greeting,setGreeting] = useState(getGreeting);
  const [successMessage,setSuccessMessage] = useState("");
  const debouncedSearch = useDebounce(searchTerm,300);
  const visibleTickets = canViewAllTickets ? tickets : tickets.filter(ticket=>ticket.assignedTo===user?.id);
  const { sortedTickets,paginatedTickets,totalPages,currentPage,startIndex,changePage } = useDashboardTickets(visibleTickets,debouncedSearch,statusFilter,sortBy);
  const openCount = visibleTickets.filter(ticket=>ticket.status==="Open").length;
  const progressCount = visibleTickets.filter(ticket=>ticket.status==="In Progress").length;
  const resolvedCount = visibleTickets.filter(ticket=>ticket.status==="Resolved").length;
  const stats = [
    {label:"Total tickets",value:visibleTickets.length,note:"Support requests",icon:"▤",color:"bg-indigo-50 text-indigo-600",accent:"bg-indigo-500"},
    {label:"Open tickets",value:openCount,note:"Awaiting response",icon:"◷",color:"bg-sky-50 text-sky-600",accent:"bg-sky-500"},
    {label:"In progress",value:progressCount,note:"Currently being handled",icon:"↻",color:"bg-amber-50 text-amber-600",accent:"bg-amber-500"},
    {label:"Resolved",value:resolvedCount,note:"Successfully completed",icon:"✓",color:"bg-emerald-50 text-emerald-600",accent:"bg-emerald-500"}
  ];
  const initials = user?.name.split(" ").map(part=>part[0]).join("").slice(0,2).toUpperCase() || "U";
  const navigationItems = [{label:"Overview",icon:"▦",filter:"All"},{label:"All Tickets",icon:"▤",filter:"All",count:visibleTickets.length},{label:"Open Tickets",icon:"◷",filter:"Open"},{label:"Resolved",icon:"✓",filter:"Resolved"}];

  useEffect(()=>{ if(!successMessage)return; const timer=setTimeout(()=>setSuccessMessage(""),3000); return ()=>clearTimeout(timer); },[successMessage]);
  useEffect(()=>{ const timer=setInterval(()=>setGreeting(getGreeting()),60000); return ()=>clearInterval(timer); },[]);
  const handleLogout=()=>{logout();navigate("/login",{replace:true});};
  const resetPage=()=>changePage(1);
  const closeForm=()=>{closeFormState();setSelectedTicket(null);setActionError("");};
  const openCreateForm=()=>{if(!canCreateTicket){setActionError("You do not have permission to create tickets.");return;}setSelectedTicket(null);setActionError("");openForm();};
  const openEditForm=(ticket:Ticket)=>{if(!canEditTicket){setActionError("You do not have permission to edit tickets.");return;}setSelectedTicket(ticket);setActionError("");openForm();};
  const handleUnauthorized=(error:unknown)=>{if(typeof error==="object"&&error!==null&&"status" in error&&error.status===401){logout();navigate("/login",{replace:true});}};
  const handleSubmit=async(data:TicketFormData)=>{
    if(selectedTicket&&!canEditTicket)throw new Error("You do not have permission to edit tickets.");
    if(!selectedTicket&&!canCreateTicket)throw new Error("You do not have permission to create tickets.");
    try{
      setActionError("");
      if(selectedTicket){await updateTicket(selectedTicket.id,data);setSuccessMessage("Ticket updated successfully.");}
      else{await createTicket(user?.role==="Support Agent"?{...data,assignedTo:user.id}:data);setSuccessMessage("Ticket created successfully.");}
      closeFormState();setSelectedTicket(null);
    }catch(error){setActionError(getActionErrorMessage(error,"save this ticket"));handleUnauthorized(error);throw error;}
  };
  const handleDelete=async(ticket:Ticket,skipConfirmation=false)=>{
    if(!canDeleteTicket)throw new Error("You do not have permission to delete tickets.");
    if(!skipConfirmation&&!window.confirm(`Are you sure you want to delete "${ticket.subject}"?`))return;
    try{setActionError("");await deleteTicket(ticket.id);setSuccessMessage("Ticket deleted successfully.");}
    catch(error){setActionError(getActionErrorMessage(error,"delete this ticket"));handleUnauthorized(error);throw error;}
  };

  return <div className="min-h-screen bg-[#f6f7fb] text-slate-800">
    <DashboardSidebar user={user} initials={initials} statusFilter={statusFilter} navigationItems={navigationItems} onNavigate={value=>{setStatusFilter(value);resetPage();}} onLogout={handleLogout}/>
    <main className="min-h-screen md:ml-[260px]">
      <DashboardTopBar user={user} initials={initials} greeting={greeting} onCreate={openCreateForm} canCreate={canCreateTicket} onLogout={handleLogout}/>
      <div id="dashboard" className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <DashboardStats stats={stats}/>
        <section id="tickets" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center"><div><div className="flex items-center gap-2"><h2 className="text-base font-bold text-slate-900">Recent tickets</h2><span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">{sortedTickets.length}</span></div><p className="mt-1.5 text-xs text-slate-500">Manage and track customer support requests.</p></div><button type="button" onClick={()=>void refetch()} disabled={isFetching} className="self-start rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 disabled:opacity-60">{isFetching&&!loading?"Refreshing...":"↻ Refresh"}</button></div>
          <TicketFilters search={searchTerm} status={statusFilter} sort={sortBy} onSearch={value=>{setSearchTerm(value);resetPage();}} onStatus={value=>{setStatusFilter(value);resetPage();}} onSort={value=>{setSortBy(value);resetPage();}}/>
          {loading&&<div className="px-6 py-16 text-center text-sm text-slate-500" role="status">Loading tickets...</div>}
          {!loading&&isFetching&&!error&&<div className="border-b border-indigo-100 bg-indigo-50/60 px-5 py-2 text-xs text-indigo-600" role="status">Updating ticket information...</div>}
          {!loading&&error&&<div className="px-6 py-16 text-center" role="alert"><p className="text-sm text-rose-600">{error}</p><button type="button" onClick={()=>void refetch()} className="mt-4 rounded-lg bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600">Try again</button></div>}
          {!loading&&!error&&actionError&&!showForm&&<p className="mx-5 mt-4 rounded-lg bg-rose-50 px-4 py-3 text-xs text-rose-600" role="alert">{actionError}</p>}
          {!loading&&!error&&sortedTickets.length===0&&<div className="px-6 py-16 text-center"><div className="mb-4 text-2xl text-indigo-500">▤</div><h3 className="text-sm font-bold">No tickets found</h3><p className="mx-auto mt-2 max-w-sm text-xs text-slate-500">{visibleTickets.length===0?(user?.role==="Support Agent"?"No tickets are assigned to you yet.":"No tickets found. Create your first ticket!"):"No matching tickets found."}</p></div>}
          {!loading&&!error&&sortedTickets.length>0&&<TicketTable tickets={paginatedTickets} allTickets={visibleTickets} onEdit={openEditForm} onDelete={handleDelete} onUpdate={updateTicket}/>}
          {!loading&&!error&&sortedTickets.length>0&&<DashboardPagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} totalItems={sortedTickets.length} onPageChange={changePage}/>}
        </section>
        <footer className="flex flex-col justify-between gap-2 py-7 text-[11px] text-slate-400 sm:flex-row sm:items-center"><span>Supportly © 2026. All rights reserved.</span><span>Customer Support Management</span></footer>
      </div>
    </main>
    {successMessage&&<div className="fixed right-5 top-20 z-[60] flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-4 text-sm text-emerald-700 shadow-xl" role="status" aria-live="polite">✓ {successMessage}<button type="button" onClick={()=>setSuccessMessage("")} aria-label="Dismiss notification">×</button></div>}
    <Modal isOpen={showForm} onOpen={openForm} onClose={closeForm}><Modal.Content size="md"><Modal.Header className="flex items-center justify-between"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-600">TICKET MANAGEMENT</div><h2 className="text-xl font-bold text-slate-900">{selectedTicket?"Update ticket":"Create new ticket"}</h2><p className="mt-1 text-xs text-slate-500">{selectedTicket?"Update the ticket information below.":"Fill in the details to create a support ticket."}</p></div><button type="button" onClick={closeForm} aria-label="Close form" className="grid size-9 place-items-center rounded-xl bg-slate-100 text-xl text-slate-500">×</button></Modal.Header><Modal.Body>{actionError&&<p className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-600" role="alert">{actionError}</p>}<Suspense fallback={<div className="py-8 text-center text-sm text-slate-500" role="status">Loading ticket form...</div>}><TicketForm initialTicket={selectedTicket} onSubmit={handleSubmit} onCancel={closeForm}/></Suspense></Modal.Body></Modal.Content></Modal>
  </div>;
}
