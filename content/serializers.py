from rest_framework import serializers
from .models import Content

class ContentSerializer(serializers.ModelSerializer):
    next_node = serializers.PrimaryKeyRelatedField(many=False, read_only=True)

    class Meta:
        model = Content
        exclude = ['user']