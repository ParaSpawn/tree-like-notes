from getpass import getuser
from multiprocessing.dummy import current_process
from xxlimited import Null
from .models import Content
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from content.serializers import ContentSerializer
from django.contrib.auth.models import User
import queue


def get_user(username):
    return User.objects.get(username=username)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_content(request):
    parent = int(request.GET['parent'])
    res = {}
    user = get_user(request.user)
    if parent == -1:
        root_node = Content.objects.get(user=user, parent__isnull=True)
    else:
        print(parent)
        root_node = Content.objects.get(user=user, id=parent)
    res['root'] = root_node.id
    node_queue = queue.Queue()
    node_queue.put(root_node.id)
    while not node_queue.empty():
        node_id = node_queue.get()
        node = Content.objects.get(user=user, id=node_id)
        res[node_id] = ContentSerializer(node).data
        if node.toggled:
            for e in node.children:
                node_queue.put(e)
    return Response(res)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_node(request):
    user = get_user(request.user)
    parent_node = Content.objects.get(user=user, id=request.data['parent'])
    new_node = Content.objects.create(user=user, parent=parent_node)
    new_node.save()
    index = parent_node.children.index(request.data['id'])
    parent_node.children.insert(index + 1, new_node.id)
    parent_node.save()
    return Response({
        parent_node.id: ContentSerializer(parent_node).data,
        new_node.id: ContentSerializer(new_node).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_child_node(request):
    user = get_user(request.user)
    parent_node = Content.objects.get(user=user, id=request.data['parent'])
    new_node = Content.objects.create(user=user, parent=parent_node)
    new_node.save()
    parent_node.children.append(new_node.id)
    parent_node.save()
    return Response({
        parent_node.id: ContentSerializer(parent_node).data,
        new_node.id: ContentSerializer(new_node).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_node(request):
    user = get_user(request.user)
    updates = request.data['updates']
    node = Content.objects.filter(user=user, id=request.data['id'])
    node.update(**updates)
    node = node.get()
    node.save()
    return Response({node.id: ContentSerializer(node).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def move_node(request):
    user = get_user(request.user)
    movement = request.data['movement']
    node_id = request.data['id']
    parent_node = Content.objects.get(user=user, id=node_id).parent
    res = {}
    node = Content.objects.get(user=user, id=node_id)
    position = parent_node.children.index(node_id)
    if movement == 'up':
        if position > 0:
            prev_node_id = parent_node.children[position - 1]
            parent_node.children[position - 1] = node_id
            parent_node.children[position] = prev_node_id
            parent_node.save()
            res[parent_node.id] = ContentSerializer(parent_node).data
    elif movement == 'down':
        if position < len(parent_node.children) - 1:
            next_node_id = parent_node.children[position + 1]
            parent_node.children[position + 1] = node_id
            parent_node.children[position] = next_node_id
            parent_node.save()
            res[parent_node.id] = ContentSerializer(parent_node).data
    elif movement == 'up_a_level':
        if parent_node.parent != None:
            grand_parent_node = parent_node.parent
            parent_node.children.remove(node_id)
            insertion_point = grand_parent_node.children.index(
                parent_node.id) + 1
            grand_parent_node.children.insert(insertion_point, node_id)
            node.parent = grand_parent_node
            for elem in [parent_node, grand_parent_node, node]:
                elem.save()
                res[elem.id] = ContentSerializer(elem).data
    elif movement == 'down_a_level':
        if position > 0:
            prev_node = Content.objects.get(user=user,
                                            id=parent_node.children[position - 1])
            prev_node.children.append(node_id)
            node.parent = prev_node
            prev_node.toggled = True
            parent_node.children.remove(node_id)
            for elem in [prev_node, node, parent_node]:
                elem.save()
                res[elem.id] = ContentSerializer(elem).data
    return Response(res)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_node(request):
    user = get_user(request.user)
    node = Content.objects.get(user=user, id=int(request.GET['id']))
    if node.parent != None:
        parent_node = node.parent
        parent_node.children.remove(node.id)
        parent_node.save()
        node.delete()
        return Response({parent_node.id: ContentSerializer(parent_node).data})
    else:
        return Response({})
