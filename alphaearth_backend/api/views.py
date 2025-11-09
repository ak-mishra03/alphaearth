from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Q
from django_filters.rest_framework import DjangoFilterBackend
import random
from datetime import date
from datetime import date
from PIL import Image
import numpy as np 
import cv2
from decimal import Decimal 
import io 
import torch
from ultralytics import YOLO
from skimage.metrics import structural_similarity as ssim


from .models import (
        RiskZone, InsuranceClaim, ParametricTrigger,
        Asset, AIModelInsight, DamageAnalysis
        )
from .serializers import (
        RiskZoneSerializer, InsuranceClaimSerializer,
        InsuranceClaimCreateSerializer, ParametricTriggerSerializer,
        AssetSerializer, AIModelInsightSerializer,
        DashboardStatsSerializer, ImageUploadSerializer,
        DamageAnalysisSerializer
        )


class RiskZoneViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Risk Zones

    list: Get all risk zones
    retrieve: Get a specific risk zone
    create: Create a new risk zone
    update: Update a risk zone
    partial_update: Partially update a risk zone
    destroy: Delete a risk zone
    """
    queryset = RiskZone.objects.all()
    serializer_class = RiskZoneSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['location_name', 'risk_score']
    search_fields = ['location_name']
    ordering_fields = ['risk_score', 'location_name']

    @action(detail=False, methods=['get'])
    def high_risk(self, request):
        """Get all high-risk zones (score >= 70)"""
        high_risk_zones = self.queryset.filter(risk_score__gte=70)
        serializer = self.get_serializer(high_risk_zones, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """Search risk zones by location name"""
        location = request.query_params.get('location', '')
        zones = self.queryset.filter(location_name__icontains=location)
        serializer = self.get_serializer(zones, many=True)
        return Response(serializer.data)


class InsuranceClaimViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Insurance Claims

    list: Get all insurance claims
    retrieve: Get a specific claim
    create: Create a new claim
    update: Update a claim
    partial_update: Partially update a claim
    destroy: Delete a claim
    """
    queryset = InsuranceClaim.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['claim_status', 'disaster_type', 'location_name', 'auto_approved']
    search_fields = ['claim_id', 'policy_id', 'location_name']
    ordering_fields = ['date_filed', 'claim_amount_usd', 'damage_score']

    def get_serializer_class(self):
        if self.action == 'create':
            return InsuranceClaimCreateSerializer
        return InsuranceClaimSerializer

    @action(detail=False, methods=['get'])
    def approved(self, request):
        """Get all approved claims"""
        approved_claims = self.queryset.filter(claim_status='Approved')
        serializer = self.get_serializer(approved_claims, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending claims"""
        pending_claims = self.queryset.filter(
                Q(claim_status='Pending') | Q(claim_status='Under Review')
                )
        serializer = self.get_serializer(pending_claims, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a claim"""
        claim = self.get_object()
        claim.claim_status = 'Approved'
        claim.save()
        serializer = self.get_serializer(claim)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a claim"""
        claim = self.get_object()
        claim.claim_status = 'Rejected'
        claim.save()
        serializer = self.get_serializer(claim)
        return Response(serializer.data)


class ParametricTriggerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Parametric Triggers

    list: Get all parametric triggers
    retrieve: Get a specific trigger
    create: Create a new trigger
    update: Update a trigger
    partial_update: Partially update a trigger
    destroy: Delete a trigger
    """
    queryset = ParametricTrigger.objects.all()
    serializer_class = ParametricTriggerSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['triggered', 'location_name', 'parameter']
    search_fields = ['trigger_id', 'location_name', 'parameter']
    ordering_fields = ['date_checked', 'current_value']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active (triggered) triggers"""
        active_triggers = self.queryset.filter(triggered=True)
        serializer = self.get_serializer(active_triggers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """Get triggers for a specific location"""
        location = request.query_params.get('location', '')
        triggers = self.queryset.filter(location_name__icontains=location)
        serializer = self.get_serializer(triggers, many=True)
        return Response(serializer.data)


class AssetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Assets

    list: Get all assets
    retrieve: Get a specific asset
    create: Create a new asset
    update: Update an asset
    partial_update: Partially update an asset
    destroy: Delete an asset
    """
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['active', 'asset_type', 'location_name']
    search_fields = ['asset_id', 'owner', 'location_name']
    ordering_fields = ['insured_value_usd', 'policy_start_date']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active assets"""
        active_assets = self.queryset.filter(active=True)
        serializer = self.get_serializer(active_assets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """Get assets for a specific location"""
        location = request.query_params.get('location', '')
        assets = self.queryset.filter(location_name__icontains=location)
        serializer = self.get_serializer(assets, many=True)
        return Response(serializer.data)


class AIModelInsightViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AI Model Insights

    list: Get all AI model insights
    retrieve: Get a specific model insight
    create: Create a new model insight
    update: Update a model insight
    partial_update: Partially update a model insight
    destroy: Delete a model insight
    """
    queryset = AIModelInsight.objects.all()
    serializer_class = AIModelInsightSerializer
    filter_backends = [DjangoFilterBackend]
    search_fields = ['model_name']
    ordering_fields = ['accuracy', 'last_trained']


class DashboardStatsView(APIView):
    """
    Get dashboard statistics

    GET /api/dashboard-stats/
    Returns aggregated statistics for the dashboard
    """

    def get(self, request):
        total_locations = RiskZone.objects.count()
        active_claims = InsuranceClaim.objects.count()
        approved_claims = InsuranceClaim.objects.filter(claim_status='Approved').count()
        pending_claims = InsuranceClaim.objects.filter(
                Q(claim_status='Pending') | Q(claim_status='Under Review')
                ).count()

        total_claim_amount = InsuranceClaim.objects.aggregate(
                total=Sum('claim_amount_usd')
                )['total'] or 0

        active_triggers = ParametricTrigger.objects.filter(triggered=True).count()
        high_risk_zones = RiskZone.objects.filter(risk_score__gte=70).count()
        medium_risk_zones = RiskZone.objects.filter(
                risk_score__gte=50, risk_score__lt=70
                ).count()
        low_risk_zones = RiskZone.objects.filter(risk_score__lt=50).count()

        data = {
                'total_locations': total_locations,
                'active_claims': active_claims,
                'approved_claims': approved_claims,
                'pending_claims': pending_claims,
                'total_claim_amount': total_claim_amount,
                'active_triggers': active_triggers,
                'high_risk_zones': high_risk_zones,
                'medium_risk_zones': medium_risk_zones,
                'low_risk_zones': low_risk_zones,
                }

        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)

