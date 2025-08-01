// src/hooks/useBlockedUsers.ts
import { useUserStore } from "@/lib/userStore";
import type { BlockedRow } from "@/types";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { handleError } from "@/utils/errorHandling";

export function useBlockedUsers(
  pageIndex: number,
  pageSize: number,
  sorting: SortingState,
  columnFilters: ColumnFiltersState,
  globalFilter: string,
  refreshKey?: number
) {
  const { user, roles } = useUserStore();
  const isAdmin = roles.includes("admin");

  const [data, setData] = useState<BlockedRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: (pageIndex + 1).toString(),
          limit: pageSize.toString(),
        });

        // Add search parameter
        if (globalFilter) {
          params.append("search", globalFilter);
        }

        // Add sorting parameter
        if (sorting.length > 0) {
          const sort = sorting[0];
          params.append("sort", sort.id);
          params.append("order", sort.desc ? "desc" : "asc");
        }

        // Add column filters
        columnFilters.forEach((filter) => {
          if (filter.value) {
            params.append(`filter_${filter.id}`, filter.value.toString());
          }
        });

        const response = await fetch(`/api/blocked-users?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch blocked users");
        }

        const result = await response.json();

        if (isMounted) {
          // Transform the API response to match BlockedRow format
          const transformedData: BlockedRow[] = result.data.map(
            (item: {
              id: string;
              created_at: string;
              reason: string | null;
              blocker: { id: string; full_name: string; email: string };
              blocked: { id: string; full_name: string; email: string };
            }) => ({
              id: item.id,
              created_at: item.created_at,
              reason: item.reason,
              blocker: {
                id: item.blocker.id,
                full_name: item.blocker.full_name,
                email: item.blocker.email,
              },
              blocked: {
                id: item.blocked.id,
                full_name: item.blocked.full_name,
                email: item.blocked.email,
              },
            })
          );

          setData(transformedData);
          setTotal(result.pagination.total);
        }
      } catch (e) {
        console.error("Failed to load blocked users:", e);
        handleError(e, "Failed to load blocked users");
        if (isMounted) {
          setData([]);
          setTotal(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [user, roles, pageIndex, pageSize, sorting, columnFilters, globalFilter, isAdmin, refreshKey]);

  return { data, total, loading };
}
