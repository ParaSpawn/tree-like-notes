from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres import fields

class Content(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, related_name='child')
    content = models.TextField(null=True, default='')
    toggled = models.BooleanField(default=False)
    children = fields.ArrayField(models.IntegerField(primary_key=True), default=list)