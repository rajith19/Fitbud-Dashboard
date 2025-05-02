import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitbud - Next.js Dashboard Template",
  description: "This is Next.js Signin Page",
};

export default function SignIn() {
  return <SignInForm />;
}
