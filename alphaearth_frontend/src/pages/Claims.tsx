import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { claimsAPI, damageAnalysisAPI } from "@/lib/api";

export default function Claims() {
  const [claims, setClaims] = useState<any[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [preImage, setPreImage] = useState<File | null>(null);
  const [postImage, setPostImage] = useState<File | null>(null);

  // Fetch claims from backend on mount
  useEffect(() => {
  const fetchClaims = async () => {
    try {
      const data = await claimsAPI.getAll();
      // Handle paginated or non-paginated
      const claimsList = Array.isArray(data) ? data : data.results || [];
      setClaims(claimsList);
      if (claimsList.length > 0) setSelectedClaim(claimsList[0]);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load claims", { description: err.message });
    }
  };
  fetchClaims();
}, []);

  const handleImageUpload = (type: "pre" | "post") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      type === "pre" ? setPreImage(file) : setPostImage(file);
    }
  };

  const handleAnalyze = async () => {
    if (!preImage || !postImage || !selectedClaim) return;

    try {
      const result = await damageAnalysisAPI.analyze(
        preImage,
        postImage,
        selectedClaim.location_name,
        selectedClaim.disaster_type
      );

      const damageScore = result.analysis.damage_percentage;

      toast.success("Damage analysis complete!", {
        description: `Detected damage score: ${damageScore.toFixed(2)}%`,
      });

      setSelectedClaim(prev =>
        prev ? { ...prev, damage_score: damageScore / 100 } : prev
      );
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to analyze damage", { description: err.message });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircle className="h-4 w-4 text-success" />;
      case "Rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Claims Management</h2>
        <p className="text-muted-foreground mt-1">Automated damage detection and claim processing</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 p-4">
          <h3 className="font-semibold mb-4">All Claims</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {claims.map(claim => (
              <button
                key={claim.claim_id}
                onClick={() => setSelectedClaim(claim)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedClaim?.claim_id === claim.claim_id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-sm">{claim.claim_id}</span>
                  {getStatusIcon(claim.claim_status)}
                </div>
                <p className="text-xs opacity-90">{claim.location_name}</p>
                <p className="text-xs opacity-75 mt-1">{claim.disaster_type}</p>
              </button>
            ))}
          </div>
        </Card>

        {selectedClaim && (
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">{selectedClaim.claim_id}</h3>
                <p className="text-sm text-muted-foreground">Policy: {selectedClaim.policy_id}</p>
              </div>
              <Badge
                variant={
                  selectedClaim.claim_status === "Approved" ? "default" :
                  selectedClaim.claim_status === "Rejected" ? "destructive" :
                  "secondary"
                }
                className="text-base px-4 py-1"
              >
                {selectedClaim.claim_status}
              </Badge>
            </div>

            {/* Claim info grid */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold mt-1">{selectedClaim.location_name}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Disaster Type</p>
                <p className="font-semibold mt-1">{selectedClaim.disaster_type}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Claim Amount</p>
                <p className="font-semibold mt-1 flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {selectedClaim.claim_amount_usd.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Damage Score</p>
                <p className="font-semibold mt-1">{(selectedClaim.damage_score * 100).toFixed(0)}%</p>
              </div>
            </div>

            {/* Image upload */}
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-4">Upload New Claim Images</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {["pre", "post"].map((type) => (
                  <div key={type}>
                    <label className="block text-sm font-medium mb-2">{type === "pre" ? "Pre-Disaster" : "Post-Disaster"} Image</label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload(type as "pre" | "post")}
                        className="hidden"
                        id={`${type}-image`}
                      />
                      <label htmlFor={`${type}-image`} className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {type === "pre" ? preImage?.name : postImage?.name || "Click to upload"}
                        </p>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className="w-full mt-4"
                onClick={handleAnalyze}
                disabled={!preImage || !postImage}
              >
                <FileText className="h-4 w-4 mr-2" />
                Analyze Damage with AI
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

