from django.urls import path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import (CreateUserView, MyTokenObtainPairView)

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', CreateUserView.as_view(), name='register')
]