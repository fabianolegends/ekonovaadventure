import { NextResponse } from "next/server";

function reply(value: unknown, status: number) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return reply({ error: "Entre no painel para gerar o contrato." }, 401);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const apikey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const unavailable = "A assinatura da Destino Ativo está indisponível. Tente novamente.";
  if (!url || !apikey) return reply({ error: unavailable }, 503);

  try {
    const options = { headers: { apikey, Authorization: authorization }, cache: "no-store" } as const;
    const auth = await fetch(`${url}/auth/v1/user`, options);
    if (!auth.ok) return reply({ error: "Sua sessão expirou. Entre novamente." }, 401);
    const user = await auth.json() as { id?: string };
    if (!user.id) return reply({ error: "Sua sessão expirou. Entre novamente." }, 401);
    const check = await fetch(`${url}/rest/v1/team_members?id=eq.${encodeURIComponent(user.id)}&active=eq.true&select=id`, options);
    if (!check.ok) return reply({ error: unavailable }, 503);
    const members = await check.json() as { id: string }[];
    if (!members.some(member => member.id === user.id)) return reply({ error: "A emissão é restrita à equipe ativa." }, 403);

    const signer = JSON.parse(process.env.EKONOVA_CONTRACT_SIGNER || "{}") as { name?: string; cpf?: string; png?: string };
    if (!signer.name || !signer.cpf || !/^iVBORw0KGgo[A-Za-z0-9+/]+=*$/.test(signer.png || "")) {
      return reply({ error: unavailable }, 503);
    }
    return reply({ name: signer.name, cpf: signer.cpf, png: signer.png }, 200);
  } catch {
    return reply({ error: unavailable }, 503);
  }
}
