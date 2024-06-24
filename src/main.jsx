import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ChatScreen from "./components/ChatScreen.jsx";
import App from "./components/App.jsx";
import AddChat from "./components/AddChat.jsx";
import Notification from "./components/Notification.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <App />
        <Notification />
      </>
    ),
  },
  {
    path: "/chat/:id",
    element: (
      <>
        <ChatScreen />
        <Notification />
      </>
    ),
  },
  {
    path: "/addchat",
    element: (
      <>
        <AddChat />
        <Notification />
      </>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
