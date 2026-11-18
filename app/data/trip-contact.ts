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

export function tripRegistration(trip: Trip, onlineHref?: string) {
  if (onlineHref) return { badge: "status-confirmed", status: "Inscrições abertas", action: "Fazer inscrição", href: onlineHref };
  if (trip.status === "Inscrições abertas") {
    return { badge: "status-consult", status: "Consulte a equipe", action: "Consultar pelo WhatsApp", href: reservationsWhatsApp(`Gostaria de consultar a inscrição para ${trip.title}.`) };
  }
  return { ...tripPresentation[trip.status], status: trip.status, href: registrationWhatsApp(trip.title) };
}
