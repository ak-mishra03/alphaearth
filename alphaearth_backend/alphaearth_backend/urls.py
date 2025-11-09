"""
URL Configuration for AlphaEarth Insurance API
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api.views import (
    RiskZoneViewSet, InsuranceClaimViewSet, ParametricTriggerViewSet,
    AssetViewSet, AIModelInsightViewSet, DashboardStatsView,
    DamageAnalysisView, RiskAssessmentView
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'risk-zones', RiskZoneViewSet, basename='riskzone')
router.register(r'claims', InsuranceClaimViewSet, basename='claim')
router.register(r'triggers', ParametricTriggerViewSet, basename='trigger')
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'ai-models', AIModelInsightViewSet, basename='aimodel')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Router
    path('api/', include(router.urls)),
    
    # Custom API endpoints
    path('api/dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('api/damage-analysis/', DamageAnalysisView.as_view(), name='damage-analysis'),
    path('api/risk-assessment/', RiskAssessmentView.as_view(), name='risk-assessment'),
    
    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # DRF Auth (for browsable API)
    path('api-auth/', include('rest_framework.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
