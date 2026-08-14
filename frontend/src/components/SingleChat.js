import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Avatar, AvatarBadge } from "@chakra-ui/avatar";
import { Box, Flex, Text } from "@chakra-ui/layout";
import "./styles.css";
import { Button, IconButton, Spinner, Textarea, useColorModeValue, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowBackIcon, AttachmentIcon, ChatIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import EmojiPicker from "emoji-picker-react";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT =
  process.env.REACT_APP_API_URL || "http://localhost:5001";// "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [searchTargetId, setSearchTargetId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification, setUnreadCounts, setOnlineUsers, isUserOnline } =
    ChatState();

  const otherUser = selectedChat && !selectedChat.isGroupChat && user
    ? getSenderFull(user, selectedChat.users)
    : null;
  const shellBg = useColorModeValue("slate.50", "slate.950");
  const panelBg = useColorModeValue("white", "slate.900");
  const inputBg = useColorModeValue("gray.100", "slate.800");
  const borderColor = useColorModeValue("gray.200", "slate.700");
  const formBg = useColorModeValue("gray.50", "slate.800");
  const headerText = useColorModeValue("slate.900", "slate.100");

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const handleEmojiClick = (event, emojiData) => {
    const emoji = emojiData?.emoji || "";
    setNewMessage((prevMessage) => {
      const start = Math.min(selection.start, selection.end);
      const end = Math.max(selection.start, selection.end);
      const before = prevMessage.slice(0, start);
      const after = prevMessage.slice(end);
      const updatedMessage = `${before}${emoji}${after}`;

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const cursorPos = start + emoji.length;
          inputRef.current.setSelectionRange(cursorPos, cursorPos);
          setSelection({ start: cursorPos, end: cursorPos });
        }
      }, 0);

      return updatedMessage;
    });

    setShowEmojiPicker(false);
  };

  const updateSelection = () => {
    if (!inputRef.current) return;
    setSelection({
      start: inputRef.current.selectionStart || 0,
      end: inputRef.current.selectionEnd || 0,
    });
  };

  const typingHandler = (event) => {
    const messageText = event.target.value;
    setNewMessage(messageText);
    setSelection({
      start: event.target.selectionStart || 0,
      end: event.target.selectionEnd || 0,
    });

    if (!socketConnected || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, 3000);
  };

  useEffect(() => {
    if (!user) return;

    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    setSearchTerm("");
    setSearchCount(0);
    setSearchTargetId(null);

    fetchMessages();

    selectedChatCompare = selectedChat;
    if (selectedChat) {
      setUnreadCounts((prev) => ({
        ...prev,
        [selectedChat._id]: 0,
      }));
    }

    if (selectedChat && notification.length > 0) {
      const filtered = notification.filter((n) => n.chat._id !== selectedChat._id);
      if (filtered.length !== notification.length) {
        setNotification(filtered);
      }
    }
    if (selectedChat && socket && user) {
      socket.emit("message seen", {
        chatId: selectedChat._id,
        userId: user._id,
      });
    }
    // eslint-disable-next-line
  }, [selectedChat]);

