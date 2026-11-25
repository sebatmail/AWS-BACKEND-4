from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from django.views.generic.base import RedirectView
from . import views

router = DefaultRouter()
router.register(r'tutores', views.TutorViewSet, basename='api-tutor')
router.register(r'mascotas', views.MascotaViewSet, basename='api-mascota')
router.register(r'veterinarios', views.VeterinarioViewSet, basename='api-veterinario')
router.register(r'citas', views.CitaMedicaViewSet, basename='api-cita')
router.register(r'fichas', views.FichaClinicaViewSet, basename='api-ficha')
router.register(r'vacunas', views.VacunaRegistroViewSet, basename='api-vacuna')
router.register(r'recordatorios', views.RecordatorioPreventivoViewSet, basename='api-recordatorio')
router.register(r'pagos', views.PagoServicioViewSet, basename='api-pago')

urlpatterns = [
    # Autenticación JWT REST (Actividad 1 & 3 de la Evaluación 4)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # API RESTful DRF
    path('api/', include(router.urls)),

    # Redirección automática hacia la SPA Frontend React (http://32.202.76.247/)
    path('', RedirectView.as_view(url='http://32.202.76.247/', permanent=False), name='home'),
    path('dashboard/', RedirectView.as_view(url='http://32.202.76.247/', permanent=False), name='dashboard'),
    path('citas/', RedirectView.as_view(url='http://32.202.76.247/agenda', permanent=False), name='citas'),
    path('mascotas/', RedirectView.as_view(url='http://32.202.76.247/mascotas', permanent=False), name='mascotas'),
    path('tutores/', RedirectView.as_view(url='http://32.202.76.247/tutores', permanent=False), name='tutores'),
    path('fichas/', RedirectView.as_view(url='http://32.202.76.247/fichas', permanent=False), name='fichas'),
    path('pagos/', RedirectView.as_view(url='http://32.202.76.247/pagos', permanent=False), name='pagos'),
    path('recordatorios/', RedirectView.as_view(url='http://32.202.76.247/recordatorios', permanent=False), name='recordatorios'),
]
