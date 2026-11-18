import { redirect } from "next/navigation";

export default function InscricaoPage() {
  // O endereço sem slug foi divulgado para o Andes Essencial.
  redirect("/inscricao/andes-essencial");
}
