import { createColumnHelper } from "@tanstack/react-table";
import type { BlockedRow } from "@/types";

const col = createColumnHelper<BlockedRow>();

export const allColumns = [
  col.accessor("blocker.full_name", {
    header: "Blocker Name",
    cell: (info) => info.getValue() || "Unknown User",
  }),
  col.accessor("blocker.email", {
    header: "Blocker Email",
    cell: (info) => info.getValue() || "No email",
  }),
  col.accessor("blocked.full_name", {
    header: "Blocked User",
    cell: (info) => info.getValue() || "Unknown User",
  }),
  col.accessor("blocked.email", {
    header: "Blocked Email",
    cell: (info) => info.getValue() || "No email",
  }),
  col.accessor("created_at", {
    header: "Block Date",
    cell: (info) => {
      const date = new Date(info.getValue());
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    },
  }),
  col.accessor("id", {
    header: "Block ID",
    cell: (info) => info.getValue().slice(0, 8) + "...",
  }),
  col.display({
    id: "actions",
    header: "Actions",
    cell: () => {
      // Return a placeholder that will be replaced by the parent component
      return "ACTIONS_PLACEHOLDER";
    },
  }),
];

// which columns each role can see
export const columnsByRole: Record<string, string[]> = {
  admin: [
    "blocker.full_name",
    "blocker.email",
    "blocked.full_name",
    "blocked.email",
    "created_at",
    "id",
    "actions",
  ],
  moderator: ["blocker.full_name", "blocked.full_name", "blocked.email", "created_at", "actions"],
  user: ["blocked.full_name", "created_at"],
};
