import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "../hooks/useTickets";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import TicketTable from "../components/TicketTable";
import TicketForm from "../components/TicketForm";
import type { Ticket, TicketFormData } from "../types/ticket.types";

type SortOption = "newest" | "oldest" | "priority";

const PAGE_SIZE = 5;

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "🌄Good morning";
  if (hour >= 12 && hour < 17) return "🌇Good afternoon";
  if (hour >= 17 && hour < 21) return "🌆Good evening";

  return "🌃Good night";
};

export default function TicketDashboard() {
  const {
    tickets,
    loading,
    isFetching,
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
  const [greeting, setGreeting] = useState(getGreeting);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!successMessage) return;

    const timeout = setTimeout(() => setSuccessMessage(""), 3000);

    return () => clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

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
        setSuccessMessage("Ticket updated successfully.");
      } else {
        await createTicket(data);
        setSuccessMessage("Ticket created successfully.");
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
      setSuccessMessage("Ticket deleted successfully.");
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
      color: "bg-indigo-50 text-indigo-600",
      accent: "bg-indigo-500"
    },
    {
      label: "Open tickets",
      value: openCount,
      note: "Awaiting response",
      icon: "◷",
      color: "bg-sky-50 text-sky-600",
      accent: "bg-sky-500"
    },
    {
      label: "In progress",
      value: progressCount,
      note: "Currently being handled",
      icon: "↻",
      color: "bg-amber-50 text-amber-600",
      accent: "bg-amber-500"
    },
    {
      label: "Resolved",
      value: resolvedCount,
      note: "Successfully completed",
      icon: "✓",
      color: "bg-emerald-50 text-emerald-600",
      accent: "bg-emerald-500"
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

  const navigationItems = [
    {
      label: "Overview",
      icon: "▦",
      filter: "All"
    },
    {
      label: "All Tickets",
      icon: "▤",
      filter: "All",
      count: visibleTickets.length
    },
    {
      label: "Open Tickets",
      icon: "◷",
      filter: "Open"
    },
    {
      label: "Resolved",
      icon: "✓",
      filter: "Resolved"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-[#111827] px-5 py-7 text-white md:flex">
        <div className="mb-12 flex items-center gap-3 px-2">
          <div className="grid size-11 place-items-center rounded-xl bg-indigo-600 text-xl font-bold shadow-lg shadow-indigo-950/30">
            T
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              TASK MANAGEMENT
            </h2>
            <span className="text-xs font-medium tracking-wide text-slate-400">
              SUPPORT WORKSPACE
            </span>
          </div>
        </div>

        <div className="mb-4 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-500">
          WORKSPACE
        </div>

        <nav className="space-y-1.5" aria-label="Main navigation">
          {navigationItems.map((item, index) => {
            const isActive =
              (index === 0 && statusFilter === "All") ||
              (index === 2 && statusFilter === "Open") ||
              (index === 3 && statusFilter === "Resolved");

            return (
              <a
                key={item.label}
                href={index === 0 ? "#dashboard" : "#tickets"}
                onClick={() => {
                  setStatusFilter(item.filter);
                  setCurrentPage(1);
                }}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="grid size-6 place-items-center text-lg">
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {item.count !== undefined && (
                  <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-200">
                    {item.count}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">
                Workspace active
              </span>
            </div>
            <p className="text-[11px] leading-5 text-slate-500">
              Manage customer requests and keep your support team organized.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 px-1 pt-5">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-500 text-xs font-bold text-white">
              {userInitials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name}
              </p>
              <p className="mt-1 truncate text-[11px] text-slate-400">
                {user?.role}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              ↗
            </button>
          </div>
        </div>
      </aside>

      {successMessage && (
        <div
          className="fixed right-5 top-20 z-[60] flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-4 text-sm font-medium text-emerald-700 shadow-xl"
          role="status"
          aria-live="polite"
        >
          <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            ✓
          </span>
          {successMessage}
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss notification"
            className="ml-2 text-lg text-slate-400 transition hover:text-slate-700"
          >
            ×
          </button>
        </div>
      )}

      <main className="min-h-screen md:ml-[260px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white md:hidden">
              S
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400">
                Workspace
              </p>
              <div className="mt-0.5 text-sm font-semibold text-slate-800">
                Overview
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <span className="hidden text-xs font-medium text-slate-500 sm:inline">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </span>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <button
              type="button"
              aria-label="Notifications"
              className="relative grid size-9 place-items-center rounded-xl text-lg text-slate-500 transition hover:bg-slate-100"
            >
              ♧
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-rose-500" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {userInitials}
              </div>

              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">
                  {user?.name}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {user?.role}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 md:hidden"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="border-b border-slate-200 bg-white px-4 py-2.5 md:hidden">
          <nav className="flex gap-2 overflow-x-auto" aria-label="Mobile navigation">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href="#tickets"
                onClick={() => {
                  setStatusFilter(item.filter);
                  setCurrentPage(1);
                }}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  statusFilter === item.filter
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div
          id="dashboard"
          className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8"
        >
          <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-indigo-600">
                <span className="size-1.5 rounded-full bg-indigo-500" />
                SUPPORT OVERVIEW
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-[34px]">
                {greeting}, {user?.name.split(" ")[0] ?? "there"}
                <span className="ml-2 text-indigo-500">✦</span>
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Here's what's happening with your support tickets today.
              </p>
            </div>

            {user?.role === "Administrator" && (
              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center justify-center gap-2.5 self-start rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/25 lg:self-auto"
              >
                <span className="text-xl leading-none">＋</span>
                Create ticket
              </button>
            )}
          </section>

          <section
            aria-label="Ticket statistics"
            className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70"
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${stat.accent}`}
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {stat.label}
                  </span>

                  <span
                    className={`grid size-11 place-items-center rounded-xl text-xl transition duration-300 group-hover:scale-110 ${stat.color}`}
                  >
                    {stat.icon}
                  </span>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <strong className="block text-3xl font-bold tracking-tight text-slate-900">
                      {stat.value}
                    </strong>

                    <p className="mt-1.5 text-xs text-slate-500">
                      {stat.note}
                    </p>
                  </div>

                  <span className="pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                    Tickets
                  </span>
                </div>
              </article>
            ))}
          </section>

          <section
            id="tickets"
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Recent tickets
                  </h2>

                  <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                    {sortedTickets.length}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-500">
                  Manage and track customer support requests.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 lg:self-auto"
              >
                <span className={isFetching ? "animate-spin text-base" : "text-base"}>↻</span>
                {isFetching && !loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6 md:flex-row md:flex-wrap md:items-center">
              <label className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 md:max-w-sm">
                <span className="text-xl text-slate-400">⌕</span>

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search tickets..."
                  aria-label="Search tickets"
                  className="w-full bg-transparent py-2.5 text-xs text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter tickets by status"
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="priority">Highest priority</option>
              </select>
            </div>

            {loading && (
              <div
                className="px-6 py-16 text-center text-sm text-slate-500"
                role="status"
              >
                <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" />
                Loading tickets...
              </div>
            )}

            {!loading && isFetching && !error && (
              <div className="border-b border-indigo-100 bg-indigo-50/60 px-5 py-2 text-xs font-medium text-indigo-600 sm:px-6" role="status">
                Updating ticket information...
              </div>
            )}

            {!loading && error && (
              <div
                className="px-6 py-16 text-center"
                role="alert"
              >
                <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-rose-50 text-xl text-rose-500">
                  !
                </div>

                <p className="text-sm font-medium text-rose-600">{error}</p>

                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-4 rounded-lg bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && actionError && !showForm && (
              <p
                className="mx-5 mt-4 rounded-lg bg-rose-50 px-4 py-3 text-xs font-medium text-rose-600 sm:mx-6"
                role="alert"
              >
                {actionError}
              </p>
            )}

            {!loading && !error && sortedTickets.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-indigo-50 text-2xl text-indigo-500">
                  ▤
                </div>

                <h3 className="text-sm font-bold text-slate-800">
                  No tickets found
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                  {visibleTickets.length === 0
                    ? user?.role === "Support Agent"
                      ? "No tickets are assigned to you yet."
                      : "No tickets found. Create your first ticket!"
                    : "No matching tickets found."}
                </p>
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
              <div className="flex flex-col gap-4 border-t border-slate-100 bg-white px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span>
                  Showing{" "}
                  <strong className="font-semibold text-slate-700">
                    {startIndex + 1}–
                    {Math.min(startIndex + PAGE_SIZE, sortedTickets.length)}
                  </strong>{" "}
                  of{" "}
                  <strong className="font-semibold text-slate-700">
                    {sortedTickets.length}
                  </strong>{" "}
                  tickets
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous
                  </button>

                  <span className="rounded-lg bg-indigo-50 px-3 py-2 font-semibold text-indigo-600">
                    {safeCurrentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage((page) => page + 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </section>

          <footer className="flex flex-col justify-between gap-2 py-7 text-[11px] text-slate-400 sm:flex-row sm:items-center">
            <span>Supportly © 2026. All rights reserved.</span>
            <span>Customer Support Management</span>
          </footer>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
          <section
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-form-title"
          >
            <header className="mb-6 flex items-center justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold tracking-wider text-indigo-600">
                  <span className="size-1.5 rounded-full bg-indigo-500" />
                  TICKET MANAGEMENT
                </div>

                <h2
                  id="ticket-form-title"
                  className="text-xl font-bold tracking-tight text-slate-900"
                >
                  {selectedTicket ? "Update ticket" : "Create new ticket"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedTicket
                    ? "Update the ticket information below."
                    : "Fill in the details to create a support ticket."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
              >
                ×
              </button>
            </header>

            {actionError && (
              <p
                className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-600"
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