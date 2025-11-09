import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Home, Sprout, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { riskZonesAPI, assetsAPI } from "@/lib/api";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import marker icons properly
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Fly to selected asset
function FlyToAsset({ asset }: { asset: any }) {
  const map = useMap();
  useEffect(() => {
    if (asset && asset.latitude && asset.longitude) {
      map.flyTo([asset.latitude, asset.longitude], 8);
    }
  }, [asset, map]);
  return null;
}

export default function AssetMap() {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Fetch risk zones
  const { data: riskZonesData, isLoading: loadingRiskZones } = useQuery({
    queryKey: ["riskZones"],
    queryFn: riskZonesAPI.getAll,
  });

  // Fetch assets from backend
  const { data: assetsData, isLoading: loadingAssets } = useQuery({
    queryKey: ["assets"],
    queryFn: assetsAPI.getAll,
  });

  // Handle paginated or direct array
  const riskZones = Array.isArray(riskZonesData) ? riskZonesData : riskZonesData?.results || [];
  const assets = Array.isArray(assetsData) ? assetsData : assetsData?.results || [];

  useEffect(() => {
    if (assets.length > 0 && !selectedAsset) setSelectedAsset(assets[0]);
  }, [assets, selectedAsset]);

  const getAssetIcon = (type?: string) => {
    if (!type) return Sprout;
    if (type.includes("Residential")) return Home;
    if (type.includes("Commercial")) return Building;
    return Sprout;
  };

  const getRiskForLocation = (locationName: string) => {
    const zone = riskZones.find((z: any) => z.location_name === locationName);
    return zone?.risk_score || 0;
  };

  if (loadingAssets || loadingRiskZones) return <div>Loading...</div>;
  if (assets.length === 0 || riskZones.length === 0) return <div>No assets or risk zones found</div>;

  const centerLat = assets[0]?.latitude ?? 0;
  const centerLng = assets[0]?.longitude ?? 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Asset Map</h2>
        <p className="text-muted-foreground mt-1">Insured properties and real-time risk monitoring</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Card */}
        <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-info/5">
          <div className="h-[500px] w-full rounded-lg overflow-hidden border-2 border-border">
            <MapContainer
              center={[centerLat, centerLng]}
              zoom={4}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Risk Zones */}
              {riskZones.map((zone: any) => {
                const color = zone.risk_score >= 70 ? "red" : zone.risk_score >= 50 ? "orange" : "green";
                const asset = assets.find((a: any) => a.location_name === zone.location_name);

                return (
                  <CircleMarker
                    key={zone.id}
                    center={[zone.latitude ?? 0, zone.longitude ?? 0]}
                    radius={asset ? 12 : 8}
                    pathOptions={{
                      color,
                      fillOpacity: asset ? 0.7 : 0.5,
                      weight: asset ? 2 : 1,
                    }}
                    eventHandlers={{
                      click: () => asset && setSelectedAsset(asset),
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{zone.location_name}</strong>
                        <br />
                        Risk: {zone.risk_score}
                        {asset && (
                          <>
                            <br />
                            Asset: {asset.asset_id} ({asset.type})
                          </>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* Assets */}
              {assets.map((asset: any) => {
                const risk = getRiskForLocation(asset.location_name ?? "");
                return (
                  <CircleMarker
                    key={asset.asset_id}
                    center={[asset.latitude ?? 0, asset.longitude ?? 0]}
                    radius={selectedAsset?.asset_id === asset.asset_id ? 14 : 10}
                    pathOptions={{
                      color: risk >= 70 ? "red" : risk >= 50 ? "orange" : "green",
                      fillOpacity: selectedAsset?.asset_id === asset.asset_id ? 0.9 : 0.6,
                      weight: selectedAsset?.asset_id === asset.asset_id ? 3 : 1,
                      dashArray: selectedAsset?.asset_id === asset.asset_id ? "4" : "",
                    }}
                    eventHandlers={{
                      click: () => setSelectedAsset(asset),
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{asset.asset_id}</strong>
                        <br />
                        {asset.type} - Risk: {risk}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {selectedAsset && <FlyToAsset asset={selectedAsset} />}
            </MapContainer>
          </div>
        </Card>

        {/* Asset List & Details */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Insured Assets</h3>
            <div className="space-y-2">
              {assets.map((asset: any) => {
                const Icon = getAssetIcon(asset.type);
                const riskScore = getRiskForLocation(asset.location_name ?? "");
                return (
                  <button
                    key={asset.asset_id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedAsset?.asset_id === asset.asset_id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{asset.asset_id}</span>
                    </div>
                    <p className="text-xs opacity-90">{asset.location_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={riskScore >= 70 ? "destructive" : riskScore >= 50 ? "secondary" : "default"}
                        className="text-xs"
                      >
                        Risk: {riskScore}
                      </Badge>
                      {!asset.active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {selectedAsset && (
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Selected Asset Details</h3>
              <p><strong>ID:</strong> {selectedAsset.asset_id}</p>
              <p><strong>Type:</strong> {selectedAsset.type}</p>
              <p><strong>Location:</strong> {selectedAsset.location_name}</p>
              <p><strong>Status:</strong> {selectedAsset.active ? "Active" : "Inactive"}</p>
              <p><strong>Insured Value:</strong> ${selectedAsset.insured_value_usd}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

