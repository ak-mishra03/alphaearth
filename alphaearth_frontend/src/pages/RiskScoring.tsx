import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, Flame, Droplets, Wind, Thermometer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

// --------------------
// TypeScript Types
// --------------------
export interface Location {
  id: number;
  location_name: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  flood_risk: number; // 0-1
  wildfire_risk: number; // 0-1
  storm_risk: number; // 0-1
  vegetation_dryness: number; // 0-1
  sea_level_rise_m: number;
  historical_events: number;
  avg_temp_c: number;
}

type RiskLevel = {
  label: string;
  color: "destructive" | "secondary" | "default";
};

// --------------------
// Component
// --------------------
export default function RiskScoring() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Fetch risk zones from backend (handle pagination)
  const { data: riskZonesRaw, isLoading } = useQuery<Location[]>({
    queryKey: ["riskZones"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/risk-zones/`);
      if (!res.ok) throw new Error("Failed to fetch risk zones");
      const json = await res.json();
      return Array.isArray(json) ? json : json.results || [];

    },
  });

  const riskZones = riskZonesRaw || [];

  // Set the first location as selected automatically
  useEffect(() => {
    if (riskZones.length > 0 && !selectedLocation) {
      setSelectedLocation(riskZones[0]);
    }
  }, [riskZones, selectedLocation]);

  // Filter locations by search query
  const filteredLocations: Location[] = riskZones.filter((location) =>
    location.location_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute risk level for badge
  const getRiskLevel = (score: number): RiskLevel => {
    if (score >= 70) return { label: "High Risk", color: "destructive" };
    if (score >= 50) return { label: "Medium Risk", color: "secondary" };
    return { label: "Low Risk", color: "default" };
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (riskZones.length === 0) {
    return <div>No risk zones available.</div>;
  }

  if (!selectedLocation) {
    return <div>Please select a location.</div>;
  }

  // Radar chart data
  const radarData = [
    { factor: "Flood", value: selectedLocation.flood_risk * 100 },
    { factor: "Wildfire", value: selectedLocation.wildfire_risk * 100 },
    { factor: "Storm", value: selectedLocation.storm_risk * 100 },
    { factor: "Vegetation", value: selectedLocation.vegetation_dryness * 100 },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Risk Scoring Dashboard</h2>
        <p className="text-muted-foreground mt-1">AI-powered risk assessment using satellite and climate data</p>
      </div>

      {/* Search and Location List */}
      <Card className="p-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search location (e.g., Miami, FL)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <div className="mt-4 grid gap-2 max-h-48 overflow-y-auto">
          {filteredLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              className={`p-3 rounded-lg text-left transition-all ${
                selectedLocation.id === location.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{location.location_name}</span>
                <Badge variant={selectedLocation.id === location.id ? "secondary" : "outline"}>
                  Score: {location.risk_score}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Selected Location Details and Radar Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Card: Location Details */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold">{selectedLocation.location_name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedLocation.latitude.toFixed(4)}°N, {Math.abs(selectedLocation.longitude).toFixed(4)}°W
              </p>
            </div>
            <Badge variant={getRiskLevel(selectedLocation.risk_score).color} className="text-lg px-4 py-2">
              {selectedLocation.risk_score}
            </Badge>
          </div>

          <div className="space-y-4">
            {/* Flood Risk */}
            <RiskItem
              icon={<Droplets className="h-5 w-5 text-info" />}
              bgColor="bg-info/10"
              label="Flood Risk"
              value={`${(selectedLocation.flood_risk * 100).toFixed(0)}%`}
              subText={`Sea level: +${selectedLocation.sea_level_rise_m}m`}
            />
            {/* Wildfire Risk */}
            <RiskItem
              icon={<Flame className="h-5 w-5 text-destructive" />}
              bgColor="bg-destructive/10"
              label="Wildfire Risk"
              value={`${(selectedLocation.wildfire_risk * 100).toFixed(0)}%`}
              subText={`Vegetation dryness: ${(selectedLocation.vegetation_dryness * 100).toFixed(0)}%`}
            />
            {/* Storm Risk */}
            <RiskItem
              icon={<Wind className="h-5 w-5 text-warning" />}
              bgColor="bg-warning/10"
              label="Storm Risk"
              value={`${(selectedLocation.storm_risk * 100).toFixed(0)}%`}
              subText={`Historical events: ${selectedLocation.historical_events}`}
            />
            {/* Temperature */}
            <RiskItem
              icon={<Thermometer className="h-5 w-5 text-success" />}
              bgColor="bg-success/10"
              label="Average Temperature"
              value={`${selectedLocation.avg_temp_c}°C`}
              subText="Climate baseline"
            />
          </div>
        </Card>

        {/* Right Card: Radar Chart & AI Assessment */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Factor Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="factor" tick={{ fill: "hsl(var(--foreground))" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Risk Level"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-sm">AI Assessment</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This location shows {getRiskLevel(selectedLocation.risk_score).label.toLowerCase()} based on{" "}
                  {selectedLocation.historical_events} historical disaster events and current climate indicators.
                  {selectedLocation.flood_risk > 0.7 && " Significant flood risk detected."}
                  {selectedLocation.wildfire_risk > 0.7 && " High wildfire probability."}
                  {selectedLocation.storm_risk > 0.7 && " Elevated storm activity expected."}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// --------------------
// Reusable Component for Risk Items
// --------------------
function RiskItem({ icon, bgColor, label, value, subText }: any) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg Loading..${bgColor}`}>
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bgColor}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{subText}</p>
        </div>
      </div>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}

