import { TripPage } from "../../components/TripPage";
import { trips } from "../../data/trips";
export const metadata = { title: "Biketour da Serra ao Mar | Ekonova" };
export default function Page() { return <TripPage trip={trips.find((trip) => trip.slug === "serra-ao-mar")!} />; }

