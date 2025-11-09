from django.contrib import admin
from .models import (
    RiskZone, InsuranceClaim, ParametricTrigger,
    Asset, AIModelInsight, DamageAnalysis
)


@admin.register(RiskZone)
class RiskZoneAdmin(admin.ModelAdmin):
    list_display = ['location_name', 'risk_score', 'flood_risk', 'wildfire_risk', 'storm_risk', 'updated_at']
    list_filter = ['risk_score']
    search_fields = ['location_name']
    ordering = ['-risk_score']
    readonly_fields = ['created_at', 'updated_at']


class DamageAnalysisInline(admin.TabularInline):
    model = DamageAnalysis
    extra = 0
    readonly_fields = ['analysis_date']


@admin.register(InsuranceClaim)
class InsuranceClaimAdmin(admin.ModelAdmin):
    list_display = ['claim_id', 'location_name', 'disaster_type', 'claim_status', 'auto_approved', 'claim_amount_usd', 'date_filed']
    list_filter = ['claim_status', 'disaster_type', 'auto_approved']
    search_fields = ['claim_id', 'policy_id', 'location_name']
    ordering = ['-date_filed']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [DamageAnalysisInline]
    
    fieldsets = (
        ('Claim Information', {
            'fields': ('claim_id', 'policy_id', 'location_name', 'disaster_type')
        }),
        ('Images', {
            'fields': ('pre_image', 'post_image', 'pre_image_url', 'post_image_url')
        }),
        ('Assessment', {
            'fields': ('damage_score', 'claim_amount_usd', 'claim_status', 'auto_approved')
        }),
        ('Dates', {
            'fields': ('date_filed', 'created_at', 'updated_at')
        }),
    )


@admin.register(ParametricTrigger)
class ParametricTriggerAdmin(admin.ModelAdmin):
    list_display = ['trigger_id', 'parameter', 'location_name', 'current_value', 'threshold', 'triggered', 'date_checked']
    list_filter = ['triggered', 'parameter']
    search_fields = ['trigger_id', 'location_name', 'parameter']
    ordering = ['-date_checked']
    readonly_fields = ['triggered', 'created_at', 'updated_at']


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ['asset_id', 'owner', 'asset_type', 'location_name', 'insured_value_usd', 'active']
    list_filter = ['active', 'asset_type']
    search_fields = ['asset_id', 'owner', 'location_name']
    ordering = ['-insured_value_usd']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AIModelInsight)
class AIModelInsightAdmin(admin.ModelAdmin):
    list_display = ['model_name', 'accuracy', 'last_trained', 'updated_at']
    search_fields = ['model_name']
    ordering = ['-last_trained']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(DamageAnalysis)
class DamageAnalysisAdmin(admin.ModelAdmin):
    list_display = ['claim', 'damage_percentage', 'confidence_score', 'ai_model_used', 'analysis_date']
    list_filter = ['ai_model_used']
    search_fields = ['claim__claim_id']
    ordering = ['-analysis_date']
    readonly_fields = ['analysis_date']
