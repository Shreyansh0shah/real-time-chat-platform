import { AddIcon } from "@chakra-ui/icons";
import { Avatar, AvatarBadge } from "@chakra-ui/avatar";
import { Box, Flex, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats, notification, isUserOnline } = ChatState();

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
      alignItems="center"
      p={4}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      shadow="sm"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        flex="1"
        p={3}
        bg="gray.50"
        w="100%"
        borderRadius="lg"
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
              const otherUser = !chat?.isGroupChat
                ? getSenderFull(loggedUser, chat?.users)
                : null;

              return (
                <Box
                  key={chatId}
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={isSelected ? "blue.50" : "white"}
                  color="black"
                  px={3}
                  py={3}
                  borderRadius="lg"
                  borderLeft={isSelected ? "4px solid" : "1px solid"}
                  borderLeftColor={isSelected ? "teal.400" : "transparent"}
                  borderWidth={isSelected ? "1px" : "1px"}
                  borderColor={isSelected ? "blue.100" : "gray.200"}
                  _hover={{ bg: isSelected ? "blue.50" : "gray.200" }}
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
                    <Box>
                      <Text fontWeight="semibold">
                        {!chat?.isGroupChat
                          ? getSender(loggedUser, chat?.users)
                          : chat?.chatName}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={chat?.isGroupChat ? "gray.500" : isUserOnline(otherUser?._id) ? "green.500" : "gray.500"}
                      >
                        {chat?.isGroupChat ? "Group chat" : isUserOnline(otherUser?._id) ? "Online" : "Offline"}
                      </Text>
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
