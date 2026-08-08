import { Box, useColorModeValue } from "@chakra-ui/react";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();
  const bg = useColorModeValue("white", "slate.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={0}
      bg={bg}
      w={{ base: "100%", md: "68%" }}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
