import OilWellsMap from "./components/OilWellsMap.jsx";
import sanDiegoWells from "./data/sandiego-wells.json";

export default function SanDiegoWells() {
  return (
    <OilWellsMap
      title="San Diego Oil & Gas Wells"
      subtitle="San Diego County"
      accent="#2e7d32"
      geojson={sanDiegoWells}
      center={[32.81, -117.12]}
      zoom={9}
    />
  );
}
