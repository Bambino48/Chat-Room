import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Button,
    Stack,
    useToast,
    Text,
    Drawer,
    DrawerBody,
    Spinner,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    Input,
    useDisclosure,
    Tooltip,
    Avatar,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { ChatState } from "../Context/ChatProvider";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import UserListItem from "./UserAvatar/UserListItem";
import io from "socket.io-client";
import axios from "axios";

const ENDPOINT = "http://localhost:5000";
const socket = io(ENDPOINT);

const MyChats = ({ fetchAgain, setFetchAgain }) => {
    const [loggedUser, setLoggedUser] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        isOpen: isGroupOpen,
        onOpen: onGroupOpen,
        onClose: onGroupClose,
    } = useDisclosure();

    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);

    const {
        user,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        showFavoritesOnly,
        setNotification,
        notification,
    } = ChatState();

    const [connectedUsers, setConnectedUsers] = useState([]);
    const toast = useToast();
    const selectedChatRef = useRef(selectedChat);
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        const info = localStorage.getItem("userInfo");
        if (info) {
            setLoggedUser(JSON.parse(info));
        }
        fetchChats();
    }, [fetchAgain]);

    useEffect(() => {
        if (!user) return;
        socket.emit("setup", user);

        socket.on("connected users", (users) => {
            const uniqueUsers = Array.from(new Map(users.map((u) => [u._id, u])).values());
            setConnectedUsers(uniqueUsers);
        });

        const handleMessageReceived = (newMessageReceived) => {
            if (
                !selectedChatRef.current ||
                selectedChatRef.current._id !== newMessageReceived.chat._id
            ) {
                setNotification((prev) => {
                    if (!prev.some((n) => n._id === newMessageReceived._id)) {
                        return [newMessageReceived, ...prev];
                    }
                    return prev;
                });
            }
        };

        socket.on("message received", handleMessageReceived);

        return () => {
            socket.off("connected users");
            socket.off("message received", handleMessageReceived);
        };
    }, [user, setNotification]);

    const fetchChats = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get("/api/chat", config);
            setChats(data);
        } catch (error) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Échec de chargement des chats.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleSearch = async () => {
        if (!search.trim()) {
            toast({
                title: "Entrer un nom ou email",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de rechercher les utilisateurs",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        } finally {
            setLoading(false);
        }
    };

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post("/api/chat", { userId }, config);
            if (!chats.find((c) => c._id === data._id)) {
                setChats([data, ...chats]);
            }
            setSelectedChat(data);
            onClose();
        } catch (error) {
            toast({
                title: "Erreur de discussion",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        } finally {
            setLoadingChat(false);
        }
    };

    const filteredChats = showFavoritesOnly
        ? chats.filter((chat) =>
            chat.favorites?.some((favId) => favId.toString() === loggedUser?._id.toString())
        )
        : chats;

    // 🔔 Fonction pour retirer les notifications d’un chat
    const removeNotificationForChat = (chatId) => {
        setNotification((prev) => prev.filter((notif) => notif.chat._id !== chatId));
    };

    return (
        <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDirection="column"
            height="100%"
            width="100%"
            bg="white"
            borderRadius="lg"
            borderWidth="1px"
            p={4}
        >
            <Box display="flex" justifyContent="space-between" mb={4}>
                <Tooltip label="Rechercher un utilisateur" hasArrow placement="right">
                    <Button variant="outline" onClick={onOpen}>
                        <i className="fas fa-search" style={{ marginRight: "8px" }}></i>
                        <Text display={{ base: "none", md: "inline" }}>Rechercher</Text>
                    </Button>
                </Tooltip>

                <Tooltip label="Créer une nouvelle salle" hasArrow placement="left">
                    <Button colorScheme="teal" onClick={onGroupOpen} leftIcon={<AddIcon />}>
                        <Text display={{ base: "none", md: "inline" }}>Créer une salle</Text>
                    </Button>
                </Tooltip>
            </Box>

            <GroupChatModal
                isOpen={isGroupOpen}
                onClose={onGroupClose}
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
            />

            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">Recherche</DrawerHeader>
                    <DrawerBody>
                        <Box display="flex" pb={2}>
                            <Input
                                placeholder="Nom ou email"
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <Box mb={5}>
                <Text fontSize="md" fontWeight="bold" mb={2}>
                    Online
                </Text>
                <Box display="flex" gap={3} overflowX="auto">
                    {connectedUsers.map((user) => (
                        <Tooltip key={user._id} label={user.name} placement="top">
                            <Avatar
                                size="sm"
                                name={user.name}
                                src={user.pic}
                                border="2px solid green"
                            />
                        </Tooltip>
                    ))}
                </Box>
            </Box>

            <Box flex="1" bg="#fafafa" p={2} borderRadius="lg" overflowY="auto">
                <Text fontSize="md" fontWeight="bold" mb={3}>
                    Messages
                </Text>
                <Stack spacing={3}>
                    {filteredChats ? (
                        filteredChats.map((chat) => {
                            const otherUser = chat.users.find(
                                (u) => u._id !== loggedUser?._id
                            );
                            const isUnread = notification.some(
                                (notif) => notif.chat._id === chat._id
                            );

                            return (
                                <Box
                                    key={chat._id}
                                    onClick={() => {
                                        setSelectedChat(chat);
                                        removeNotificationForChat(chat._id);
                                    }}
                                    cursor="pointer"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    bg={selectedChat === chat ? "#e2f7f6" : "white"}
                                    p={2}
                                    borderRadius="lg"
                                    boxShadow="sm"
                                    transition="0.2s"
                                    _hover={{ bg: "#f1f1f1" }}
                                >
                                    <Box display="flex" alignItems="center">
                                        <Avatar
                                            size="md"
                                            name={chat.isGroupChat ? chat.chatName : otherUser?.name}
                                            src={chat.isGroupChat ? "/group.png" : otherUser?.pic}
                                            mr={3}
                                        />
                                        <Box>
                                            <Text fontWeight="medium">
                                                {chat.isGroupChat ? chat.chatName : otherUser?.name}
                                            </Text>
                                            <Text fontSize="sm" color="gray.500" isTruncated maxW="200px">
                                                {chat.latestMessage?.content || "Pas de message récent"}
                                            </Text>
                                        </Box>
                                    </Box>
                                    {isUnread && (
                                        <Box
                                            bg="green.400"
                                            borderRadius="full"
                                            w="20px"
                                            h="20px"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            color="white"
                                            fontSize="xs"
                                        >
                                            1
                                        </Box>
                                    )}
                                </Box>
                            );
                        })
                    ) : (
                        <ChatLoading />
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default MyChats;

