"use client";

import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { useUserStore } from "@/lib/userStore";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useCallback } from "react";
import { allColumns, columnsByRole } from "./columnsConfig";
import { BlockedTableActions } from "./BlockedTableActions";

export function BlockedTable() {
  // 1️⃣ Choose columns based on current role
  const { roles } = useUserStore();
  const role = roles[0] ?? "user";
  const allowed = new Set(columnsByRole[role] ?? []);
  const columns = allColumns.filter((col) => {
    // Handle different column types
    const key = "accessorKey" in col ? col.accessorKey : col.id;
    return key && allowed.has(key);
  });

  // 2️⃣ Pagination, sorting, filtering, global‐search state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // 3️⃣ Fetch the data page from Supabase
  const { data, total, loading } = useBlockedUsers(
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
    globalFilter
  );

  // Refresh data after actions
  const handleActionComplete = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // 4️⃣ Build the headless table instance
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Global search */}
      <input
        type="text"
        placeholder="Search…"
        value={globalFilter}
        onChange={(e) => {
          setGlobalFilter(e.target.value);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {!header.isPlaceholder && (
                      <div
                        className="flex cursor-pointer items-center space-x-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: "↑", desc: "↓" }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                    {header.column.getCanFilter() && (
                      <input
                        value={(header.column.getFilterValue() as string) ?? ""}
                        onChange={(e) => {
                          header.column.setFilterValue(e.target.value);
                          setPagination((p) => ({ ...p, pageIndex: 0 }));
                        }}
                        placeholder="Filter…"
                        className="mt-1 w-full border-b border-gray-300 bg-transparent px-1 text-xs dark:border-gray-600"
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Loading…
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300"
                    >
                      {cell.column.id === "actions" ? (
                        <BlockedTableActions
                          row={row.original}
                          onActionComplete={handleActionComplete}
                        />
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="ml-2 rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Next
          </button>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <select
          value={pagination.pageSize}
          onChange={(e) =>
            setPagination({
              pageIndex: 0,
              pageSize: Number(e.target.value),
            })
          }
          className="rounded border border-gray-300 bg-white px-2 py-1 text-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
