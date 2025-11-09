import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, TrendingUp, DollarSign, MapPin, FileText } from "lucide-react";
import { dashboardAPI } from "@/lib/api";

interface DashboardStats {
  total_locations: number;
  active_claims: number;
  approved_claims: number;
  pending_claims: number;
  total_claim_amount: number;
  active_triggers: number;
  high_risk_zones: number;
  medium_risk_zones: number;
  low_risk_zones: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardAPI.getStats()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load dashboard stats");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error || !stats) return <div>{error || "No data available"}</div>;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Real-time insights from Earth observation and AI analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Locations */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Locations</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.total_locations}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-info" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm text-muted-foreground">Risk monitoring active</span>
          </div>
        </Card>

        {/* Active Claims */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Claims</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.active_claims}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-sm text-muted-foreground">{stats.approved_claims} approved</span>
          </div>
        </Card>

        {/* Total Claims Value */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Claims Value</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ${(stats.total_claim_amount / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Across {stats.active_claims} policies
            </span>
          </div>
        </Card>

        {/* Active Triggers */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Triggers</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.active_triggers}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Parametric conditions</span>
          </div>
        </Card>
      </div>

      {/* Risk Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Score Distribution</h3>
          <div className="flex gap-4">
            <div className="flex-1 bg-destructive/10 p-4 rounded-lg">
              <p className="font-medium text-sm">High Risk</p>
              <p className="text-2xl font-bold">{stats.high_risk_zones}</p>
            </div>
            <div className="flex-1 bg-warning/10 p-4 rounded-lg">
              <p className="font-medium text-sm">Medium Risk</p>
              <p className="text-2xl font-bold">{stats.medium_risk_zones}</p>
            </div>
            <div className="flex-1 bg-success/10 p-4 rounded-lg">
              <p className="font-medium text-sm">Low Risk</p>
              <p className="text-2xl font-bold">{stats.low_risk_zones}</p>
            </div>
          </div>
        </Card>

        {/* Recent Claims */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Claims Activity</h3>
          <p className="text-sm text-muted-foreground">
            Use the claims page to see detailed recent claims.
          </p>
        </Card>
      </div>
    </div>
  );
}

