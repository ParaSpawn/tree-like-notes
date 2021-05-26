import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createStore } from "redux";
import { Provider } from "react-redux";
import reducer from "./redux/reducer.js";
import axios from "axios";
import { getAccessToken } from "./TokenManager";

export const axiosInstance = axios.create({});

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
