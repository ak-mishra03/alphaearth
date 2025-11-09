export const riskZones = [
  {
    id: 1,
    location_name: "Miami, FL",
    latitude: 25.7617,
    longitude: -80.1918,
    flood_risk: 0.9,
    wildfire_risk: 0.1,
    storm_risk: 0.8,
    vegetation_dryness: 0.3,
    avg_temp_c: 30,
    sea_level_rise_m: 0.45,
    historical_events: 14,
    risk_score: 87
  },
  {
    id: 2,
    location_name: "Los Angeles, CA",
    latitude: 34.0522,
    longitude: -118.2437,
    flood_risk: 0.3,
    wildfire_risk: 0.7,
    storm_risk: 0.2,
    vegetation_dryness: 0.8,
    avg_temp_c: 29,
    sea_level_rise_m: 0.12,
    historical_events: 10,
    risk_score: 74
  },
  {
    id: 3,
    location_name: "Houston, TX",
    latitude: 29.7604,
    longitude: -95.3698,
    flood_risk: 0.8,
    wildfire_risk: 0.2,
    storm_risk: 0.6,
    vegetation_dryness: 0.4,
    avg_temp_c: 31,
    sea_level_rise_m: 0.36,
    historical_events: 17,
    risk_score: 82
  },
  {
    id: 4,
    location_name: "New York, NY",
    latitude: 40.7128,
    longitude: -74.006,
    flood_risk: 0.2,
    wildfire_risk: 0.1,
    storm_risk: 0.4,
    vegetation_dryness: 0.3,
    avg_temp_c: 20,
    sea_level_rise_m: 0.25,
    historical_events: 8,
    risk_score: 45
  },
  {
    id: 5,
    location_name: "Denver, CO",
    latitude: 39.7392,
    longitude: -104.9903,
    flood_risk: 0.1,
    wildfire_risk: 0.3,
    storm_risk: 0.2,
    vegetation_dryness: 0.5,
    avg_temp_c: 15,
    sea_level_rise_m: 0.0,
    historical_events: 5,
    risk_score: 40
  },
  {
    id: 6,
    location_name: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    flood_risk: 0.4,
    wildfire_risk: 0.5,
    storm_risk: 0.3,
    vegetation_dryness: 0.6,
    avg_temp_c: 18,
    sea_level_rise_m: 0.22,
    historical_events: 9,
    risk_score: 68
  }
];

export const insuranceClaims = [
  {
    claim_id: "C1001",
    policy_id: "P5001",
    location_name: "Miami, FL",
    disaster_type: "Flood",
    pre_image_url: "/images/miami_before.png",
    post_image_url: "/images/miami_after.png",
    damage_score: 0.85,
    claim_amount_usd: 125000,
    claim_status: "Approved",
    auto_approved: true,
    date_filed: "2025-10-21"
  },
  {
    claim_id: "C1002",
    policy_id: "P5002",
    location_name: "Los Angeles, CA",
    disaster_type: "Wildfire",
    pre_image_url: "/images/la_before.png",
    post_image_url: "/images/la_after.png",
    damage_score: 0.75,
    claim_amount_usd: 97000,
    claim_status: "Pending",
    auto_approved: false,
    date_filed: "2025-09-15"
  },
  {
    claim_id: "C1003",
    policy_id: "P5003",
    location_name: "Houston, TX",
    disaster_type: "Storm",
    pre_image_url: "/images/houston_before.png",
    post_image_url: "/images/houston_after.png",
    damage_score: 0.90,
    claim_amount_usd: 155000,
    claim_status: "Approved",
    auto_approved: true,
    date_filed: "2025-08-10"
  },
  {
    claim_id: "C1004",
    policy_id: "P5004",
    location_name: "New York, NY",
    disaster_type: "Flood",
    pre_image_url: "/images/ny_before.png",
    post_image_url: "/images/ny_after.png",
    damage_score: 0.40,
    claim_amount_usd: 45000,
    claim_status: "Rejected",
    auto_approved: false,
    date_filed: "2025-07-05"
  },
  {
    claim_id: "C1005",
    policy_id: "P5005",
    location_name: "San Francisco, CA",
    disaster_type: "Wildfire",
    pre_image_url: "/images/sf_before.png",
    post_image_url: "/images/sf_after.png",
    damage_score: 0.65,
    claim_amount_usd: 83000,
    claim_status: "Under Review",
    auto_approved: false,
    date_filed: "2025-11-02"
  }
];

export const parametricTriggers = [
  {
    trigger_id: "T01",
    parameter: "Wind Speed (km/h)",
    threshold: 150,
    current_value: 160,
    triggered: true,
    location_name: "Houston, TX",
    date_checked: "2025-11-08"
  },
  {
    trigger_id: "T02",
    parameter: "Rainfall (mm)",
    threshold: 200,
    current_value: 190,
    triggered: false,
    location_name: "Los Angeles, CA",
    date_checked: "2025-11-08"
  },
  {
    trigger_id: "T03",
    parameter: "River Level (m)",
    threshold: 5,
    current_value: 5.5,
    triggered: true,
    location_name: "Miami, FL",
    date_checked: "2025-11-08"
  },
  {
    trigger_id: "T04",
    parameter: "Air Quality Index",
    threshold: 180,
    current_value: 200,
    triggered: true,
    location_name: "San Francisco, CA",
    date_checked: "2025-11-08"
  }
];

export const assetsInsured = [
  {
    asset_id: "A1001",
    owner: "James Rodriguez",
    type: "Residential Property",
    location_name: "Miami, FL",
    insured_value_usd: 200000,
    policy_start_date: "2025-01-15",
    policy_end_date: "2026-01-15",
    active: true
  },
  {
    asset_id: "A1002",
    owner: "Olivia Smith",
    type: "Commercial Building",
    location_name: "Houston, TX",
    insured_value_usd: 500000,
    policy_start_date: "2024-06-01",
    policy_end_date: "2025-06-01",
    active: false
  },
  {
    asset_id: "A1003",
    owner: "David Chen",
    type: "Farm Land",
    location_name: "Denver, CO",
    insured_value_usd: 350000,
    policy_start_date: "2025-04-10",
    policy_end_date: "2026-04-10",
    active: true
  }
];

export const aiModelInsights = [
  {
    model_name: "AlphaEarth Flood Detector v1",
    accuracy: 0.93,
    last_trained: "2025-09-01",
    data_sources: [
      "NASA MODIS Flood Imagery",
      "FEMA Flood Hazard Maps",
      "Google Earth Engine Elevation Data"
    ],
    description: "CNN-based flood region segmentation using pre- and post-event satellite imagery."
  },
  {
    model_name: "Wildfire Burn Area Classifier",
    accuracy: 0.88,
    last_trained: "2025-08-15",
    data_sources: [
      "Sentinel-2 NDVI Data",
      "MODIS Thermal Anomaly Detections"
    ],
    description: "Uses vegetation index drop and thermal hotspots to detect wildfire damage zones."
  }
];
