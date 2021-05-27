import {
    nodeDefinition as ND,
    stateDefinition as SD,
    tagsDefinition as TD,
} from "../definition.js";
import { store } from "../index.js";
import { authorizedAxiosInstance } from "../App.js";

const urlPatterns = {
    CREATE: "/content/create/",
    CREATE_CHILD: "/content/create_child/",
    UPDATE: "/content/update/",
    DELETE: "/content/delete/",
    RETRIEVE: "/content/retrieve/",
    SEARCH: "/content/search/",
    MOVE: "/content/move/",
};

export const actions = {
    UPDATE: "UPDATE",
    DELETE: "DELETE",
    PUSH_ROOT: "PUSH_ROOT",
    POP_ROOT: "POP_ROOT",
    CLEAR_STATE: "CLEAR_STATE",
};

const makeUpdateAction = (updatedNodes) => ({
    payload: { updatedNodes },
    type: actions.UPDATE,
});

const makeDeleteAction = (deletedNodeId) => ({
    payload: { deletedNodeId },
    type: actions.DELETE,
});

async function updateRequest(nodeId, updates) {
    let updatedNode = (
        await authorizedAxiosInstance.post(urlPatterns.UPDATE, {
            id: nodeId,
            updates: updates,
        })
    ).data;
    return updatedNode;
}

export function setFocus(nodeId) {
    store.dispatch(makeUpdateAction({ [SD.FOCUSED_NODE]: nodeId }));
}

export function setFocusToNextNode(nodeId, parentId) {
    const state = store.getState();
    const children = state[parentId][ND.CHILDREN_ID];
    const nextNodeId = Math.min(
        children.findIndex((e) => e == nodeId) + 1,
        children.length - 1
    );
    store.dispatch(
        makeUpdateAction({ [SD.FOCUSED_NODE]: children[nextNodeId] })
    );
}

export function setFocusToPreviousNode(nodeId, parentId) {
    const state = store.getState();
    const children = state[parentId][ND.CHILDREN_ID];
    const prevNodeId = Math.max(children.findIndex((e) => e == nodeId) - 1, 0);
    store.dispatch(
        makeUpdateAction({ [SD.FOCUSED_NODE]: children[prevNodeId] })
    );
}

export async function getNodes(parentId = -1, setRoot = false) {
    let nodes = (
        await authorizedAxiosInstance.get(
            urlPatterns.RETRIEVE +
                "?" +
                ND.PARENT_ID +
                "=" +
                parentId.toString()
        )
    ).data;
    const root = nodes[SD.ROOT_ID];
    delete nodes[SD.ROOT_ID];
    store.dispatch(makeUpdateAction(nodes));
    if (setRoot) {
        store.dispatch({
            type: actions.PUSH_ROOT,
            payload: { [SD.ROOT_ID]: root },
        });
    }
}

export function pushRoot(rootId) {
    store.dispatch({
        type: actions.PUSH_ROOT,
        payload: { [SD.ROOT_ID]: rootId },
    });
}

export function popRoot() {
    store.dispatch({ type: actions.POP_ROOT, payload: {} });
}

export async function createNode(parentId, nodeId) {
    const newNode = (
        await authorizedAxiosInstance.post(urlPatterns.CREATE, {
            [ND.PARENT_ID]: parentId,
            [ND.NODE_ID]: nodeId,
        })
    ).data;
    store.dispatch(makeUpdateAction(newNode));
    await getNodes(parentId);
}

export async function createChildNode(parentId) {
    console.log("creating child node");
    const newNode = (
        await authorizedAxiosInstance.post(urlPatterns.CREATE_CHILD, {
            [ND.PARENT_ID]: parentId,
        })
    ).data;
    store.dispatch(makeUpdateAction(newNode));
    await getNodes(parentId);
}

export async function updateNodeContent(nodeId, newContent) {
    const updatedNode = await updateRequest(nodeId, {
        [ND.CONTENT]: newContent,
    });
    store.dispatch(makeUpdateAction(updatedNode));
}

export async function toggleNode(nodeId, toggleStatus) {
    const updatedNode = await updateRequest(nodeId, {
        [ND.TOGGLED]: toggleStatus,
    });
    store.dispatch(makeUpdateAction(updatedNode));
    if (toggleStatus) {
        await getNodes(nodeId);
    }
}

export async function moveNode(nodeId, movement) {
    const updatedNodes = (
        await authorizedAxiosInstance.post(urlPatterns.MOVE, {
            id: nodeId,
            movement: movement,
        })
    ).data;
    store.dispatch(makeUpdateAction(updatedNodes));
}

export async function deleteNode(nodeId, nextFocus) {
    const updatedNode = (
        await authorizedAxiosInstance.delete(urlPatterns.DELETE + "?id=" + nodeId)
    ).data;
    if (updatedNode !== {}) {
        store.dispatch(makeDeleteAction(nodeId));
        store.dispatch(makeUpdateAction(updatedNode));
        setFocus(nextFocus)
    }
}
