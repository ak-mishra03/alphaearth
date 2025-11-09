from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class RiskZone(models.Model):
    """Risk assessment for geographical locations"""
    location_name = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    flood_risk = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    wildfire_risk = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    storm_risk = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    vegetation_dryness = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    avg_temp_c = models.FloatField()
    sea_level_rise_m = models.FloatField(default=0.0)
    historical_events = models.IntegerField(default=0)
    risk_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-risk_score']
        verbose_name = 'Risk Zone'
        verbose_name_plural = 'Risk Zones'

    def __str__(self):
        return f"{self.location_name} (Risk: {self.risk_score})"


class InsuranceClaim(models.Model):
    """Insurance claims with damage assessment"""
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    DISASTER_TYPES = [
        ('Flood', 'Flood'),
        ('Wildfire', 'Wildfire'),
        ('Storm', 'Storm'),
        ('Earthquake', 'Earthquake'),
        ('Drought', 'Drought'),
    ]
    
    claim_id = models.CharField(max_length=50, unique=True)
    policy_id = models.CharField(max_length=50)
    location_name = models.CharField(max_length=200)
    disaster_type = models.CharField(max_length=50, choices=DISASTER_TYPES)
    pre_image = models.ImageField(upload_to='claims/pre/', null=True, blank=True)
    post_image = models.ImageField(upload_to='claims/post/', null=True, blank=True)
    pre_image_url = models.URLField(null=True, blank=True)
    post_image_url = models.URLField(null=True, blank=True)
    damage_score = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    claim_amount_usd = models.DecimalField(max_digits=12, decimal_places=2)
    claim_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    auto_approved = models.BooleanField(default=False)
    date_filed = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_filed']
        verbose_name = 'Insurance Claim'
        verbose_name_plural = 'Insurance Claims'

    def __str__(self):
        return f"{self.claim_id} - {self.location_name}"


class ParametricTrigger(models.Model):
    """Parametric insurance triggers based on real-time data"""
    
    trigger_id = models.CharField(max_length=50, unique=True)
    parameter = models.CharField(max_length=100)
    threshold = models.FloatField()
    current_value = models.FloatField()
    triggered = models.BooleanField(default=False)
    location_name = models.CharField(max_length=200)
    date_checked = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_checked']
        verbose_name = 'Parametric Trigger'
        verbose_name_plural = 'Parametric Triggers'

    def __str__(self):
        return f"{self.trigger_id} - {self.parameter}"
    
    def save(self, *args, **kwargs):
        # Auto-set triggered status based on threshold
        self.triggered = self.current_value >= self.threshold
        super().save(*args, **kwargs)


class Asset(models.Model):
    """Insured assets tracking"""
    
    ASSET_TYPES = [
        ('Residential Property', 'Residential Property'),
        ('Commercial Building', 'Commercial Building'),
        ('Farm Land', 'Farm Land'),
        ('Industrial Facility', 'Industrial Facility'),
        ('Port', 'Port'),
    ]
    
    asset_id = models.CharField(max_length=50, unique=True)
    owner = models.CharField(max_length=200)
    asset_type = models.CharField(max_length=100, choices=ASSET_TYPES)
    location_name = models.CharField(max_length=200)
    insured_value_usd = models.DecimalField(max_digits=12, decimal_places=2)
    policy_start_date = models.DateField()
    policy_end_date = models.DateField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-insured_value_usd']
        verbose_name = 'Asset'
        verbose_name_plural = 'Assets'

    def __str__(self):
        return f"{self.asset_id} - {self.owner}"


class AIModelInsight(models.Model):
    """AI model performance tracking"""
    
    model_name = models.CharField(max_length=200)
    accuracy = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    last_trained = models.DateField()
    data_sources = models.JSONField(default=list)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_trained']
        verbose_name = 'AI Model Insight'
        verbose_name_plural = 'AI Model Insights'

    def __str__(self):
        return f"{self.model_name} (Accuracy: {self.accuracy:.2%})"


class DamageAnalysis(models.Model):
    """Damage analysis results from satellite imagery"""
    
    claim = models.ForeignKey(InsuranceClaim, on_delete=models.CASCADE, related_name='analyses')
    analysis_date = models.DateTimeField(auto_now_add=True)
    damage_percentage = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    affected_area_sqm = models.FloatField(null=True, blank=True)
    confidence_score = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    ai_model_used = models.CharField(max_length=200)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-analysis_date']
        verbose_name = 'Damage Analysis'
        verbose_name_plural = 'Damage Analyses'

    def __str__(self):
        return f"Analysis for {self.claim.claim_id} - {self.damage_percentage}%"
