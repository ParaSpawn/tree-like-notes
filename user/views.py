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
        root = Content.objects.create(user = new_user, content='ROOT', toggled=True)
        first_node = Content.objects.create(user = new_user, content="Shortcut information on top-right", toggled=False, parent=root)
        instruction_node = Content.objects.create(user = new_user, content="Instructions", toggled=True, parent=root)
        instruction1 = Content.objects.create(user = new_user, content="Move around with 'arrow keys'", toggled=False, parent=instruction_node)
        instruction2 = Content.objects.create(user = new_user, content="Move nodes around with 'alt + arrow keys'", toggled=False, parent=instruction_node)
        instruction3 = Content.objects.create(user = new_user, content="Toggle nodes with 't', delete nodes with 'del', create nodes with 'n' and 'alt + n'", toggled=False, parent=instruction_node)
        instruction4 = Content.objects.create(user = new_user, content="Push and pop nodes with 'p' and 'o'", toggled=False, parent=instruction_node)
        instruction5 = Content.objects.create(user = new_user, content="Edit nodes with 'enter', stop editing with 'esc'", toggled=False, parent=instruction_node)
        instruction_node.children += [instruction1.id, instruction2.id, instruction3.id, instruction4.id, instruction5.id]
        root.children += [first_node.id, instruction_node.id]
        for e in [root, instruction1, instruction2, instruction3, instruction4, instruction_node, first_node, instruction5]:
            e.save()
        return new_user

class CreateUserView(CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer