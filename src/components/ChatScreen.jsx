import React, { useEffect, useRef, useState } from "react";
import Message from "./Cards/Message";
import { Link } from "react-router-dom";
import { useUserStore } from "../config/userStore";
import EmojiPicker from "emoji-picker-react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useChatStore } from "../config/chatStore";
import upload from "../config/upload";
import { toast } from "react-toastify";

const Chat = () => {
  const endRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, toggleBlock } =
    useChatStore();
  const [chat, setChat] = useState(null);
  const [text, setText] = useState("");

  const [image, setImage] = useState({
    file: null,
    url: "",
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [chat]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId, toggleBlock]);

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (image?.file) {
        imgUrl = await upload(image?.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser?.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIds = [currentUser?.id, user?.id];

      userIds.forEach(async (userId) => {
        const userChatsRef = doc(db, "userchats", userId);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData?.chats?.findIndex((c) => {
            return c.chatId === chatId;
          });

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            chatId === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
      setImage({
        file: null,
        url: "",
      });
      setText("");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser?.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      toggleBlock();
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e?.emoji);
    setOpen(false);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file && file?.type?.split("/")[0] === "image") {
      setImage({
        file,
        url: URL.createObjectURL(file),
      });
      setText(() => " ");
      toast.success(file.name, " added successfully");
    } else {
      setImage({
        file: null,
        url: "",
      });
      toast.warning("try again using image file");
    }
  };

  return (
    <div className="h-screen overflow-hidden flex justify-center">
      <div className="w-full lg:w-2/3 border flex flex-col">
        {/* <!-- Header --> */}
        <div className="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="mr-1">
              <Link to={"/"}>
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
            </div>
            <div>
              <img className="w-10 h-10 rounded-full" src={user?.avatar} />
            </div>
            <div className="ml-4">
              <p className="text-grey-darkest">
                {user?.username || "username"}
              </p>
            </div>
          </div>
          <div>
            <button onClick={handleBlock} className="px-2">
              <span className="material-symbols-outlined">
                {isCurrentUserBlocked
                  ? "warning"
                  : isReceiverBlocked
                  ? "check_circle"
                  : "block"}
              </span>
            </button>
          </div>
        </div>
        {/* <!-- Messages --> */}
        <div
          className="flex-1 overflow-auto"
          style={{ backgroundColor: "#DAD3CC" }}
        >
          <div className="py-2 px-3">
            <div className="flex justify-center mb-4">
              <div
                className="rounded py-2 px-4"
                style={{ backgroundColor: "#FCF4CB" }}
              >
                <p className="text-xs">
                  Messages to this chat and calls are now secured with
                  end-to-end encryption. Tap for more info.
                </p>
              </div>
            </div>
            {chat?.messages?.map((message) => {
              return (
                <Message
                  key={message?.createdAt}
                  chatData={{
                    img: message?.img,
                    text: message?.text,
                    time: message?.createdAt.toDate(),
                    mine: message?.senderId === currentUser?.id,
                  }}
                />
              );
            })}
          </div>
          <div ref={endRef}></div>
        </div>
        {/* <!-- Input --> */}
        <div className="bg-grey-lighter px-4 py-4 flex items-center">
          <div className="mr-3">
            <label htmlFor="file">
              <span className="material-symbols-outlined">
                add_photo_alternate
              </span>
            </label>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => handleImage(e)}
            />
          </div>
          <div className="relative">
            <span
              className="material-symbols-outlined cursor-default"
              onClick={() => setOpen((prev) => !prev)}
            >
              add_reaction
            </span>
            <div className="absolute bottom-14">
              <EmojiPicker open={open} onEmojiClick={handleEmoji} />
            </div>
          </div>
          <div className="flex-1 mx-4">
            <input
              className="w-full border rounded px-2 py-2 disabled:cursor-not-allowed"
              type="text"
              value={text}
              placeholder={
                isCurrentUserBlocked || isReceiverBlocked
                  ? "You cant message this user"
                  : "Type a message..."
              }
              onChange={(e) => {
                setText(e.target.value);
              }}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
            className="disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
