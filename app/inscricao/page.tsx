import { redirect } from "next/navigation";
import { registrationWhatsApp } from "../data/trip-contact";

export default function InscricaoPage() {
  // O endereço sem slug foi divulgado para o Andes Essencial.
  redirect(registrationWhatsApp("Andes Essencial"));
}
