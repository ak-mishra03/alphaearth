# api/management/commands/seed_data.py
import csv, gzip, io, requests, random, datetime
from django.core.management.base import BaseCommand
from api.models import RiskZone, Asset, InsuranceClaim, ParametricTrigger

NOAA_CSV_URL = "https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d1950_c20250520.csv.gz"

# Fallback city names if CSV fails
FALLBACK_CITIES = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL",
    "Houston, TX", "Miami, FL", "Seattle, WA",
    "Denver, CO", "Boston, MA", "Atlanta, GA",
]

OWNER_NAMES = ["Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Grace", "Hannah", "Ivy", "Jack"]

PARAMETERS = ["Temperature", "Rainfall", "Wind Speed", "Soil Moisture", "Sea Level"]

class Command(BaseCommand):
    help = "Seed database with RiskZones, Assets, InsuranceClaims, ParametricTriggers"

    def handle(self, *args, **kwargs):
        self.stdout.write("=== Clearing existing data ===")
        RiskZone.objects.all().delete()
        Asset.objects.all().delete()
        InsuranceClaim.objects.all().delete()
        ParametricTrigger.objects.all().delete()

        # --- Fetch NOAA CSV and extract unique cities ---
        try:
            r = requests.get(NOAA_CSV_URL)
            r.raise_for_status()
            self.stdout.write("Fetched NOAA CSV successfully.")
            with gzip.open(io.BytesIO(r.content), mode='rt') as f:
                reader = csv.DictReader(f)
                cities = set()
                for row in reader:
                    if row.get("STATE") and row.get("CZ_NAME"):
                        cities.add(f"{row['CZ_NAME']}, {row['STATE']}")
            cities = list(cities)
            if not cities:
                cities = FALLBACK_CITIES
        except Exception as e:
            self.stdout.write(f"⚠ Could not fetch NOAA CSV: {e}")
            cities = FALLBACK_CITIES

        # --- Seed RiskZones ---
        self.stdout.write("Seeding RiskZone data...")
        for loc in cities[:10]:  # limit to first 10 cities for demo
            RiskZone.objects.create(
                location_name=loc,
                latitude=random.uniform(-90, 90),
                longitude=random.uniform(-180, 180),
                flood_risk=random.random(),
                wildfire_risk=random.random(),
                storm_risk=random.random(),
                vegetation_dryness=random.random(),
                avg_temp_c=random.uniform(10, 35),
                risk_score=random.randint(0, 100)
            )
        self.stdout.write(f"Created {RiskZone.objects.count()} RiskZones")

        # --- Seed Assets ---
        self.stdout.write("Seeding Asset data...")
        for i in range(20):
            Asset.objects.create(
                asset_id=f"A{i:03d}",
                owner=random.choice(OWNER_NAMES),
                asset_type=random.choice([t[0] for t in Asset.ASSET_TYPES]),
                location_name=random.choice(cities),
                insured_value_usd=random.randint(50_000, 5_000_000),
                policy_start_date=datetime.date(2020, 1, 1),
                policy_end_date=datetime.date(2030, 1, 1),
                active=True
            )
        self.stdout.write(f"Created {Asset.objects.count()} Assets")

        # --- Seed InsuranceClaims from NOAA ---
        self.stdout.write("Seeding InsuranceClaims from NOAA data...")
        if cities != FALLBACK_CITIES:  # Only seed if CSV was fetched
            with gzip.open(io.BytesIO(r.content), mode='rt') as f:
                reader = csv.DictReader(f)
                assets = list(Asset.objects.all())
                claim_idx = 1
                for row in reader:
                    event_type = row.get("EVENT_TYPE", "").lower()
                    if "flood" in event_type:
                        disaster = "Flood"
                    elif "wildfire" in event_type or "fire" in event_type:
                        disaster = "Wildfire"
                    elif "storm" in event_type or "tornado" in event_type or "hurricane" in event_type:
                        disaster = "Storm"
                    else:
                        continue

                    if not row.get("STATE") or not row.get("CZ_NAME"):
                        continue

                    asset = random.choice(assets)

                    dmg = row.get("DAMAGE_PROPERTY", "0").replace("$", "").replace(",", "").upper()
                    if "K" in dmg:
                        dmg_val = float(dmg.replace("K", "")) * 1_000
                    elif "M" in dmg:
                        dmg_val = float(dmg.replace("M", "")) * 1_000_000
                    else:
                        try: dmg_val = float(dmg)
                        except: dmg_val = 0

                    try:
                        date_filed = datetime.datetime.strptime(row["BEGIN_DATE_TIME"], "%d-%b-%y %H:%M:%S").date()
                    except:
                        date_filed = datetime.date.today()

                    InsuranceClaim.objects.update_or_create(
                        claim_id=f"C{claim_idx:06d}",
                        defaults={
                            "policy_id": asset.asset_id,
                            "location_name": f"{row['CZ_NAME']}, {row['STATE']}",
                            "disaster_type": disaster,
                            "claim_amount_usd": dmg_val,
                            "damage_score": min(dmg_val / 1_000_000, 1.0),
                            "claim_status": random.choice(["Pending", "Under Review", "Approved", "Rejected"]),
                            "date_filed": date_filed,
                            "pre_image_url": "",
                            "post_image_url": "",
                        }
                    )
                    claim_idx += 1
            self.stdout.write(f"Seeded {InsuranceClaim.objects.count()} InsuranceClaims from NOAA CSV")
        else:
            self.stdout.write("⚠ Skipped InsuranceClaims: NOAA CSV not available")

        # --- Seed ParametricTriggers ---
        self.stdout.write("Seeding ParametricTriggers...")
        for i in range(5):
            ParametricTrigger.objects.create(
                trigger_id=f"T{i:03d}",
                parameter=random.choice(PARAMETERS),
                threshold=random.random(),
                current_value=random.random(),
                location_name=random.choice(cities),
                date_checked=datetime.date.today()
            )
        self.stdout.write(f"Created {ParametricTrigger.objects.count()} ParametricTriggers")

        self.stdout.write("✅ Database seeding completed successfully!")

