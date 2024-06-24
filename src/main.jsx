import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ChatScreen from "./components/ChatScreen.jsx";
import App from "./components/App.jsx";
import AddChat from "./components/AddChat.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/chat/:id",
    element: <ChatScreen />,
  },
  {
    path: "/addchat",
    element: <AddChat />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
