import { Box, Flex, Text } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();
  const bg = useColorModeValue("slate.50", "slate.950");
  const panelBg = useColorModeValue("white", "slate.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box bg={bg} minH="100vh" p={{ base: 3, md: 6 }}>
      {user && <SideDrawer />}
      <Box
        maxW="7xl"
        mx="auto"
        bg={panelBg}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
        overflow="hidden"
        h="91.5vh"
      >
        <Box p={{ base: 4, md: 5 }} borderBottomWidth="1px" borderColor={borderColor}>
          <Flex alignItems="center" justifyContent="space-between" gap={4}>
            <Box>
              <Text
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="semibold"
                letterSpacing="tight"
                bgGradient="linear(to-r, teal.300, blue.500)"
                bgClip="text"
              >
                Chatting Platform
              </Text>
              <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}> 
                A polished demo-ready realtime chat experience
              </Text>
            </Box>
          </Flex>
        </Box>

        <Flex h="full" p={{ base: 4, md: 5 }} gap={4}>
          {user && <MyChats fetchAgain={fetchAgain} />}
          {user && (
            <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export default Chatpage;
