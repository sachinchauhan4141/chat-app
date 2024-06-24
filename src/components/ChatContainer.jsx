import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { useUserStore } from "../config/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useChatStore } from "../config/chatStore";

const ChatContainer = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");

  const { changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser?.id),
      async (res) => {
        const items = res.data().chats;
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item?.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          return { ...item, user };
        });
        const chatData = await Promise.all(promises);
        setChats(
          chatData.sort((a, b) => {
            return b?.updatedAt - a?.updatedAt;
          })
        );
      }
    );
    return () => {
      unSub();
    };
  }, [currentUser?.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });
    const chatIndex = userChats.findIndex(
      (item) => item?.chatId === chat?.chatId
    );
    userChats[chatIndex].isSeen = true;
    const userChatsRef = doc(db, "userchats", currentUser.id);
    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
      navigate("/chat/" + chat?.user?.id);
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen overflow-hidden flex justify-center">
      <div className="w-2/3 border flex flex-col">
        {/* <!-- Header --> */}
        <div className="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
          <div className="flex text-center items-center gap-2">
            <img className="w-10 h-10 rounded-full" src={currentUser?.avatar} />
            <p className="text-lg">{currentUser?.username}</p>
          </div>
          <div>
            <p className="text-2xl">ChatNoW</p>
          </div>
          <div></div>
          <div className="flex">
            <Link
              to={"/addchat"}
              className="flex mr-4 border border-black rounded-md px-2 py-1 bg-green-500 text-white"
            >
              Add user
            </Link>
            <button onClick={() => auth.signOut()}>
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
            </button>
          </div>
        </div>
        {/* <!-- Search --> */}
        <div className="py-2 px-2 bg-grey-lightest">
          <input
            type="text"
            className="w-full px-2 py-2 text-sm"
            placeholder="Search"
            name="username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* <!-- Contacts --> */}
        <div className="bg-grey-lighter flex-1 overflow-auto">
          {filteredChats?.map((chat) => {
            return (
              <div key={chat?.chatId}>
                <div
                  className={`${
                    chat?.isSeen ? "bg-white" : "bg-blue-200"
                  } px-3 flex items-center hover:bg-grey-lighter cursor-pointer`}
                  onClick={() => {
                    handleSelect(chat);
                  }}
                >
                  <div>
                    <img
                      className="h-12 w-12 rounded-full"
                      src={
                        chat?.user?.blocked.includes(currentUser.id)
                          ? "#"
                          : chat?.user?.avatar
                      }
                    />
                  </div>
                  <div className="ml-4 flex-1 border-b border-grey-lighter py-4">
                    <div className="flex items-bottom justify-between">
                      <p className="text-grey-darkest">
                        {chat?.user?.blocked.includes(currentUser.id)
                          ? "User"
                          : chat?.user?.username}
                      </p>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">
                      {chat?.lastMessage?.length === 0
                        ? "start messaging"
                        : chat?.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
