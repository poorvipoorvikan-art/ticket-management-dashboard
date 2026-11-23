import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor?: keyof T;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableSort {
  key: string;
  direction: "asc" | "desc";
}

export interface DataTablePagination {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  sort?: DataTableSort;
  onSort?: (sort: DataTableSort) => void;
  pagination?: DataTablePagination;
}