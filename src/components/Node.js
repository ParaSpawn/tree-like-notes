import React, { Component, useState } from "react";
import "antd/dist/antd.css";
import { Input } from "antd";
import { CaretRightFilled, CaretDownFilled } from "@ant-design/icons";
import { nodeDefinition as ND, stateDefinition as SD } from "../definition";
import { connect } from "react-redux";
import {
    createChildNode,
    createNode,
    deleteNode,
    moveNode,
    popRoot,
    pushRoot,
    setFocus,
    setFocusToNextNode,
    setFocusToPreviousNode,
    toggleNode,
    updateNodeContent,
} from "../redux/actions";
import { GlobalHotKeys } from "react-hotkeys";

const mapState = (state, ownProps) => {
    let node = {
        ...state[ownProps[ND.NODE_ID]],
        isRoot: ownProps[ND.NODE_ID] == state[SD.ROOT_ID],
    };
    if (ownProps[ND.NODE_ID] == state[SD.FOCUSED_NODE]) node.focused = true;
    return node;
};

const Connector = connect(mapState);

class Node extends Component {
    constructor(props) {
        super(props);

        this.state = {
            content: this.props[ND.CONTENT],
            saveTimer: null,
        };
        this.nodeKeyMap = {
            FOCUS_CHILD: "right",
            FOCUS_PARENT: "left",
            FOCUS_NEXT_NODE: "down",
            FOCUS_PREV_NODE: "up",
            DELETE_NODE: "del",
            CREATE_NODE: "n",
            CREATE_CHILD_NODE: "alt+n",
            EDIT_NODE: "enter",
            MOVE_NODE_UP: "alt+up",
            MOVE_NODE_DOWN: "alt+down",
            MOVE_NODE_UP_A_LEVEL: "alt+left",
            MOVE_NODE_DOWN_A_LEVEL: "alt+right",
            TOGGLE: "t",
            PUSH_ROOT: "p",
            POP_ROOT: "o",
        };
        this.textInput = React.createRef();
        this.nodeHandlers = {
            FOCUS_CHILD: (e) => {
                e.preventDefault();
                if (this.props[ND.CHILDREN_ID].length) {
                    if (!this.props[ND.TOGGLED])
                        toggleNode(
                            this.props[ND.NODE_ID],
                            !this.props[ND.TOGGLED]
                        );
                    setFocus(this.props[ND.CHILDREN_ID][0]);
                }
            },
            FOCUS_PARENT: (e) => {
                e.preventDefault();
                if (this.props[ND.PARENT_ID]) {
                    if (this.props.isRoot) popRoot();
                    setFocus(this.props[ND.PARENT_ID]);
                }
            },
            FOCUS_NEXT_NODE: (e) => {
                e.preventDefault();
                if (this.props[ND.PARENT_ID])
                    setFocusToNextNode(
                        this.props[ND.NODE_ID],
                        this.props[ND.PARENT_ID]
                    );
            },
            FOCUS_PREV_NODE: (e) => {
                e.preventDefault();
                if (this.props[ND.PARENT_ID])
                    setFocusToPreviousNode(
                        this.props[ND.NODE_ID],
                        this.props[ND.PARENT_ID]
                    );
            },
            DELETE_NODE: (e) => {
                e.preventDefault();
                if (this.props[ND.PARENT_ID]) {
                    setFocus(this.props[ND.PARENT_ID]);
                    deleteNode(this.props[ND.NODE_ID]);
                }
            },
            CREATE_NODE: (e) => {
                e.preventDefault();
                if (this.props[ND.PARENT_ID])
                    createNode(
                        this.props[ND.PARENT_ID],
                        this.props[ND.NODE_ID]
                    );
            },
            CREATE_CHILD_NODE: (e) => {
                e.preventDefault();
                createChildNode(this.props[ND.NODE_ID]);
            },
            MOVE_NODE_DOWN: (e) => {
                e.preventDefault();
                if (this.props[ND.PARENT_ID])
                    moveNode(this.props[ND.NODE_ID], "down");
            },
            MOVE_NODE_UP: (e) => {
                e.preventDefault();
                if (this.props[ND.PARENT_ID])
                    moveNode(this.props[ND.NODE_ID], "up");
            },
            MOVE_NODE_UP_A_LEVEL: (e) => {
                e.preventDefault();
                if (this.props[ND.PARENT_ID])
                    moveNode(this.props[ND.NODE_ID], "up_a_level");
            },
            MOVE_NODE_DOWN_A_LEVEL: (e) => {
                e.preventDefault();
                if (this.props[ND.PARENT_ID])
                    moveNode(this.props[ND.NODE_ID], "down_a_level");
            },
            TOGGLE: (e) => {
                e.preventDefault();
                toggleNode(this.props[ND.NODE_ID], !this.props[ND.TOGGLED]);
            },
            EDIT_NODE: (e) => {
                e.preventDefault();
                this.textInput.current.focus();
            },
            PUSH_ROOT: (e) => {
                e.preventDefault();
                pushRoot(this.props[ND.NODE_ID]);
            },
            POP_ROOT: (e) => {
                e.preventDefault();
                popRoot();
            },
        };
        this.onContentChange = this.onContentChange.bind(this);
    }

