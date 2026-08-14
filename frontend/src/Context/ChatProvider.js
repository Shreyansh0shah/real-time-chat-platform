import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";

const ENDPOINT =
  process.env.REACT_APP_API_URL || "http://localhost:5001";
const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef();

  const history = useHistory();

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.map(String).includes(String(userId));
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) history.push("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(ENDPOINT);
    setSocket(socketRef.current);

    socketRef.current.on("connect", () => {
      console.log("SOCKET CONNECTED", socketRef.current.id);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!user || !socket) return;

    console.log("EMITTING SETUP FOR USER:", user._id);
    socket.emit("setup", user);
  }, [user, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("get-online-users", (users) => {
      console.log("RECEIVED ONLINE USERS ARRAY FROM SERVER:", users);
      setOnlineUsers(users);
    });

    return () => {
      socket.off("get-online-users");
    };
  }, [socket]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        unreadCounts,
        setUnreadCounts,
        onlineUsers,
        setOnlineUsers,
        isUserOnline,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
