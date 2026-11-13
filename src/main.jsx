import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ConfigProvider theme={{ token: { fontFamily: '"Nunito", "Segoe UI", Arial, sans-serif' } }}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ConfigProvider>,
);
