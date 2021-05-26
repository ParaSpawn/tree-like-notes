from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.serializers import ModelSerializer
from rest_framework import authentication, permissions
from rest_framework.generics import CreateAPIView
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from content.models import Content

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password')

    def create(self, validated_data):
        new_user = User.objects.create(username=validated_data['username'], password=make_password(validated_data['password']))
        new_user.save()
        root = Content.objects.create(user = new_user, content='ROOT', toggled=True, children=[])
        root.save()
        first_node = Content.objects.create(user = new_user, content="", toggled=False, parent=root, children=[])
        first_node.save()
        root.children.append(first_node.id)
        root.save()
        return new_user

class CreateUserView(CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer