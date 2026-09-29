import { NextResponse } from "next/server";

type ResetPasswordPayload = { email?: string; password?: string };

function unauthorized(message = "Você não tem permissão para alterar senhas.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!url || !serviceKey) return NextResponse.json({ error: "A configuração segura do sistema não está disponível." }, { status: 503 });
  if (!accessToken) return unauthorized("Sua sessão expirou. Entre novamente.");

  const payload = await request.json().catch(() => null) as ResetPasswordPayload | null;
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password;
  if (!email || !password || password.length < 10) {
    return NextResponse.json({ error: "Informe o e-mail e uma senha com pelo menos 10 caracteres." }, { status: 400 });
  }

  const api = url.replace(/\/$/, "");
  try {
    const currentUserResponse = await fetch(`${api}/auth/v1/user`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${accessToken}` },
    });
    if (!currentUserResponse.ok) return unauthorized("Sua sessão expirou. Entre novamente.");
    const currentUser = await currentUserResponse.json() as { id?: string };
    if (!currentUser.id) return unauthorized();

    const membershipResponse = await fetch(`${api}/rest/v1/team_members?id=eq.${encodeURIComponent(currentUser.id)}&select=role,active`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const memberships = await membershipResponse.json() as Array<{ role: string; active: boolean }>;
    if (!membershipResponse.ok || memberships[0]?.role !== "admin" || !memberships[0]?.active) return unauthorized();

    const usersResponse = await fetch(`${api}/auth/v1/admin/users?per_page=1000`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const usersData = await usersResponse.json() as { users?: Array<{ id: string; email?: string }> };
    const user = usersData.users?.find((item) => item.email?.toLowerCase() === email);
    if (!usersResponse.ok || !user) return NextResponse.json({ error: "Não encontrei uma conta da equipe com este e-mail." }, { status: 404 });

    const updateResponse = await fetch(`${api}/auth/v1/admin/users/${user.id}`, {
      method: "PUT",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!updateResponse.ok) throw new Error(await updateResponse.text());

    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar a senha agora." }, { status: 500 });
  }
}
