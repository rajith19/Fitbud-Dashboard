// src/hooks/useBlockedUsers.ts
import { useSupabase } from "@/hooks/useSupabase";
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
  const { supabase } = useSupabase();
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
        const from = pageIndex * pageSize;
        const to = from + pageSize - 1;

        // Build the base query using the view
        let query = supabase
          .from("UserBlocksWithProfiles")
          .select(`*`, { count: "exact" })
          .range(from, to);

        // Apply global filter if provided
        if (globalFilter) {
          query = query.or(
            `blocker.full_name.ilike.%${globalFilter}%,blocker.email.ilike.%${globalFilter}%,blocked.full_name.ilike.%${globalFilter}%,blocked.email.ilike.%${globalFilter}%`
          );
        }

        // Apply column filters
        columnFilters.forEach((filter) => {
          if (filter.value) {
            query = query.ilike(filter.id, `%${filter.value}%`);
          }
        });

        // Apply sorting
        if (sorting.length > 0) {
          const sort = sorting[0];
          query = query.order(sort.id, { ascending: !sort.desc });
        } else {
          // Default sort by created_at desc
          query = query.order("created_at", { ascending: false });
        }

        const res = await query;

        if (res.error) throw res.error;
        if (isMounted) {
          setData(res.data as unknown as BlockedRow[]);
          setTotal(res.count ?? 0);
        }
      } catch (e) {
        console.error("Failed to load blocked users:", e);
        handleError(e, "Failed to load blocked users");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [
    supabase,
    user,
    roles,
    pageIndex,
    pageSize,
    sorting,
    columnFilters,
    globalFilter,
    isAdmin,
    refreshKey,
  ]);

  return { data, total, loading };
}
