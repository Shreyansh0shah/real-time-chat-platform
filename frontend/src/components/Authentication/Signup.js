import { Button } from "@chakra-ui/button";
import {
  FormControl,
  FormLabel,
  FormHelperText,
} from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import { useHistory } from "react-router";
import { ChatState } from "../../Context/ChatProvider";

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const history = useHistory();

  const { setUser } = ChatState();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [username, setUsername] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);

  const submitHandler = async () => {
    setPicLoading(true);

    if (!name || !email || !username || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    if (emailError) {
      setPicLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    try {
      const config = {
        headers: { "Content-type": "application/json" },
      };

      const { data } = await axios.post(
        "/api/user",
        { name, email, username, password, pic },
        config
      );

      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setPicLoading(false);
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);

    if (!pics) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "piyushproj");

      fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch(() => setPicLoading(false));
    } else {
      toast({
        title: "Please Select a JPEG or PNG Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
  };

  return (
    <VStack spacing="5px">
      {/* NAME */}
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>

      {/* USERNAME */}
      <FormControl isRequired>
        <FormLabel>Username</FormLabel>
        <Input
          placeholder="Enter Your Username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </FormControl>

      {/* EMAIL WITH INLINE ERROR */}
      <FormControl isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email Address"
          onChange={(e) => {
            const value = e.target.value;
            setEmail(value);

            if (!value) {
              setEmailError("Email is required");
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              setEmailError("Example: user@example.com");
            } else {
              setEmailError("");
            }
          }}
        />

        {emailError && (
          <FormHelperText fontSize="xs" color="red.400">
            {emailError}
          </FormHelperText>
        )}
      </FormControl>

     {/* PASSWORD */}
<FormControl isRequired>
  <FormLabel>Password</FormLabel>

  <InputGroup size="md">
    <Input
      type={show ? "text" : "password"}
      placeholder="Enter Password"
      onChange={(e) => {
        const value = e.target.value;
        setPassword(value);

        if (!value) {
          setPasswordError("Password is required");
        } else if (value.length < 6) {
          setPasswordError("Example: Minimum 6 characters");
        } else {
          setPasswordError("");
        }
      }}
    />

    <InputRightElement width="4.5rem">
      <Button h="1.75rem" size="sm" onClick={handleClick}>
        {show ? "Hide" : "Show"}
      </Button>
    </InputRightElement>
  </InputGroup>

  {passwordError && (
    <FormHelperText fontSize="xs" color="red.400">
      {passwordError}
    </FormHelperText>
  )}
</FormControl>


      {/* CONFIRM PASSWORD */}
      <FormControl isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {/* IMAGE */}
      <FormControl>
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        mt={3}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
