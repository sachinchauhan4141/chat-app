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
      alert(error.message);
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
      alert(error.message);
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
      alert(file.name, " added successfully");
    } else {
      setImage({
        file: null,
        url: "",
      });
      alert("try again using image file");
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
            <div>
              <img className="w-10 h-10 rounded-full" src={user?.avatar} />
            </div>
            <div className="ml-4">
              <p className="text-grey-darkest">
                {user?.username || "username"}
              </p>
            </div>
          </div>
          {/* <div className="flex">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="#263238"
                  fillOpacity=".5"
                  d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-.6 4.3-1.6l.3.3v.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"
                ></path>
              </svg>
            </div>
            <div className="ml-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="#263238"
                  fillOpacity=".5"
                  d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"
                ></path>
              </svg>
            </div>
            <div className="ml-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="#263238"
                  fillOpacity=".6"
                  d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"
                ></path>
              </svg>
            </div>
          </div> */}
          <div>
            <button
              onClick={handleBlock}
              className={`flex mr-4 border border-black rounded-md px-2 py-1 ${
                isCurrentUserBlocked
                  ? "bg-red-500 text-white"
                  : isReceiverBlocked
                  ? "bg-red-500 text-white"
                  : ""
              }`}
            >
              {isCurrentUserBlocked
                ? "You are blocked"
                : isReceiverBlocked
                ? "User blocked"
                : "Block user"}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="#263238"
                  fillOpacity=".5"
                  d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"
                ></path>
              </svg>
            </label>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => handleImage(e)}
            />
          </div>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              onClick={() => setOpen((prev) => !prev)}
            >
              <path
                opacity=".45"
                fill="#263238"
                d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.505 0-5.388-1.164-5.607-1.959 0 0 5.912 1.055 10.658 0zM11.804 1.011C5.609 1.011.978 6.033.978 12.228s4.826 10.761 11.021 10.761S23.02 18.423 23.02 12.228c.001-6.195-5.021-11.217-11.216-11.217zM12 21.354c-5.273 0-9.381-3.886-9.381-9.159s3.942-9.548 9.215-9.548 9.548 4.275 9.548 9.548c-.001 5.272-4.109 9.159-9.382 9.159zm3.108-9.751c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z"
              ></path>
            </svg>
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
            <svg
              height={"24px"}
              width={"24px"}
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              style={{ enableBackground: "new 0 0 24 24" }}
              version="1.1"
              viewBox="0 0 24 24"
              xmlSpace="preserve"
            >
              <g id="info" />
              <g id="icons">
                <path
                  d="M21.5,11.1l-17.9-9C2.7,1.7,1.7,2.5,2.1,3.4l2.5,6.7L16,12L4.6,13.9l-2.5,6.7c-0.3,0.9,0.6,1.7,1.5,1.2l17.9-9   C22.2,12.5,22.2,11.5,21.5,11.1z"
                  id="send"
                />
              </g>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
