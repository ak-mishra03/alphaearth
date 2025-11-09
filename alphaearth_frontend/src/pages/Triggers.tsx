import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Wind, Droplets, Activity, CloudRain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { triggersAPI } from "@/lib/api";

export default function Triggers() {
  // Fetch triggers from backend
  const { data: triggersData, isLoading } = useQuery({
    queryKey: ['triggers'],
    queryFn: triggersAPI.getAll,
  });

  // Normalize triggers to always be an array
  const triggers = Array.isArray(triggersData) ? triggersData : triggersData?.results || [];

  const getIcon = (parameter: string) => {
    if (parameter.includes("Wind")) return Wind;
    if (parameter.includes("Rain")) return Droplets;
    if (parameter.includes("River")) return CloudRain;
    return Activity;
  };

  const getProgressValue = (current: number, threshold: number) => {
    return Math.min((current / threshold) * 100, 100);
  };

  if (isLoading) return <div>Loading...</div>;
  if (triggers.length === 0) return <div>No triggers found</div>;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Parametric Triggers</h2>
        <p className="text-muted-foreground mt-1">Real-time monitoring of automated claim conditions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <Badge variant="default" className="bg-success">Active</Badge>
          </div>
          <p className="text-2xl font-bold">{triggers.filter((t: any) => t.triggered).length}</p>
          <p className="text-sm text-muted-foreground mt-1">Triggers currently active</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-muted/50 to-muted">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="secondary">Monitoring</Badge>
          </div>
          <p className="text-2xl font-bold">{triggers.filter((t: any) => !t.triggered).length}</p>
          <p className="text-sm text-muted-foreground mt-1">Triggers below threshold</p>
        </Card>
      </div>

      <div className="grid gap-4">
        {triggers.map((trigger: any) => {
          const Icon = getIcon(trigger.parameter);
          const progressValue = getProgressValue(trigger.current_value, trigger.threshold);
          const isNearThreshold = progressValue >= 90 && !trigger.triggered;

          return (
            <Card
              key={trigger.trigger_id}
              className={`p-6 transition-all ${
                trigger.triggered
                  ? "border-destructive bg-destructive/5"
                  : isNearThreshold
                  ? "border-warning bg-warning/5"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    trigger.triggered
                      ? "bg-destructive/10"
                      : isNearThreshold
                      ? "bg-warning/10"
                      : "bg-primary/10"
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      trigger.triggered
                        ? "text-destructive"
                        : isNearThreshold
                        ? "text-warning"
                        : "text-primary"
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{trigger.parameter}</h3>
                    <p className="text-sm text-muted-foreground">{trigger.location_name}</p>
                  </div>
                </div>
                <Badge variant={trigger.triggered ? "destructive" : "secondary"}>
                  {trigger.trigger_id}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Value</span>
                  <span className="font-semibold text-lg">
                    {trigger.current_value} {trigger.unit}
                  </span>
                </div>

                <Progress value={progressValue} className="h-2" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Threshold</span>
                  <span className="font-medium">{trigger.threshold} {trigger.unit}</span>
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {trigger.triggered ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Threshold Exceeded</span>
                      </>
                    ) : isNearThreshold ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-sm font-medium text-warning">Approaching Threshold</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">Within Safe Range</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">Last checked: {trigger.date_checked}</span>
                </div>

                {trigger.triggered && (
                  <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive">
                      ⚠️ Automatic payout triggered for affected policies
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">How Parametric Triggers Work</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <span>Real-time monitoring of weather and environmental conditions from trusted data sources</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <span>Automatic claim approval when predefined thresholds are exceeded</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <span>Instant payouts without manual verification, reducing processing time from weeks to minutes</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <span>Transparent, data-driven decisions based on objective measurements</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

