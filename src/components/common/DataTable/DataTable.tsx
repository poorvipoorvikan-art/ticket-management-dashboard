import type { DataTableProps } from "./DataTable.types";

function DataTable<T>({
  columns,
  data,
  getRowId,
  loading = false,
  emptyMessage = "No records found.",
  sort,
  onSort,
  pagination,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;

    const direction =
      sort?.key === key && sort.direction === "asc" ? "desc" : "asc";

    onSort({ key, direction });
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 font-semibold text-gray-700 ${column.className ?? ""}`}
              >
                {column.sortable && onSort ? (
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-2"
                  >
                    {column.header}
                    {sort?.key === column.key && (
                      <span>{sort.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={getRowId(row)}
                className="transition-colors hover:bg-gray-50"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-gray-600 ${column.className ?? ""}`}
                  >
                    {column.render
                      ? column.render(row)
                      : column.accessor
                        ? String(row[column.accessor] ?? "—")
                        : "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            disabled={pagination.currentPage === 1}
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default DataTable;