useEffect(() => {
  if (!socket) return;

  const handleMessageReceived = (newMessageRecieved) => {
    if (
      !selectedChatCompare ||
      selectedChatCompare._id !== newMessageRecieved.chat._id
    ) {
      if (!notification.includes(newMessageRecieved)) {
        setNotification((prev) => [newMessageRecieved, ...prev]);
        setUnreadCounts((prev) => ({
          ...prev,
          [newMessageRecieved.chat._id]:
            (prev[newMessageRecieved.chat._id] || 0) + 1,
        }));
        setFetchAgain((prev) => !prev);
      }
    } else {
      setMessages((prev) => [...prev, newMessageRecieved]);
    }
  };

  socket.on("message recieved", handleMessageReceived);

  return () => {
    socket.off("message recieved", handleMessageReceived);
  };
}, [notification, fetchAgain, setUnreadCounts]);

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <Flex alignItems="center" gap={3}>
                  <Avatar
                    size="sm"
                    name={otherUser?.name}
                    src={
                      otherUser?.pic ===
                      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                        ? ""
                        : otherUser?.pic
                    }
                  >
                    <AvatarBadge
                      boxSize="1em"
                      bg={isUserOnline(otherUser?._id) ? "green.500" : "gray.400"}
                    />
                  </Avatar>
                  <Box flex="1">
                    <Text fontWeight="bold">{getSender(user, selectedChat.users)}</Text>
                    <Text
                      fontSize="xs"
                      color={
                        isUserOnline(getSenderFull(user, selectedChat.users)?._id)
                          ? "green.500"
                          : "gray.500"
                      }
                    >
                      {isUserOnline(getSenderFull(user, selectedChat.users)?._id)
                        ? "Online"
                        : "Offline"}
                    </Text>
                  </Box>
                  <ProfileModal user={otherUser} />
                </Flex>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="space-between"
            p={3}
            bg={panelBg}
            w="100%"
            h="100%"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
            overflow="hidden"
          >
            <Box flex="1" mb={3} overflowY="auto" bg={shellBg} borderRadius="2xl" p={4}>
              {loading ? (
                <Spinner
                  size="xl"
                  w={20}
                  h={20}
                  alignSelf="center"
                  margin="auto"
                />
              ) : (
                <div className="messages">
                  <ScrollableChat messages={messages} />
                </div>
              )}
            </Box>

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
            >
              <Box
                bg={formBg}
                borderRadius="2xl"
                p={4}
                borderWidth="1px"
                borderColor={borderColor}
              >
              {istyping ? (
                <Box mb={3}>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </Box>
              ) : null}
              <Box d="flex" alignItems="center" gap={2}>
                <Input
                  type="file"
                  p={1.5}
                  style={{ display: "none" }}
                  id="file-input"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      setLoading(true);
                      const config = {
                        headers: {
                          "Content-type": "multipart/form-data",
                          Authorization: `Bearer ${user.token}`,
                        },
                      };
                      const { data: fileUrl } = await axios.post(
                        "/api/upload",
                        formData,
                        config
                      );

                      const messageConfig = {
                        headers: {
                          "Content-type": "application/json",
                          Authorization: `Bearer ${user.token}`,
                        },
                      };

                      const type = file.type.split("/")[0];
                      let fileType = "file";
                      if (type === "image") fileType = "image";
                      else if (type === "video") fileType = "video";

                      const { data } = await axios.post(
                        "/api/message",
                        {
                          content: "",
                          fileUrl: fileUrl,
                          fileType: fileType,
                          chatId: selectedChat,
                        },
                        messageConfig
                      );

                      socket.emit("new message", data);
                      setMessages([...messages, data]);
                      setLoading(false);
                    } catch (error) {
                      setLoading(false);
                      toast({
                        title: "Error Uploading File",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                      });
                    }
                  }}
                />
                <IconButton
                  d={{ base: "flex" }}
                  icon={<AttachmentIcon />}
                  onClick={() => document.getElementById("file-input").click()}
                  mr={2}
                />
                <Button
                  variant="ghost"
                  minW="40px"
                  px={0}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  mr={2}
                >
                  😀
                </Button>
                <Textarea
                  ref={inputRef}
                  resize="vertical"
                  minH="12"
                  maxH="40"
                  variant="filled"
                  bg="gray.100"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                  onSelect={updateSelection}
                  onClick={updateSelection}
                  onKeyUp={updateSelection}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage(event);
                    }
                  }}
                />
              </Box>
              {showEmojiPicker && (
                <Box position="relative" mt={2} zIndex={10}>
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                  />
                </Box>
              )}
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Flex
          alignItems="center"
          justifyContent="center"
          h="100%"
          flexDir="column"
          bg="gray.50"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.200"
          shadow="sm"
          p={8}
          textAlign="center"
        >
          <ChatIcon boxSize={14} color="gray.300" mb={4} />
          <Text fontSize="xl" color="gray.400" fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Flex>
      )}
    </>
  );
};

export default SingleChat;
