import LandingClient from "./landing-client";
import { AuthButton } from "@/components/auth-button";

export default function Page() {
  // Create the AuthButton on the server (cookies & next/headers are legal here)
  return <LandingClient authButton={<AuthButton />} />;
}
