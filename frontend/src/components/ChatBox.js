import React from "react";
import { ChatState } from "../Context/ChatProvider";
import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat";

const ChatBox = ({ fetchAgain, setFetchAgain, messages, setMessages }) => {
    const { selectedChat } = ChatState();

    return (
        <Box
            display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
            alignItems="center"
            flexDir="column"
            p={3}
            bg="white"
            flex="1"                  // ✅ Prend tout l'espace restant
            h="100%"                  // ✅ Hauteur 100%
            borderRadius="lg"
            borderWidth="1px"
        >
            <Box w="100%" h="100%">
                <SingleChat
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    messages={messages}
                    setMessages={setMessages}
                />
            </Box>
        </Box>
    );
};

export default ChatBox;
