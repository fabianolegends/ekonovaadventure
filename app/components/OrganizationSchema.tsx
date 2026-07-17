const BASE_URL = "https://www.ekonovaadv.com.br";

export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${BASE_URL}/#organization`,
    name: "Ekonova Adventure",
    url: BASE_URL,
    logo: `${BASE_URL}/ekonova-logo.png`,
    image: `${BASE_URL}/images/clientes-trilha.jpeg`,
    description:
      "Turismo ativo 50+ em pequenos grupos, com experiências de hiking e expedições de cicloturismo no Brasil e na América do Sul.",
    foundingDate: "2012",
    telephone: "+55 54 99119-5626",
    email: "contato@ekonovaadv.com.br",
    sameAs: [
      "https://www.instagram.com/ekonovaadventure/",
      "https://www.facebook.com/EkonovaAdventure/",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "reservas e atendimento",
      telephone: "+55 54 99119-5626",
      email: "contato@ekonovaadv.com.br",
      availableLanguage: ["Portuguese"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
