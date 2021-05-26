import { BrowserRouter, Route, Switch, useHistory } from "react-router-dom";
import Login from "./components/Login.js";
import Signup from "./components/Signup.js";
import React, { Component } from "react";
import Test from "./components/Test.js";
import Content from "./components/Content.js";
import { getAccessToken, setCookie } from "./TokenManager.js";
import axios from "axios";
import { baseURL } from "./index.js";

export let authorizedAxiosInstance = null;

function Startup(props) {
    const history = useHistory();
    if (getAccessToken() === null) {
        history.push("/");
        return null;
    } else {
        authorizedAxiosInstance = axios.create({
            baseURL: baseURL,
            headers: { Authorization: getAccessToken() },
        });
        return <Content />;
    }
}

export default function App(props) {
    return (
        <div>
            <BrowserRouter>
                <Switch>
                    <Route path="/" exact>
                        <Login />
                    </Route>
                    <Route path="/signup">
                        <Signup />
                    </Route>
                    <Route path="/test">
                        <Test />
                    </Route>
                    <Route path="/content">
                        <Startup />
                    </Route>
                </Switch>
            </BrowserRouter>
        </div>
    );
}
