// // import React from "react";
// // import ScrollableFeed from "react-scrollable-feed";
// // import { isSameUser } from "../config/ChatLogics";
// // import { ChatState } from "../Context/ChatProvider";
// // import { Avatar, Tooltip } from "@chakra-ui/react";

// // const ScrollableChat = ({ messages }) => {
// //     const { user } = ChatState();

// //     const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

// //     // ✅ Affiche "HH:mm" si aujourd'hui, sinon "dd/mm/yyyy à HH:mm"
// //     const formatTimestamp = (dateString) => {
// //         const date = new Date(dateString);
// //         const now = new Date();

// //         const sameDay =
// //             date.getDate() === now.getDate() &&
// //             date.getMonth() === now.getMonth() &&
// //             date.getFullYear() === now.getFullYear();

// //         const hours = date.getHours().toString().padStart(2, "0");
// //         const minutes = date.getMinutes().toString().padStart(2, "0");

// //         if (sameDay) {
// //             return `${hours}:${minutes}`;
// //         } else {
// //             const day = date.getDate().toString().padStart(2, "0");
// //             const month = (date.getMonth() + 1).toString().padStart(2, "0");
// //             const year = date.getFullYear();
// //             return `${day}/${month}/${year} à ${hours}:${minutes}`;
// //         }
// //     };

// //     return (
// //         <ScrollableFeed>
// //             {messages &&
// //                 messages.map((m, i) => {
// //                     const isUser = m.sender._id === user._id;

// //                     return (
// //                         <div
// //                             key={m._id}
// //                             style={{
// //                                 display: "flex",
// //                                 flexDirection: isUser ? "row-reverse" : "row",
// //                                 alignItems: "flex-end",
// //                                 marginBottom: isSameUser(messages, m, i) ? 2 : 15,
// //                             }}
// //                         >
// //                             {/* Avatar */}
// //                             <div
// //                                 style={{
// //                                     minWidth: "40px",
// //                                     marginLeft: isUser ? "8px" : 0,
// //                                     marginRight: isUser ? 0 : "8px",
// //                                 }}
// //                             >
// //                                 {(!isSameUser(messages, m, i) || i === 0) && (
// //                                     <Tooltip
// //                                         label={m.sender.name}
// //                                         placement={isUser ? "bottom-end" : "bottom-start"}
// //                                         hasArrow
// //                                     >
// //                                         <Avatar
// //                                             mt="7px"
// //                                             size="sm"
// //                                             cursor="pointer"
// //                                             name={m.sender.name}
// //                                             src={m.sender.pic}
// //                                         />
// //                                     </Tooltip>
// //                                 )}
// //                             </div>

// //                             {/* Message + Heure/Date */}
// //                             <div
// //                                 style={{
// //                                     display: "flex",
// //                                     flexDirection: "column",
// //                                     alignItems: isUser ? "flex-end" : "flex-start",
// //                                     maxWidth: "75%",
// //                                 }}
// //                             >
// //                                 {/* Bulle message */}
// //                                 <span
// //                                     style={{
// //                                         backgroundColor: isUser ? "#BEE3F8" : "#B9F5D0",
// //                                         borderRadius: "20px",
// //                                         padding: "5px 15px",
// //                                         wordBreak: "break-word",
// //                                         fontSize: "14px",
// //                                     }}
// //                                 >
// //                                     {m.type === "file" ? (
// //                                         isImage(m.content) ? (
// //                                             <img
// //                                                 src={m.content}
// //                                                 alt="envoyé"
// //                                                 style={{ maxWidth: "200px", borderRadius: "10px" }}
// //                                             />
// //                                         ) : (
// //                                             <a
// //                                                 href={m.content}
// //                                                 target="_blank"
// //                                                 rel="noreferrer"
// //                                                 style={{ color: "#2B6CB0", textDecoration: "underline" }}
// //                                             >
// //                                                 📎 {m.content.split("/").pop()}
// //                                             </a>
// //                                         )
// //                                     ) : (
// //                                         m.content
// //                                     )}
// //                                 </span>

