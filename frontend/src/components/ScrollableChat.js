import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import { Box, Text } from "@chakra-ui/layout";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
  getMessageDayLabel,
  formatMessageTime,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages, searchTerm, searchTargetId }) => {
  const { user } = ChatState();

  const isImage = (fileType) => fileType === "image";
  const isVideo = (fileType) => fileType === "video";

  const getFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:5001${url}`;
  };

  const shouldShowDayDivider = (currentMessage, index) => {
    if (!currentMessage) return false;
    if (index === 0) return true;
    const previousMessage = messages[index - 1];
    if (!previousMessage) return true;
    return getMessageDayLabel(currentMessage.createdAt) !== getMessageDayLabel(previousMessage.createdAt);
  };

  const highlightText = (text) => {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.split(regex).map((fragment, idx) =>
      regex.test(fragment) ? (
        <mark key={idx} style={{ backgroundColor: "rgba(245, 158, 11, 0.35)", padding: "0 2px" }}>
          {fragment}
        </mark>
      ) : (
        <span key={idx}>{fragment}</span>
      )
    );
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => {
          const dayDivider = shouldShowDayDivider(m, i);
          const isMatch = searchTerm && m.content?.toLowerCase().includes(searchTerm.toLowerCase());
          return (
            <div key={m._id} style={{ width: "100%" }}>
              {dayDivider && (
                <Box textAlign="center" my={4}>
                  <Text fontSize="sm" color="gray.500" fontWeight="semibold">
                    {getMessageDayLabel(m.createdAt)}
                  </Text>
                </Box>
              )}
              <div style={{ display: "flex", width: "100%" }}>
                {(isSameSender(messages, m, i, user._id) ||
                  isLastMessage(messages, i, user._id)) && (
                  <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                    <Avatar
                      mt="7px"
                      mr={1}
                      size="sm"
                      cursor="pointer"
                      name={m.sender.name}
                      src={
                        m.sender.pic ===
                        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                          ? ""
                          : m.sender.pic
                      }
                    />
                  </Tooltip>
                )}

                <span
                  id={isMatch ? `match-${m._id}` : undefined}
                  style={{
                    backgroundColor:
                      m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0",
                    marginLeft: isSameSenderMargin(messages, m, i, user._id),
                    marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                    borderRadius: "20px",
                    padding: "10px 15px",
                    maxWidth: "75%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    boxShadow: isMatch ? "0 0 0 1px rgba(245, 158, 11, 0.5)" : "none",
                  }}
                >
                  {m.fileUrl ? (
                    isImage(m.fileType) ? (
                      <img
                        src={getFileUrl(m.fileUrl)}
                        alt="attachment"
                        style={{ maxWidth: "200px", borderRadius: "10px" }}
                      />
                    ) : isVideo(m.fileType) ? (
                      <video
                        src={getFileUrl(m.fileUrl)}
                        controls
                        style={{ maxWidth: "200px", borderRadius: "10px" }}
                      />
                    ) : (
                      <span>{highlightText(m.content)}</span>
                    )
                  ) : (
                    <span>{highlightText(m.content)}</span>
                  )}

                  <Text fontSize="xs" color="gray.500" mt={2}>
                    {formatMessageTime(m.createdAt)}
                  </Text>
                </span>
              </div>
            </div>
          );
        })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;