    async onContentChange(e) {
        if (this.state.saveTimer) clearTimeout(this.state.saveTimer);
        this.setState({
            content: e.target.value,
            saveTimer: setTimeout(
                () =>
                    updateNodeContent(
                        this.props[ND.NODE_ID],
                        this.state.content
                    ),
                1000
            ),
        });
    }

    render() {
        const ConnectedNode = Connector(Node);
        const { TextArea } = Input;
        let children = [];
        if (ND.CHILDREN_ID in this.props) {
            for (let i = 0; i < this.props[ND.CHILDREN_ID].length; i++)
                children.push(
                    <ConnectedNode
                        key={this.props[ND.CHILDREN_ID][i]}
                        id={this.props[ND.CHILDREN_ID][i]}
                        index={i}
                    />
                );
        }
        const caretStyle = {
            fontSize: "12px",
            paddingTop: "3px",
            paddingBottom: "3px",
        };
        return (
            <div style={{ display: "flex" }}>
                {this.props.focused ? (
                    <GlobalHotKeys
                        keyMap={this.nodeKeyMap}
                        handlers={this.nodeHandlers}
                    />
                ) : null}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "25px",
                    }}
                >
                    <div
                        style={{ height: this.props.isRoot ? "23px" : "15px" }}
                    ></div>
                    {this.props[ND.TOGGLED] ? (
                        <CaretDownFilled
                            style={caretStyle}
                            onClick={(e) =>
                                toggleNode(this.props[ND.NODE_ID], false)
                            }
                        />
                    ) : (
                        <CaretRightFilled
                            style={caretStyle}
                            onClick={(e) =>
                                toggleNode(this.props[ND.NODE_ID], true)
                            }
                        />
                    )}
                    <div
                        style={{
                            width: "1px",
                            height: "100%",
                            backgroundColor: "#ffffff",
                            borderLeft: "1px dashed grey",
                        }}
                    ></div>
                </div>
                <div
                    style={{
                        width: "100%",
                        border: this.props.focused ? "1px solid grey" : "",
                        padding: "2px",
                        borderRadius: "10px",
                    }}
                >
                    <TextArea
                        defaultValue={this.state.content}
                        onChange={this.onContentChange}
                        autoSize
                        bordered={false}
                        ref={this.textInput}
                        style={{
                            color: this.props.focused ? "white" : "black",
                            backgroundColor: this.props.focused
                                ? "#555555"
                                : "white",
                            borderRadius: "8px",
                            width: "100%",
                            fontSize: this.props.isRoot ? "20px" : "15px",
                        }}
                        onClick={() => setFocus(this.props[ND.NODE_ID])}
                    />
                    {this.props[ND.TOGGLED] ? children : null}
                </div>
            </div>
        );
    }
}

export default connect(mapState)(Node);
