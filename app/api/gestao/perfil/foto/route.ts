import { NextResponse } from "next/server";

const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const contentType = request.headers.get("content-type")?.split(";")[0] ?? "";

  if (!url || !serviceKey) return NextResponse.json({ error: "A configuração segura do sistema não está disponível." }, { status: 503 });
  if (!accessToken) return NextResponse.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 });
  if (!supportedTypes.has(contentType)) return NextResponse.json({ error: "Escolha uma imagem JPG, PNG ou WebP." }, { status: 400 });

  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > 5 * 1024 * 1024) return NextResponse.json({ error: "Escolha uma imagem de até 5 MB." }, { status: 400 });

  const api = url.replace(/\/$/, "");
  try {
    const userResponse = await fetch(`${api}/auth/v1/user`, { headers: { apikey: serviceKey, Authorization: `Bearer ${accessToken}` } });
    const user = await userResponse.json() as { id?: string };
    if (!userResponse.ok || !user.id) return NextResponse.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 });

    const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const path = `${user.id}/perfil.${extension}`;
    const uploadResponse = await fetch(`${api}/storage/v1/object/team-avatars/${path}`, {
      method: "POST",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": contentType, "x-upsert": "true" },
      body: bytes,
    });
    if (!uploadResponse.ok) throw new Error(await uploadResponse.text());

    const avatarUrl = `${api}/storage/v1/object/public/team-avatars/${path}?v=${Date.now()}`;
    const profileResponse = await fetch(`${api}/rest/v1/team_members?id=eq.${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ avatar_url: avatarUrl }),
    });
    if (!profileResponse.ok) throw new Error(await profileResponse.text());

    return NextResponse.json({ avatarUrl });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar a foto agora." }, { status: 500 });
  }
}
