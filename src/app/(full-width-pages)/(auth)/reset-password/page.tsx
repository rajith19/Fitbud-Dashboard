import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitbud - Next.js Dashboard Template",
  description: "This is Next.js Reset Password Page",
};
export default function ResetPassword() {
  return <ResetPasswordForm />;
}
