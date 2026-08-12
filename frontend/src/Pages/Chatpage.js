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
  <div style={{ width: "100%" }}>
    {user && <SideDrawer />}

    <Box
      display="flex"
      justifyContent="space-between"
      w="100%"
      h="91.5vh"
      p="10px"
    >
      {user && <MyChats fetchAgain={fetchAgain} />}

      {user && (
        <Chatbox
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
        />
      )}
    </Box>
  </div>
);
};

export default Chatpage;
