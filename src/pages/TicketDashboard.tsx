import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "../hooks/useTickets";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import TicketTable from "../components/TicketTable";
import TicketForm from "../components/TicketForm";
import type { Ticket, TicketFormData } from "../types/ticket.types";

type SortOption = "newest" | "oldest" | "priority";

const PAGE_SIZE = 5;

export default function TicketDashboard() {
  const {
    tickets,
    loading,
    error,
    refetch,
    createTicket,
    updateTicket,
    deleteTicket
  } = useTickets();

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { canViewAllTickets } = usePermissions();

  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [actionError, setActionError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const visibleTickets = canViewAllTickets
    ? tickets
    : tickets.filter((ticket) => ticket.assignedTo === user?.id);

  const openCreateForm = () => {
    setSelectedTicket(null);
    setActionError("");
    setShowForm(true);
  };

  const openEditForm = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActionError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedTicket(null);
    setActionError("");
  };

  const handleSubmit = async (data: TicketFormData) => {
    try {
      setActionError("");

      if (selectedTicket) {
        await updateTicket(selectedTicket.id, data);
      } else {
        await createTicket(data);
      }

      setShowForm(false);
      setSelectedTicket(null);
    } catch {
      setActionError("Unable to save ticket. Please try again.");
      throw new Error("Ticket save failed");
    }
  };

  const handleDelete = async (
    ticket: Ticket,
    skipConfirmation = false
  ): Promise<void> => {
    if (!skipConfirmation) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${ticket.subject}"?`
      );

      if (!confirmed) return;
    }

    try {
      setActionError("");
      await deleteTicket(ticket.id);
    } catch {
      setActionError("Unable to delete ticket. Please try again.");
      throw new Error("Ticket deletion failed");
    }
  };

  const openCount = visibleTickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const progressCount = visibleTickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const resolvedCount = visibleTickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  const filteredTickets = visibleTickets.filter((ticket) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      ticket.subject.toLowerCase().includes(search) ||
      ticket.description.toLowerCase().includes(search) ||
      ticket.customerName.toLowerCase().includes(search) ||
      ticket.email.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1
  };

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === "priority") {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(sortedTickets.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

  const paginatedTickets = sortedTickets.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const stats = [
    {
      label: "Total tickets",
      value: visibleTickets.length,
      note: "Support requests",
      icon: "▤",
      color: "bg-violet-100 text-violet-600"
    },
    {
      label: "Open tickets",
      value: openCount,
      note: "Awaiting response",
      icon: "◷",
      color: "bg-blue-100 text-blue-600"
    },
    {
      label: "In progress",
      value: progressCount,
      note: "Currently being handled",
      icon: "↻",
      color: "bg-orange-100 text-orange-600"
    },
    {
      label: "Resolved",
      value: resolvedCount,
      note: "Successfully completed",
      icon: "✓",
      color: "bg-emerald-100 text-emerald-600"
    }
  ];

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-slate-950 px-4 py-6 text-white md:flex">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-xl bg-violet-600 text-xl font-bold">
            S
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              Supportly
            </h2>
            <span className="text-xs text-slate-400">Workspace</span>
          </div>
        </div>

        <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-500">
          WORKSPACE
        </p>

        <nav className="space-y-1" aria-label="Main navigation">
          <a
            href="#dashboard"
            className="flex items-center gap-3 rounded-lg bg-violet-600/20 px-3 py-3 text-sm font-medium text-white"
          >
            <span>▦</span>
            Overview
          </a>

          <a
            href="#tickets"
            onClick={() => {
              setStatusFilter("All");
              setCurrentPage(1);
            }}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <span>▤</span>
            All Tickets
            <span className="ml-auto text-violet-300">
              {visibleTickets.length}
            </span>
          </a>

          <a
            href="#tickets"
            onClick={() => {
              setStatusFilter("Open");
              setCurrentPage(1);
            }}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <span>◷</span>
            Open Tickets
          </a>

          <a
            href="#tickets"
            onClick={() => {
              setStatusFilter("Resolved");
              setCurrentPage(1);
            }}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <span>✓</span>
            Resolved
          </a>
        </nav>

        <div className="mt-auto flex items-center gap-3 border-t border-white/10 px-2 pt-5">
          <div className="grid size-9 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
            {userInitials}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-white">{user?.name}</p>
            <p className="mt-1 text-[11px] text-slate-400">{user?.role}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto rounded-lg px-2 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="md:ml-60">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="text-xs text-slate-500">
            Workspace <span className="mx-2 text-slate-300">/</span>
            <strong className="font-semibold text-slate-800">
              Overview
            </strong>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <span className="hidden text-xs text-slate-500 sm:inline">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </span>

            <button
              type="button"
              aria-label="Notifications"
              className="relative text-lg text-slate-500"
            >
              ♧
              <span className="absolute right-0 top-0 size-2 rounded-full bg-rose-400" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Log out
            </button>

            <div className="grid size-9 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
              {userInitials}
            </div>
          </div>
        </header>

        <div id="dashboard" className="mx-auto max-w-[1440px] p-5 sm:p-8">
          <section className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-violet-600">
                SUPPORT OVERVIEW
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Good morning, {user?.name.split(" ")[0] ?? "there"}
                <span className="ml-2 text-violet-500">✦</span>
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Here's what's happening with your support tickets today.
              </p>
            </div>

            {user?.role === "Administrator" && (
              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              >
                <span className="text-lg leading-none">＋</span>
                Create ticket
              </button>
            )}
          </section>

          <section
            aria-label="Ticket statistics"
            className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    {stat.label}
                  </span>

                  <span
                    className={`grid size-9 place-items-center rounded-lg text-base ${stat.color}`}
                  >
                    {stat.icon}
                  </span>
                </div>

                <strong className="mt-3 block text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </strong>

                <p className="mt-1 text-xs text-slate-500">{stat.note}</p>
              </article>
            ))}
          </section>

          <section
            id="tickets"
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40"
          >
            <div className="flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Recent tickets
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage and track customer support requests.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void refetch()}
                className="self-start rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 sm:self-auto"
              >
                ↻ Refresh
              </button>
            </div>

            <div className="flex flex-col gap-3 px-5 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-6">
              <label className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 px-3">
                <span className="text-lg text-slate-400">⌕</span>

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search tickets..."
                  aria-label="Search tickets"
                  className="w-full py-2.5 text-xs outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter tickets by status"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600"
              >
                <option value="All">All statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as SortOption);
                  setCurrentPage(1);
                }}
                aria-label="Sort tickets"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="priority">Highest priority</option>
              </select>
            </div>

            {loading && (
              <div
                className="px-6 py-12 text-center text-sm text-slate-500"
                role="status"
              >
                Loading tickets...
              </div>
            )}

            {!loading && error && (
              <div
                className="px-6 py-12 text-center text-sm text-rose-600"
                role="alert"
              >
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 rounded-lg bg-rose-50 px-4 py-2 font-medium hover:bg-rose-100"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && actionError && !showForm && (
              <p className="px-6 pb-4 text-sm text-rose-600" role="alert">
                {actionError}
              </p>
            )}

            {!loading && !error && sortedTickets.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                {visibleTickets.length === 0
                  ? user?.role === "Support Agent"
                    ? "No tickets are assigned to you yet."
                    : "No tickets found. Create your first ticket!"
                  : "No matching tickets found."}
              </div>
            )}

            {!loading && !error && sortedTickets.length > 0 && (
              <TicketTable
                tickets={paginatedTickets}
                allTickets={visibleTickets}
                onEdit={openEditForm}
                onDelete={handleDelete}
                onUpdate={updateTicket}
              />
            )}

            {!loading && !error && sortedTickets.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span>
                  Showing {startIndex + 1}–
                  {Math.min(startIndex + PAGE_SIZE, sortedTickets.length)} of{" "}
                  {sortedTickets.length} tickets
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                    className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-2">
                    Page {safeCurrentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage((page) => page + 1)}
                    className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>

          <footer className="flex flex-wrap justify-between gap-3 py-7 text-[11px] text-slate-400">
            <span>Supportly © 2026</span>
            <span>Customer Support Management</span>
          </footer>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <section
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-form-title"
          >
            <header className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-violet-600">
                  TICKET MANAGEMENT
                </p>

                <h2
                  id="ticket-form-title"
                  className="mt-2 text-xl font-bold text-slate-900"
                >
                  {selectedTicket ? "Update ticket" : "Create new ticket"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded-lg px-2 text-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </header>

            {actionError && (
              <p
                className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600"
                role="alert"
              >
                {actionError}
              </p>
            )}

            <TicketForm
              initialTicket={selectedTicket}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </section>
        </div>
      )}
    </div>
  );
}