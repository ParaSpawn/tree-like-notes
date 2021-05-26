import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createStore } from "redux";
import { Provider } from "react-redux";
import reducer from "./redux/reducer.js";
import axios from "axios";
import { getAccessToken } from "./TokenManager";

const production = true
export const baseURL = (production ? "tree-like-notes.herokuapp.com" : "http://127.0.0.1:8000");

export const axiosInstance = axios.create({
    baseURL: baseURL,
})

export const store = createStore(reducer);

ReactDOM.render(
    <Provider store={store}>
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </Provider>,
    document.getElementById("root")
);

reportWebVitals();
