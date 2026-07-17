import { TripPage } from "../../components/TripPage";
import { trips } from "../../data/trips";
export const metadata = { title: "Salta · Norte Argentino | Ekonova" };
export default function Page() { return <TripPage trip={trips.find((trip) => trip.slug === "salta")!} />; }