# Predefined disaster severity factor
DISASTER_SEVERITY = {
    "flood": 0.7,
    "wildfire": 0.8,
    "storm": 0.6,
    "earthquake": 0.9,
}

device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = YOLO("yolov8m.pt").to(device)


def get_disaster_score(disaster_type):
    return DISASTER_SEVERITY.get(disaster_type.lower(), 0.5)


def load_image_as_array(uploaded_file):
    uploaded_file.seek(0)
    img_bytes = np.frombuffer(uploaded_file.read(), np.uint8)
    img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)
    uploaded_file.seek(0)
    return img


def analyze_image_objects_yolo(image_file):
    img = load_image_as_array(image_file)
    if img is None:
        return {}

    results = model.predict(img, save=False, verbose=False, device=device)
    objects = {}

    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            class_name = model.names[cls_id]
            score = float(box.conf[0])
            objects[class_name] = max(objects.get(class_name, 0), score)

    return objects

def compute_damage_score(pre_image, post_image):
    """
    Compute damage score using YOLO object detection.
    Returns float in [0,1] (1=max damage).
    """
    pre_objects = analyze_image_objects_yolo(pre_image)
    post_objects = analyze_image_objects_yolo(post_image)

    # If both images have no detected objects, fallback to SSIM
    if not pre_objects and not post_objects:
        pre_image.seek(0)
        post_image.seek(0)
        pre_bytes = np.frombuffer(pre_image.read(), np.uint8)
        post_bytes = np.frombuffer(post_image.read(), np.uint8)
        pre_gray = cv2.imdecode(pre_bytes, cv2.IMREAD_GRAYSCALE)
        post_gray = cv2.imdecode(post_bytes, cv2.IMREAD_GRAYSCALE)

        # Resize to smallest shape
        h = min(pre_gray.shape[0], post_gray.shape[0])
        w = min(pre_gray.shape[1], post_gray.shape[1])
        pre_gray = cv2.resize(pre_gray, (w, h))
        post_gray = cv2.resize(post_gray, (w, h))

        ssim_score, _ = ssim(pre_gray, post_gray, full=True)
        return round(1 - ssim_score, 2)

    # Compare objects by presence only (ignore confidence)
    all_objects = set(pre_objects.keys()) | set(post_objects.keys())
    changes = 0
    for obj in all_objects:
        if (obj in pre_objects) != (obj in post_objects):
            changes += 1

    if not all_objects:
        return 0  # no objects detected in either image → no damage

    damage_score = changes / len(all_objects)
    return min(max(damage_score, 0), 1)

