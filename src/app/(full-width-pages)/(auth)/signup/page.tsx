import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitbud - Next.js Dashboard Template",
  description: "This is Next.js SignUp Page",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
