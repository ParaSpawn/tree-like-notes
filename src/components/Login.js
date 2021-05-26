import { Component, useState, setState } from "react";
import { Form, Input, Button, Card, Alert } from "antd";
import "antd/dist/antd.css";
import { useHistory } from "react-router-dom";
import { URL } from "../index.js";
import { setToken, getAccessToken } from "../TokenManager.js";
import { getNodes } from "../redux/actions.js";
import { axiosInstance } from "../index.js";
import axios from "axios";

export async function login(username, password) {
    let res = await axiosInstance.post("/user/login/", {
        username,
        password,
    });
    setToken(res.data.access, res.data.refresh);
}

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const history = useHistory();
    const loginFn = async () => {
        try {
            await login(username, password);
            history.push("/content");
        } catch (err) {
            if (err.response) {
                if (err.response.status == 401)
                    setErrorMessage("Incorrect username or password");
                else
                    setErrorMessage(
                        "Something went wrong. Error code " +
                            err.response.status
                    );
                setTimeout(() => {
                    setErrorMessage("");
                }, 4000);
            }
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "fixed",
                top: "0px",
                left: "0px",
                right: "0px",
                bottom: "0px",
                background: "#cccccc",
            }}
        >
            <Card title="Login">
                <Form labelCol={{ span: 8 }}>
                    <Form.Item label="Username">
                        <Input
                            onChange={(e) => setUsername(e.target.value)}
                        ></Input>
                    </Form.Item>
                    <Form.Item label="Password">
                        <Input.Password
                            onChange={(e) => setPassword(e.target.value)}
                        ></Input.Password>
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 9 }}>
                        <Button type="primary" onClick={loginFn}>
                            Submit
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="link"
                            htmlType="button"
                            onClick={() => history.push("/signup")}
                        >
                            Sign up!
                        </Button>
                    </Form.Item>
                    {errorMessage !== "" ? (
                        <Alert message={errorMessage} showIcon type="error" />
                    ) : null}
                </Form>
            </Card>
        </div>
    );
}