class DamageAnalysisView(APIView):
    """
    Analyze damage from uploaded images using YOLOv8 Object Comparator v1.0
    POST /api/damage-analysis/
    """
    def post(self, request):
        serializer = ImageUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        # Extract optional location metadata
        vegetation_dryness = data.get('vegetation_dryness', 0.5)
        sea_level_rise_m = data.get('sea_level_rise_m', 0.0)
        historical_events = data.get('historical_events', 0)

        # Compute damage score using Vision API
        image_damage_score = compute_damage_score(data['pre_image'], data['post_image'])
        disaster_score = get_disaster_score(data['disaster_type'])
        location_score = min(vegetation_dryness + sea_level_rise_m/5 + historical_events/10, 3)/3

        # Weighted combination
        damage_score = 0.5*image_damage_score + 0.3*disaster_score + 0.2*location_score

        # Estimate affected area (max 5000 sqm)
        affected_area = damage_score * 5000
        confidence = 0.9  # fixed high-confidence for deterministic scoring

        # Generate IDs
        claim_count = InsuranceClaim.objects.count()
        claim_id = f"C{1000 + claim_count + 1}"
        policy_id = f"P{5000 + claim_count + 1}"

        # Save InsuranceClaim
        claim = InsuranceClaim.objects.create(
            claim_id=claim_id,
            policy_id=policy_id,
            location_name=data['location_name'],
            disaster_type=data['disaster_type'],
            pre_image=data['pre_image'],
            post_image=data['post_image'],
            damage_score=float(damage_score),
            claim_amount_usd=Decimal(affected_area*100),
            claim_status='Approved' if damage_score >= 0.7 else 'Under Review',
            auto_approved=damage_score >= 0.7,
            date_filed=date.today()
        )

        # Save DamageAnalysis
        analysis = DamageAnalysis.objects.create(
            claim=claim,
            damage_percentage=Decimal(damage_score*100),
            affected_area_sqm=Decimal(affected_area),
            confidence_score=Decimal(confidence),
            ai_model_used='Google Vision Object Comparator v1.0',
            notes=f'Automated analysis using Vision API. Confidence: {confidence:.2%}'
        )

        return Response({
            'claim': InsuranceClaimSerializer(claim).data,
            'analysis': DamageAnalysisSerializer(analysis).data,
            'message': 'Damage analysis completed successfully'
        }, status=status.HTTP_201_CREATED)

class RiskAssessmentView(APIView):
    """
       """

    def post(self, request):
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        location_name = request.data.get('location_name', 'Unknown Location')

        if not latitude or not longitude:
            return Response(
                    {'error': 'Latitude and longitude are required'},
                    status=status.HTTP_400_BAD_REQUEST
                    )

        # Check if location already exists
        existing = RiskZone.objects.filter(
                location_name=location_name
                ).first()

        if existing:
            serializer = RiskZoneSerializer(existing)
            return Response(serializer.data)

        # Simulate risk calculation (in production, use real AI models)
        flood_risk = round(random.uniform(0.1, 0.9), 2)
        wildfire_risk = round(random.uniform(0.1, 0.9), 2)
        storm_risk = round(random.uniform(0.1, 0.9), 2)
        vegetation_dryness = round(random.uniform(0.1, 0.9), 2)

        risk_score = int((flood_risk + wildfire_risk + storm_risk) * 100 / 3)

        risk_zone = RiskZone.objects.create(
                location_name=location_name,
                latitude=float(latitude),
                longitude=float(longitude),
                flood_risk=flood_risk,
                wildfire_risk=wildfire_risk,
                storm_risk=storm_risk,
                vegetation_dryness=vegetation_dryness,
                avg_temp_c=round(random.uniform(15, 35), 1),
                sea_level_rise_m=round(random.uniform(0.0, 0.5), 2),
                historical_events=random.randint(0, 20),
                risk_score=risk_score
                )

        serializer = RiskZoneSerializer(risk_zone)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
