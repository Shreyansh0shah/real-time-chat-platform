import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { Avatar, AvatarBadge } from "@chakra-ui/avatar";
import { Box, Flex, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { formatChatTimestamp, getSender, getSenderFull } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Badge, Button, Input, InputGroup, InputLeftElement, useColorModeValue } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [chatFilter, setChatFilter] = useState("All");

  const { selectedChat, setSelectedChat, user, chats, setChats, notification, setNotification, unreadCounts, setUnreadCounts, isUserOnline } = ChatState();
  const bg = useColorModeValue("white", "slate.900");
  const cardBg = useColorModeValue("slate.50", "slate.800");
  const textColor = useColorModeValue("slate.800", "slate.100");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const selectedBg = useColorModeValue("slate.100", "slate.800");
  const selectedBorderColor = useColorModeValue("teal.400", "teal.300");
  const hoverBg = useColorModeValue("gray.100", "slate.800");
  const statusTextColor = useColorModeValue("gray.500", "gray.400");
  const timestampColor = useColorModeValue("gray.500", "gray.400");

  const filteredChats = useMemo(() => {
    if (!chats) return [];
    return chats
      .filter((chat) => {
        if (chatFilter === "Unread") {
          return (unreadCounts?.[chat._id] || 0) > 0;
        }
        if (chatFilter === "Groups") {
          return chat.isGroupChat;
        }
        return true;
      })
      .filter((chat) => {
        const chatName = chat.isGroupChat
          ? chat.chatName
          : getSender(loggedUser, chat.users);
        return chatName?.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [chats, chatFilter, searchQuery, loggedUser, unreadCounts]);

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="stretch"
      p={4}
      bg={bg}
      w={{ base: "100%", md: "31%" }}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Box
        pb={4}
        px={4}
        display="flex"
        flexDir="column"
        w="100%"
        gap={4}
      >
        <Flex alignItems="center" justifyContent="space-between" gap={3}>
          <Box>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="semibold" color={textColor}>
              Chats
            </Text>
            {/* <Text fontSize="sm" color={subTextColor}> 
              Search conversations and stay organized 
            </Text> */}
          </Box>
          <GroupChatModal>
            <Button size="sm" rightIcon={<AddIcon />}>
              New Group
            </Button>
          </GroupChatModal>
        </Flex>

        <InputGroup>
          <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.400" />} />
          <Input
            variant="filled"
            bg={cardBg}
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            focusBorderColor="teal.400"
          />
        </InputGroup>

        <Flex gap={2} wrap="wrap">
          {['All', 'Unread', 'Groups'].map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={chatFilter === filter ? 'solid' : 'outline'}
              colorScheme={chatFilter === filter ? 'teal' : 'gray'}
              onClick={() => setChatFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </Flex>
      </Box>

      <Box
        flex="1"
        p={3}
        bg={cardBg}
        w="100%"
        borderRadius="2xl"
        overflowY="auto"
      >
        {chats ? (
          <Stack spacing={3}>
            {chats.map((chat, index) => {
              const chatId = chat?._id ?? `chat-${index}`;
              const isSelected = selectedChat?._id === chat?._id;
              const latestContent = chat?.latestMessage?.content?.trim();
              const latestMessageText = latestContent
                ? latestContent.length > 50
                  ? `${latestContent.substring(0, 50)}...`
                  : latestContent
                : "No messages yet";
              const latestTimestamp = chat?.latestMessage?.createdAt;
              const otherUser = !chat?.isGroupChat
                ? getSenderFull(loggedUser, chat?.users)
                : null;
              const unreadCount = unreadCounts?.[chat?._id] || 0;

              return (
                <Box
                  key={chatId}
                  onClick={() => {
                    setSelectedChat(chat);
                    setUnreadCounts((prev) => ({
                      ...prev,
                      [chat?._id]: 0,
                    }));
                  }}
                  cursor="pointer"
                  bg={isSelected ? selectedBg : bg}
                  color={textColor}
                  px={4}
                  py={4}
                  borderRadius="2xl"
                  borderLeft={isSelected ? "4px solid" : "1px solid"}
                  borderLeftColor={isSelected ? selectedBorderColor : "transparent"}
                  borderWidth="1px"
                  borderColor={isSelected ? selectedBorderColor : borderColor}
                  _hover={{ bg: hoverBg }}
                >
                  <Flex alignItems="center" gap={3} mb={2}>
                    {!chat?.isGroupChat && (
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
                    )}
                    <Box flex="1">
                      <Text fontWeight="semibold" color={textColor}>
                        {!chat?.isGroupChat
                          ? getSender(loggedUser, chat?.users)
                          : chat?.chatName}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={chat?.isGroupChat ? statusTextColor : isUserOnline(otherUser?._id) ? "green.400" : statusTextColor}
                      >
                        {chat?.isGroupChat ? "Group chat" : isUserOnline(otherUser?._id) ? "Online" : "Offline"}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="xs" color={timestampColor}>
                        {formatChatTimestamp(latestTimestamp)}
                      </Text>
                      {unreadCount > 0 && (
                        <Badge colorScheme="teal" borderRadius="full" px={2} mt={1}>
                          {unreadCount}
                        </Badge>
                      )}
                    </Box>
                  </Flex>
                  <Text fontSize="xs" color="gray.600">
                    {chat?.latestMessage?.sender?.name && latestContent
                      ? `${chat.latestMessage.sender.name} : ${latestMessageText}`
                      : latestMessageText}
                  </Text>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
