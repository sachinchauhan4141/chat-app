import React, { useState } from "react";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useUserStore } from "../config/userStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddChat = () => {
  const navigate = useNavigate();
  const [chats] = useState(JSON.parse(localStorage.getItem("chats") || "[]"));
  const { currentUser } = useUserStore();
  const [user, setUser] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);
      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      } else {
        toast.error(username + " not found");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.message);
    }
  };

  const handleAdd = async () => {
    if (currentUser?.username === user?.username) {
      toast.error("You cant add yourself...");
      return;
    }
    const alreadyExists = chats.find((chat) => {
      return chat.user.username === user?.username;
    });
    if (alreadyExists) {
      toast.error("User chat already exists");
      return;
    }
    toast.warning("adding user please wait");
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
      //updating searched users chat list
      await updateDoc(doc(userChatsRef, user?.id), {
        chats: arrayUnion({
          chatId: newChatRef?.id,
          lastMessage: "",
          receiverId: currentUser?.id,
          updatedAt: Date.now(),
        }),
      });
      //updating our chat list
      await updateDoc(doc(userChatsRef, currentUser?.id), {
        chats: arrayUnion({
          chatId: newChatRef?.id,
          lastMessage: "",
          receiverId: user?.id,
          updatedAt: Date.now(),
        }),
      });
      toast.success("user added successfully");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error?.message);
    }
  };

  const handleSignOut = () => {
    toast.warning("signed out...");
    localStorage.removeItem("currentuser");
    localStorage.removeItem("chats");
    auth.signOut();
  };

  return (
    <div className="h-screen overflow-hidden flex justify-center">
      <div className="w-full lg:w-2/3 border flex flex-col">
        {/* <!-- Header --> */}
        <div className="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="mr-1 text-center">
              <Link to={"/"}>
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
            </div>
            <div className="py-2 px-2 bg-grey-lightest">
              <h1 className="text-2xl">Add new chat</h1>
            </div>
          </div>
          <div>
            <Link to={"/"} onClick={handleSignOut}>
              <span className="material-symbols-outlined">logout</span>
            </Link>
          </div>
        </div>
        <div className="py-2 px-2 bg-grey-lightest">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              className="w-full px-2 py-2 text-sm"
              placeholder="Search someone to start chat"
              name="username"
            />
          </form>
        </div>
        {user && (
          <div className="bg-grey-lighter flex-1 overflow-auto">
            <div onClick={handleAdd}>
              <div className="bg-white px-3 flex items-center hover:bg-grey-lighter cursor-pointer">
                <div>
                  <img className="h-12 w-12 rounded-full" src={user?.avatar} />
                </div>
                <div className="ml-4 flex-1 border-b border-grey-lighter py-4">
                  <p className="text-grey-darkest text-lg">{user?.username}</p>
                </div>
                <span className="material-symbols-outlined">person_add</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddChat;
