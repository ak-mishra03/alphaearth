from rest_framework import serializers
from .models import (
    RiskZone, InsuranceClaim, ParametricTrigger, 
    Asset, AIModelInsight, DamageAnalysis
)


class RiskZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskZone
        fields = [
            'id', 'location_name', 'latitude', 'longitude',
            'flood_risk', 'wildfire_risk', 'storm_risk',
            'vegetation_dryness', 'avg_temp_c', 'sea_level_rise_m',
            'historical_events', 'risk_score', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class DamageAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = DamageAnalysis
        fields = [
            'id', 'claim', 'analysis_date', 'damage_percentage',
            'affected_area_sqm', 'confidence_score', 'ai_model_used', 'notes'
        ]
        read_only_fields = ['analysis_date']


class InsuranceClaimSerializer(serializers.ModelSerializer):
    analyses = DamageAnalysisSerializer(many=True, read_only=True)
    
    class Meta:
        model = InsuranceClaim
        fields = [
            'id', 'claim_id', 'policy_id', 'location_name',
            'disaster_type', 'pre_image', 'post_image',
            'pre_image_url', 'post_image_url', 'damage_score',
            'claim_amount_usd', 'claim_status', 'auto_approved',
            'date_filed', 'analyses', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class InsuranceClaimCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new claims with image upload"""
    
    class Meta:
        model = InsuranceClaim
        fields = [
            'claim_id', 'policy_id', 'location_name',
            'disaster_type', 'pre_image', 'post_image',
            'damage_score', 'claim_amount_usd', 'claim_status',
            'auto_approved', 'date_filed'
        ]
    
    def create(self, validated_data):
        # Auto-approve if damage score is above threshold
        if validated_data.get('damage_score', 0) >= 0.7:
            validated_data['auto_approved'] = True
            validated_data['claim_status'] = 'Approved'
        
        return super().create(validated_data)


class ParametricTriggerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParametricTrigger
        fields = [
            'id', 'trigger_id', 'parameter', 'threshold',
            'current_value', 'triggered', 'location_name',
            'date_checked', 'created_at', 'updated_at'
        ]
        read_only_fields = ['triggered', 'created_at', 'updated_at']


class AssetSerializer(serializers.ModelSerializer):
    risk_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Asset
        fields = [
            'id', 'asset_id', 'owner', 'asset_type',
            'location_name', 'insured_value_usd',
            'policy_start_date', 'policy_end_date',
            'active', 'risk_score', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_risk_score(self, obj):
        """Get risk score for the asset's location"""
        try:
            risk_zone = RiskZone.objects.filter(location_name=obj.location_name).first()
            return risk_zone.risk_score if risk_zone else None
        except:
            return None


class AIModelInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModelInsight
        fields = [
            'id', 'model_name', 'accuracy', 'last_trained',
            'data_sources', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_locations = serializers.IntegerField()
    active_claims = serializers.IntegerField()
    approved_claims = serializers.IntegerField()
    pending_claims = serializers.IntegerField()
    total_claim_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    active_triggers = serializers.IntegerField()
    high_risk_zones = serializers.IntegerField()
    medium_risk_zones = serializers.IntegerField()
    low_risk_zones = serializers.IntegerField()


class ImageUploadSerializer(serializers.Serializer):
    """Serializer for image upload and damage analysis"""
    pre_image = serializers.ImageField(required=True)
    post_image = serializers.ImageField(required=True)
    location_name = serializers.CharField(max_length=200, required=True)
    disaster_type = serializers.ChoiceField(
        choices=InsuranceClaim.DISASTER_TYPES,
        required=True
    )
