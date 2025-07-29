// app/protected/layout.tsx (optional - for additional protection)
import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    return <>{children}</>;
}