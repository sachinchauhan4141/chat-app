import React, { useEffect, useState } from "react";
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
import { Link } from "react-router-dom";

const AddChat = () => {
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
      }
    } catch (error) {
      console.log(error);
      alert(error?.message);
    }
  };

  const handleAdd = async () => {
    if (currentUser?.username === user?.username) {
      alert("You cant add yourself...");
      return;
    }

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
    } catch (error) {
      console.log(error);
      alert(error?.message);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex justify-center">
      <div className="w-2/3 border flex flex-col">
        {/* <!-- Header --> */}
        <div className="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="mr-1">
              <Link to={"/"}>
                <svg
                  height="24px"
                  width="24px"
                  id="Layer_1"
                  style={{ enableBackground: "new 0 0 512 512" }}
                  version="1.1"
                  viewBox="0 0 512 512"
                  xmlSpace="preserve"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <polygon points="352,128.4 319.7,96 160,256 160,256 160,256 319.7,416 352,383.6 224.7,256 " />
                </svg>
              </Link>
            </div>
            <div className="py-2 px-2 bg-grey-lightest">
              <h1 className="text-2xl">Add new chat</h1>
            </div>
          </div>
          <div>
            <Link to={"/"} onClick={() => auth.signOut()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                fill="#727A7E"
                height="24"
                width="24"
                version="1.1"
                id="Capa_1"
                viewBox="0 0 384.971 384.971"
                xmlSpace="preserve"
              >
                <g id="Sign_Out">
                  <path d="M180.455,360.91H24.061V24.061h156.394c6.641,0,12.03-5.39,12.03-12.03s-5.39-12.03-12.03-12.03H12.03    C5.39,0.001,0,5.39,0,12.031V372.94c0,6.641,5.39,12.03,12.03,12.03h168.424c6.641,0,12.03-5.39,12.03-12.03    C192.485,366.299,187.095,360.91,180.455,360.91z" />
                  <path d="M381.481,184.088l-83.009-84.2c-4.704-4.752-12.319-4.74-17.011,0c-4.704,4.74-4.704,12.439,0,17.179l62.558,63.46H96.279    c-6.641,0-12.03,5.438-12.03,12.151c0,6.713,5.39,12.151,12.03,12.151h247.74l-62.558,63.46c-4.704,4.752-4.704,12.439,0,17.179    c4.704,4.752,12.319,4.752,17.011,0l82.997-84.2C386.113,196.588,386.161,188.756,381.481,184.088z" />
                </g>
              </svg>
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
                <div className="flex mr-4 border border-black rounded-md px-2 py-1 bg-green-500 text-white">
                  <Link to={"/"}>Add</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddChat;
