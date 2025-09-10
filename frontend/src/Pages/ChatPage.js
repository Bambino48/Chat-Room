import { useState } from "react";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import UserDetailsPanel from "../components/miscellaneous/UserDetailsPanel";
import GroupDetailsPanel from "../components/miscellaneous/GroupDetailsPanel";

function ChatPage() {
    const { user, selectedChat } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);
    const [messages, setMessages] = useState([]);
    const isMobile = useBreakpointValue({ base: true, md: false });

    return (
        <Box width="100vw" height="100vh" overflow="hidden">
            <Box display="flex" flexDir="row" height="100%" width="100%">
                {/* ✅ Barre latérale */}
                {user && (
                    <Box
                        width={{ base: "60px", md: "90px" }}
                        height="100%"
                        bg="gray.50"
                        borderRight="1px solid #ccc"
                        display="flex"
                        flexDirection="column"
                    >
                        <SideDrawer />
                    </Box>
                )}

                {/* ✅ Liste des conversations */}
                {user && (!isMobile || !selectedChat) && (
                    <Box
                        width={{ base: "100%", md: "350px" }}
                        height="100%"
                        bg="white"
                        borderRight={{ base: "none", md: "1px solid #ccc" }}
                        overflowY="auto"
                        display="flex"
                        flexDirection="column"
                    >
                        <MyChats fetchAgain={fetchAgain} />
                    </Box>
                )}

                {/* ✅ Zone de chat */}
                {user && (!isMobile || selectedChat) && (
                    <Box
                        flex="1"
                        height="100%"
                        bg="gray.100"
                        overflow="hidden"
                        display="flex"
                        flexDirection="column"
                    >
                        <ChatBox
                            fetchAgain={fetchAgain}
                            setFetchAgain={setFetchAgain}
                            messages={messages}
                            setMessages={setMessages}
                        />
                    </Box>
                )}

                {/* ✅ Détails utilisateur ou groupe */}
                {user && !isMobile && selectedChat && (
                    <Box
                        width="300px"
                        height="100%"
                        bg="white"
                        borderLeft="1px solid #ccc"
                        overflowY="auto"
                        display="flex"
                        flexDirection="column"
                    >
                        {selectedChat.isGroupChat ? (
                            <GroupDetailsPanel chat={selectedChat} messages={messages} />
                        ) : (
                            selectedChat.users && (
                                <UserDetailsPanel
                                    user={selectedChat.users.find((u) => u._id !== user._id)}
                                    messages={messages}
                                    selectedChat={selectedChat}
                                />
                            )
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default ChatPage;
