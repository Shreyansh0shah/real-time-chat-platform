import { Avatar, AvatarBadge } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
import { ChatState } from "../../Context/ChatProvider";

const UserListItem = ({ user, handleFunction }) => {
  const { isUserOnline } = ChatState();
  const isOnline = isUserOnline(user._id);

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      d="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={
          user.pic ===
            "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
            ? ""
            : user.pic
        }
      >
        <AvatarBadge boxSize="1em" bg={isOnline ? "green.500" : "gray.400"} />
      </Avatar>
      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs" color={isOnline ? "green.500" : "gray.500"}>
          {isOnline ? "Online" : "Offline"}
        </Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {user.email}
        </Text>
        <Text fontSize="xs">
          <b>Username : </b>
          {user.username}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
