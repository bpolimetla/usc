import OilWellsMap from "./components/OilWellsMap.jsx";
import sfoWells from "./data/sfo-wells.json";

export default function SfoWells() {
  return (
    <OilWellsMap
      title="SF Bay Area Oil & Gas Wells"
      subtitle="San Francisco Bay Area"
      accent="#1565c0"
      geojson={sfoWells}
      center={[37.29, -122.13]}
      zoom={8}
    />
  );
}
