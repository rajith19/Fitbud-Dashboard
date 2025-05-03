import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitbud - Next.js Dashboard Template",
  description: "This is Next.js Update Page",
  // other metadata
};

export default function UpdatePassword() {
  return <UpdatePasswordForm />;
}
