import { stateDefinition as SD } from "../definition.js";
import { actions } from "./actions.js";

export default function reducer(state = { [SD.ROOT_STACK]: [] }, action) {
    switch (action.type) {
        case actions.PUSH_ROOT:
            if (action.payload[SD.ROOT_ID] != state[SD.ROOT_ID]) {
                state[SD.ROOT_STACK].push(action.payload[SD.ROOT_ID]);
                state[SD.ROOT_ID] = action.payload[SD.ROOT_ID];
                state[SD.FOCUSED_NODE] = action.payload[SD.ROOT_ID];
            }
            break;
        case actions.POP_ROOT:
            if (state[SD.ROOT_STACK].length > 1) {
                state[SD.ROOT_STACK].pop();
                state[SD.ROOT_ID] =
                    state[SD.ROOT_STACK][state[SD.ROOT_STACK].length - 1];
            }
        case actions.DELETE:
            delete state[action.payload.deletedNodeId];
            break;
        case actions.UPDATE:
            for (const k in action.payload.updatedNodes)
                state[k] = action.payload.updatedNodes[k];
            break;
        case actions.CLEAR_STATE:
            state = { [SD.ROOT_STACK]: [] };
            break;
    }
    return { ...state };
}
