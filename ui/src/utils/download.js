import aptsRaw from "../data/apts.json";
import { loadVotes } from "./votes";

export function downloadCSV() {
  const votes = loadVotes();
  const headers = [
    "Apartment", "Rating", "Rent (2x2)", "Distance (mi)", "Drive Mon 8AM",
    "Address", "Website", "Comments", "Vote",
  ];
  const fields = ["name", "rating", "rent", "distanceMiles", "drivingTime", "exactAddress", "website", "comments"];

  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const rows = aptsRaw.map((apt) => {
    const v = votes[apt.name];
    return [
      ...fields.map((f) => esc(apt[f])),
      esc(v === "up" ? "Yes" : v === "down" ? "No" : ""),
    ].join(",");
  });

  const csv = [headers.map(esc).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "usc-apartments.csv";
  a.click();
  URL.revokeObjectURL(url);
}
