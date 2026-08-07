import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  const isImage = (fileType) => fileType === "image";
  const isVideo = (fileType) => fileType === "video";

  const getFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:5001${url}`;
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
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
              style={{
                backgroundColor:
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0",
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* MESSAGE / FILE */}
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
                  <a
                    href={getFileUrl(m.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        textDecoration: "underline",
                        color: "blue",
                        cursor: "pointer",
                      }}
                    >
                      📄 Download File
                    </div>
                  </a>
                )
              ) : (
                <span>{m.content}</span>
              )}

              {/* ✔✔ SEEN / BLUE TICK */}
              {m.sender._id === user._id && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: "12px",
                    color: m.isSeen ? "#0a9cb9ff" : "gray",
                  }}
                >
                  
                </span>
              )}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;