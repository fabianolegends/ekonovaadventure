import type { Trip } from "./trips";

const reservationsPhone = "5554991953197";

export function reservationsWhatsApp(message: string) {
  return `https://wa.me/${reservationsPhone}?text=${encodeURIComponent(message)}`;
}

export function registrationWhatsApp(title: string) {
  return reservationsWhatsApp(`Quero me inscrever: ${title}`);
}

export const tripPresentation: Record<Trip["status"], { badge: string; action: string }> = {
  "Inscrições abertas": { badge: "status-confirmed", action: "Inscrever pelo WhatsApp" },
  "Grupo em formação": { badge: "status-forming", action: "Participar pelo WhatsApp" },
  "Sob consulta": { badge: "status-consult", action: "Consultar pelo WhatsApp" },
  "Lista de interesse": { badge: "status-interest", action: "Entrar na lista pelo WhatsApp" },
  "Edição realizada": { badge: "status-consult", action: "Ver edição realizada" },
};
