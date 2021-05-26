from decimal import getcontext
from django.urls import path
from .views import (get_content, create_node, create_child_node, update_node, delete_node, move_node)

urlpatterns = [
    path('retrieve/', get_content, name='get_content'),
    path('create/', create_node, name='create_node'),
    path('create_child/', create_child_node, name='create_child_node'),
    path('update/', update_node, name='update_node'),
    path('delete/', delete_node, name='delete_node'),
    path('move/', move_node, name='move_node')
]