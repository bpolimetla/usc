import OilWellsMap from "./components/OilWellsMap.jsx";
import laWells from "./data/la-wells.json";

export default function LaWells() {
  return (
    <OilWellsMap
      title="Los Angeles Oil & Gas Wells"
      subtitle="Los Angeles County"
      accent="#990000"
      geojson={laWells}
      center={[33.93, -118.25]}
      zoom={9}
      destination={{ lat: 34.0195, lng: -118.2879, name: "Olin Hall (USC)", address: "3650 McClintock Ave, USC" }}
    />
  );
}
