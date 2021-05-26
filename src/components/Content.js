import { Component, useState } from "react";
import "antd/dist/antd.css";
import {
    Button,
    Layout,
    Breadcrumb,
    Typography,
    Popover,
    Tag,
    Table,
    Space,
} from "antd";
import { PoweroffOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { actions, getNodes } from "../redux/actions.js";
import { connect } from "react-redux";
import { nodeDefinition as ND, stateDefinition as SD } from "../definition.js";
import Node from "./Node.js";
import { store } from "../index.js";
import { removeTokens } from "../TokenManager.js";

function Logout(props) {
    const history = useHistory();
    return (
        <Button
            icon={<PoweroffOutlined />}
            onClick={() => {
                history.push("/");
                removeTokens();
                store.dispatch({ payload: {}, type: actions.CLEAR_STATE });
            }}
            shape="circle"
            danger
        />
    );
}

const shortcutInformation = [
    ["Focus on parent", ["left"]],
    ["Focus on child", ["right"]],
    ["Focus on next node", ["down"]],
    ["Focus on previous node", ["up"]],
    ["Move node down", ["alt", "down"]],
    ["Move node up", ["alt", "up"]],
    ["Move node to previous level", ["alt", "left"]],
    ["Move node to next level", ["alt", "right"]],
    ["Delete node", ["del"]],
    ["Toggle node", ["t"]],
    ["Create new node", ["n"]],
    ["Create new child node", ["alt", "n"]],
    ["Edit node", ["enter"]],
    ["Stop editing node", ["esc"]],
    ["Set as main node", ["p"]],
    ["Pop out the main node", ["o"]],
];

let shortcutInformationData = [];

for (let i = 0; i < shortcutInformation.length; i++)
    shortcutInformationData.push({
        key: i,
        command: shortcutInformation[i][0],
        shortcut: shortcutInformation[i][1],
    });

class Content extends Component {
    constructor(props) {
        super(props);
        getNodes(-1, true);
        this.state = {};
    }

    render() {
        const { Header, Content, Footer } = Layout;
        const { Title } = Typography;
        const shortcutInfoColumns = [
            { title: "Command", dataIndex: "command", key: "command" },
            {
                title: "Shortcut",
                dataIndex: "shortcut",
                key: "shortcut",
                render: (w) => w.map((e) => <Tag color="default">{e}</Tag>),
            },
        ];
        const ShortcutInformationComponent = (
            <Table
                columns={shortcutInfoColumns}
                dataSource={shortcutInformationData}
                size="small"
                pagination={false}
            />
        );
        return (
            <>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0px 0px 15px 1px grey",
                        marginBottom: "30px",
                        padding: "15px",
                        paddingTop: "5px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Title style={{}} level={2}>
                            Tree-like Notes
                        </Title>
                        <Space>
                            <Popover
                                placement="bottomLeft"
                                content={ShortcutInformationComponent}
                            >
                                <Button
                                    shape="circle"
                                    icon={<InfoCircleOutlined />}
                                />
                            </Popover>
                            <Logout />
                        </Space>
                    </div>
                    <Breadcrumb
                        style={{
                            padding: "5px",
                            paddingLeft: "10px",
                            backgroundColor: "#e6e6e6",
                            borderRadius: "10px",
                        }}
                    >
                        {this.props.breadCrumb.map((e) => (
                            <Breadcrumb.Item>{e}</Breadcrumb.Item>
                        ))}
                    </Breadcrumb>
                </div>
                <Content style={{ marginLeft: "20px", marginRight: "20px" }}>
                    <Node
                        id={this.props[SD.ROOT_ID]}
                        key={this.props[SD.ROOT_ID]}
                    />
                </Content>
            </>
        );
    }
}

const mapState = (state) => {
    let breadCrumb = [];
    if (SD.ROOT_STACK in state) {
        for (let i of state[SD.ROOT_STACK]) {
            breadCrumb.push(
                state[i][ND.CONTENT].slice(0, 20) +
                    (state[i][ND.CONTENT].length > 20 ? "..." : "")
            );
        }
    }
    return { [SD.ROOT_ID]: state[SD.ROOT_ID], breadCrumb: breadCrumb };
};

export default connect(mapState)(Content);
