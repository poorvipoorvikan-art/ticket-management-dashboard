import { useMemo } from "react";
import type { Ticket } from "../types/ticket.types";
import { usePagination } from "./usePagination";

type SortOption = "newest" | "oldest" | "priority";
export function useDashboardTickets(tickets: Ticket[], search: string, status: string, sort: SortOption, pageSize = 5) {
  const filtered = useMemo(() => tickets.filter(ticket => {
    const query = search.trim().toLowerCase();
    const matchesSearch = [ticket.subject,ticket.description,ticket.customerName,ticket.email].some(value=>value.toLowerCase().includes(query));
    return matchesSearch && (status === "All" || ticket.status === status);
  }), [tickets,search,status]);
  const sorted = useMemo(() => [...filtered].sort((a,b) => {
    if (sort === "priority") return ({High:3,Medium:2,Low:1}[b.priority] - {High:3,Medium:2,Low:1}[a.priority]);
    const first = new Date(a.createdAt).getTime(), second = new Date(b.createdAt).getTime();
    return sort === "newest" ? second-first : first-second;
  }), [filtered,sort]);
  const pagination = usePagination(sorted.length,pageSize);
  const totalPages = Math.max(1,pagination.totalPages);
  const currentPage = Math.min(pagination.currentPage,totalPages);
  const startIndex = (currentPage-1)*pageSize;
  return { sortedTickets: sorted, paginatedTickets: sorted.slice(startIndex,startIndex+pageSize), totalPages, currentPage, startIndex, changePage: pagination.changePage };
}
