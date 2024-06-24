import { useEffect } from "react";
import AuthPage from "./AuthPage";
import ChatContainer from "./ChatContainer";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { useUserStore } from "../config/userStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div>Loading...</div>;

  return !currentUser ? <AuthPage /> : <ChatContainer />;
};

export default App;