// //                                 {/* Timestamp */}
// //                                 <span
// //                                     style={{
// //                                         fontSize: "11px",
// //                                         color: "gray",
// //                                         marginTop: "2px",
// //                                         userSelect: "none",
// //                                         opacity: 0.7,
// //                                     }}
// //                                 >
// //                                     {formatTimestamp(m.createdAt)}
// //                                 </span>
// //                             </div>
// //                         </div>
// //                     );
// //                 })}
// //         </ScrollableFeed>
// //     );
// // };

// // export default ScrollableChat;

import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { isSameUser } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import {
    Avatar,
    Tooltip,
    Box,
    Text,
    Link,
    Image,
} from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {
    const { user } = ChatState();

    const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
    const isAudio = (filename) => /\.(webm|mp3|wav|ogg)$/i.test(filename);
    const isVideo = (filename) => /\.(mp4|webm|mov)$/i.test(filename);
    const isPDF = (filename) => /\.pdf$/i.test(filename);

    const formatTimestamp = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const sameDay =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        if (sameDay) {
            return `${hours}:${minutes}`;
        } else {
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year} à ${hours}:${minutes}`;
        }
    };

    const formatUrl = (url) => {
        if (url.startsWith("http")) return url;
        return `http://localhost:5000${url}`;
    };

    return (
        <ScrollableFeed>
            {messages &&
                messages.map((m, i) => {
                    const isUser = m.sender._id === user._id;
                    const content = m.content;

                    return (
                        <Box
                            key={m._id}
                            display="flex"
                            flexDirection={isUser ? "row-reverse" : "row"}
                            alignItems="flex-end"
                            mb={isSameUser(messages, m, i) ? 2 : 4}
                        >
                            {/* Avatar */}
                            <Box minW="40px" ml={isUser ? 2 : 0} mr={isUser ? 0 : 2}>
                                {(!isSameUser(messages, m, i) || i === 0) && (
                                    <Tooltip
                                        label={m.sender.name}
                                        placement={isUser ? "bottom-end" : "bottom-start"}
                                        hasArrow
                                    >
                                        <Avatar
                                            mt="7px"
                                            size="sm"
                                            cursor="pointer"
                                            name={m.sender.name}
                                            src={m.sender.pic}
                                        />
                                    </Tooltip>
                                )}
                            </Box>

                            {/* Message + Timestamp */}
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems={isUser ? "flex-end" : "flex-start"}
                                maxW="75%"
                            >
                                <Box
                                    bg={isUser ? "blue.100" : "green.100"}
                                    borderRadius="2xl"
                                    px={4}
                                    py={2}
                                >
                                    {m.type === "file" || isImage(content) || isAudio(content) || isVideo(content) || isPDF(content) ? (
                                        isImage(content) ? (
                                            <Image
                                                src={formatUrl(content)}
                                                alt="envoyé"
                                                maxW="200px"
                                                borderRadius="md"
                                            />
                                        ) : isAudio(content) ? (
                                            <audio controls>
                                                <source src={formatUrl(content)} />
                                                Votre navigateur ne supporte pas la lecture audio.
                                            </audio>
                                        ) : isVideo(content) ? (
                                            <video controls style={{ maxWidth: "250px", borderRadius: "8px" }}>
                                                <source src={formatUrl(content)} />
                                                Votre navigateur ne supporte pas la lecture vidéo.
                                            </video>
                                        ) : isPDF(content) ? (
                                            <iframe
                                                src={formatUrl(content)}
                                                title="PDF"
                                                style={{ width: "250px", height: "300px", border: "1px solid #ccc", borderRadius: "8px" }}
                                            />
                                        ) : (
                                            <Link
                                                href={formatUrl(content)}
                                                isExternal
                                                color="blue.600"
                                                textDecoration="underline"
                                            >
                                                📎 {content.split("/").pop()}
                                            </Link>
                                        )
                                    ) : (
                                        <Text fontSize="sm">{content}</Text>
                                    )}
                                </Box>
                                <Text fontSize="xs" color="gray.500" mt={1} userSelect="none">
                                    {formatTimestamp(m.createdAt)}
                                </Text>
                            </Box>
                        </Box>
                    );
                })}
        </ScrollableFeed>
    );
};

export default ScrollableChat;

