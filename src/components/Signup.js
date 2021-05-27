import { useState } from "react";
import { Form, Input, Button, Card, Alert } from "antd";
import "antd/dist/antd.css";
import { useHistory } from "react-router-dom";
import { getNodes } from "../redux/actions.js";
import { axiosInstance } from "../index.js";
import { login } from "./Login.js";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const history = useHistory();

    const signup = async () => {
        if (password !== confirmPassword) {
            setErrorMessage("Passwords not matching");
            setTimeout(() => setErrorMessage(""), 4000);
        } else {
            const data = { username: username, password: password };
            try {
                let [res, err] = await axiosInstance
                    .post("/user/register/", data)
                    .then((r) => [r, null])
                    .catch((e) => [null, e]);
                if (err) {
                    if (err.response.status == 400)
                        setErrorMessage(
                            "Username is taken. Please choose another."
                        );
                    else
                        setErrorMessage(
                            "Something went wrong. Error code " +
                                err.response.status
                        );
                    setTimeout(() => setErrorMessage(""), 4000);
                } else {
                    await login(username, password);
                    await getNodes(-1, true);
                    history.push("/content");
                }
            } catch (err) {
                console.log(err);
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
            <Card title="Sign up">
                <Form labelCol={{ span: 10 }}>
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
                    <Form.Item label="Confirm password">
                        <Input.Password
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        ></Input.Password>
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8 }}>
                        <Button type="primary" onClick={() => signup()}>
                            Submit
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="link"
                            htmlType="button"
                            onClick={() => history.push("/")}
                        >
                            Login
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
