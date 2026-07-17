import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/destinos/trekking", destination: "/hiking", permanent: true },
      { source: "/destinos/trekking/", destination: "/hiking", permanent: true },
      { source: "/destinos/biketour", destination: "/bike", permanent: true },
      { source: "/destinos/biketour/", destination: "/bike", permanent: true },
      { source: "/quem-somos", destination: "/sobre", permanent: true },
      { source: "/quem-somos/", destination: "/sobre", permanent: true },
      {
        source: "/destinos/trekking/trekking-serra-do-cipo",
        destination: "/roteiros/serra-do-cipo",
        permanent: true,
      },
      {
        source: "/destinos/trekking/trekking-serra-do-cipo/",
        destination: "/roteiros/serra-do-cipo",
        permanent: true,
      },
      {
        source: "/destinos/trekking/trekking-salta",
        destination: "/roteiros/salta",
        permanent: true,
      },
      {
        source: "/destinos/trekking/trekking-salta/",
        destination: "/roteiros/salta",
        permanent: true,
      },
      {
        source: "/destinos/trekking/trekking-equador",
        destination: "/roteiros/equador",
        permanent: true,
      },
      {
        source: "/destinos/trekking/trekking-equador/",
        destination: "/roteiros/equador",
        permanent: true,
      },
      {
        source:
          "/destinos/trekking/trekking-nos-caminhos-da-grande-florianopolis",
        destination: "/roteiros/caminhos-de-florianopolis",
        permanent: true,
      },
      {
        source:
          "/destinos/trekking/trekking-nos-caminhos-da-grande-florianopolis/",
        destination: "/roteiros/caminhos-de-florianopolis",
        permanent: true,
      },
      {
        source: "/destinos/biketour/biketour-da-serra-ao-mar",
        destination: "/roteiros/serra-ao-mar",
        permanent: true,
      },
      {
        source: "/destinos/biketour/biketour-da-serra-ao-mar/",
        destination: "/roteiros/serra-ao-mar",
        permanent: true,
      },
      {
        source: "/destinos/biketour/biketour-do-mar-para-serra",
        destination: "/roteiros/mar-para-serra",
        permanent: true,
      },
      {
        source: "/destinos/biketour/biketour-do-mar-para-serra/",
        destination: "/roteiros/mar-para-serra",
        permanent: true,
      },
      {
        source: "/destinos/biketour/destinos-biketour-patagonia",
        destination: "/roteiros/patagonia",
        permanent: true,
      },
      {
        source: "/destinos/biketour/destinos-biketour-patagonia/",
        destination: "/roteiros/patagonia",
        permanent: true,
      },
      {
        source: "/destinos/biketour/biketour-caminhos-da-colonia",
        destination: "/roteiros/caminhos-da-colonia",
        permanent: true,
      },
      {
        source: "/destinos/biketour/biketour-caminhos-da-colonia/",
        destination: "/roteiros/caminhos-da-colonia",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
