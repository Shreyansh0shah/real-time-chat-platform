import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
  Avatar,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import { ChatState } from "../../Context/ChatProvider";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { user: loggedUser, setUser } = ChatState();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${loggedUser.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/user/update",
        {
          name,
          username,
        },
        config
      );

      toast({
        title: "Profile Updated",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setIsEditing(false);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h="410px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            {isEditing ? (
              <Input
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fontSize="40px"
                fontFamily="Work sans"
                textAlign="center"
                w="80%"
              />
            ) : (
              user.name
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            d="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Avatar
              borderRadius="full"
              boxSize="150px"
              src={
                user.pic ===
                  "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                  ? ""
                  : user.pic
              }
              alt={user.name}
              name={user.name}
            />
            <Text
              fontSize={{ base: "28px", md: "30px" }}
              fontFamily="Work sans"
            >
              Email: {user.email}
            </Text>
            {isEditing ? (
              <Input
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fontSize={{ base: "28px", md: "30px" }}
                fontFamily="Work sans"
                textAlign="center"
                w="80%"
              />
            ) : (
              <Text
                fontSize={{ base: "28px", md: "30px" }}
                fontFamily="Work sans"
              >
                Username: {user.username}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            {user._id === loggedUser._id && (
              isEditing ? (
                <>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={handleUpdate}
                    isLoading={loading}
                  >
                    Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                </>
              ) : (
                <Button colorScheme="blue" mr={3} onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )
            )}
            <Button onClick={onClose} ml={3}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
