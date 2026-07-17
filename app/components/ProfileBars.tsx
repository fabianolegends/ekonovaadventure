import type { Trip } from "../data/trips";

const labels: Array<[keyof Trip["profile"], string]> = [
  ["effort", "Esforço físico"],
  ["technique", "Exigência técnica"],
  ["exposure", "Altitude / exposição"],
  ["comfort", "Conforto logístico"],
];

export function ProfileBars({ profile }: { profile: Trip["profile"] }) {
  return (
    <div className="profile-bars">
      {labels.map(([key, label]) => (
        <div className="profile-row" key={key}>
          <span>{label}</span>
          <div aria-label={`${label}: ${profile[key]} de 5`}>
            {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= profile[key] ? "filled" : ""} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

