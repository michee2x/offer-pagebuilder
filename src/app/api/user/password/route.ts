import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/auth";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Regular client (needed to verify current password via signInWithPassword)
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { currentPassword, newPassword } = body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Current password and new password are required" },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // Step 1 — verify the current password by attempting sign-in
  const { error: signInError } = await supabaseAnon.auth.signInWithPassword({
    email: session.user.email,
    password: currentPassword,
  });

  if (signInError) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 }
    );
  }

  // Step 2 — update to the new password using admin client (no re-auth needed)
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    session.user.id,
    { password: newPassword }
  );

  if (updateError) {
    console.error("[password] Failed to update password:", updateError);
    return NextResponse.json(
      { error: "Failed to update password. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
