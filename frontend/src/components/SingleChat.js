import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    IconButton,
    Text,
    Spinner,
    FormControl,
    Input,
    useToast,
    Avatar,
    Tooltip,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    HStack,
} from "@chakra-ui/react";
import {
    ArrowBackIcon,
    ArrowRightIcon,
    PhoneIcon,
} from "@chakra-ui/icons";
import {
    FaVideo,
    FaSmile,
    FaPaperclip,
    FaEllipsisV,
    FaMicrophone,
    FaMicrophoneSlash,
} from "react-icons/fa";
import { ChatState } from "../Context/ChatProvider";
import { getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import axios from "axios";
import io from "socket.io-client";
import "./styles.css";
import EmojiPicker from "emoji-picker-react";

const ENDPOINT = "http://localhost:5000";
let socket;

const SingleChat = ({ fetchAgain, setFetchAgain, messages, setMessages }) => {
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    const { user, selectedChat, setSelectedChat, connectedUsers } = ChatState();
    const toast = useToast();

    const selectedChatRef = useRef(selectedChat);

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: require("../animations/typing.json"),
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        return () => {
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
        fetchMessages();
    }, [selectedChat]);

    useEffect(() => {
        if (!socket) return;

        const messageHandler = (newMsg) => {
            if (!selectedChatRef.current || selectedChatRef.current._id !== newMsg.chat._id) {
                // Ici tu peux gérer les notifications pour messages hors chat courant
            } else {
                setMessages((prevMessages) => [...prevMessages, newMsg]);
            }
        };

        socket.on("message received", messageHandler);

        return () => {
            socket.off("message received", messageHandler);
        };
    }, [setMessages]);

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
            socket.emit("join chat", selectedChat._id);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les messages",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const sendMessage = async (eventOrClick) => {
        if ((eventOrClick.key === "Enter" || eventOrClick.type === "click") && newMessage.trim() !== "") {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.post(
                    "/api/message",
                    { content: newMessage.trim(), chatId: selectedChat._id },
                    config
                );
                setNewMessage("");
                setMessages((prev) => [...prev, data]);
                socket.emit("new message", data);
            } catch (error) {
                toast({
                    title: "Erreur",
                    description: error.response?.data?.message || "Erreur inconnue",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }

        let lastTypingTime = new Date().getTime();
        setTimeout(() => {
            let timeNow = new Date().getTime();
            if (timeNow - lastTypingTime >= 3000 && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, 3000);
    };

    // Gestion enregistrement audio inchangée, idem pour le rendu JSX...

    const handleMicroClick = async () => {
        if (isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                let chunks = [];

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) chunks.push(event.data);
                };

                recorder.onstop = async () => {
                    const audioBlob = new Blob(chunks, { type: "audio/webm" });
                    const file = new File([audioBlob], "audio-message.webm", { type: "audio/webm" });

                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("chatId", selectedChat._id);

                    try {
                        const config = {
                            headers: {
                                Authorization: `Bearer ${user.token}`,
                                "Content-Type": "multipart/form-data",
                            },
                        };
                        const { data } = await axios.post("/api/message/upload", formData, config);
                        setMessages((prev) => [...prev, data]);
                        socket.emit("new message", data);
                    } catch {
                        toast({
                            title: "Erreur d'envoi audio",
                            description: "Le message vocal n'a pas pu être envoyé.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                };

                recorder.start();
                setMediaRecorder(recorder);
                setIsRecording(true);
            } catch {
                toast({
                    title: "Micro non autorisé",
                    description: "Impossible de démarrer l'enregistrement vocal.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    if (!selectedChat) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                <Text fontSize="2xl" fontFamily="Work sans">Sélectionnez un utilisateur pour commencer</Text>
            </Box>
        );
    }

    const recipient = !selectedChat.isGroupChat ? getSenderFull(user, selectedChat.users) : null;
    const isOnline = recipient && connectedUsers?.some((u) => u._id === recipient._id);

    return (
        <Box display="flex" flexDir="column" h="100%" w="100%" position="relative">
            {/* Header */}
            <Box px={4} py={3} display="flex" alignItems="center" justifyContent="space-between" borderBottom="1px solid #e0e0e0">
                <Box display="flex" alignItems="center" gap={4}>
                    <IconButton display={{ base: "flex", md: "none" }} icon={<ArrowBackIcon />} onClick={() => setSelectedChat("")} />
                    <Avatar size="md" name={selectedChat.isGroupChat ? selectedChat.chatName : recipient?.name} src={recipient?.pic} />
                    <Box>
                        <Text fontWeight="bold">{!selectedChat.isGroupChat ? recipient?.name : selectedChat.chatName}</Text>
                        {!selectedChat.isGroupChat && (
                            <HStack spacing={2} align="center">
                                <Box w="8px" h="8px" borderRadius="full" bg={isOnline ? "green.400" : "gray.400"} />
                                <Text fontSize="xs" color="gray.500">{isOnline ? "En ligne" : "Hors ligne"}</Text>
                            </HStack>
                        )}
                    </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                    <Tooltip label="Appel audio"><IconButton icon={<PhoneIcon />} size="sm" variant="ghost" /></Tooltip>
                    <Tooltip label="Appel vidéo"><IconButton icon={<FaVideo />} size="sm" variant="ghost" /></Tooltip>
                    <Menu>
                        <MenuButton as={IconButton} icon={<FaEllipsisV />} variant="ghost" />
                        <MenuList>
                            {!selectedChat.isGroupChat
                                ? <MenuItem><ProfileModal user={recipient} /></MenuItem>
                                : <MenuItem><UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} /></MenuItem>}
                        </MenuList>
                    </Menu>
                </Box>
            </Box>

            {/* Messages */}
            <Box flex="1" p={4} overflowY="auto" bg="#f8f8f8">
                {loading ? <Spinner size="xl" alignSelf="center" /> : <ScrollableChat messages={messages} user={user} chat={selectedChat} />}
                {isTyping && <Box mt={2}><Lottie options={defaultOptions} width={70} /></Box>}
            </Box>

            {/* Input */}
            <FormControl isRequired mt={2} px={4} pb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Input
                        type="file"
                        accept="image/*,audio/*,video/*,application/pdf"
                        display="none"
                        id="file-upload"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append("file", file);
                            formData.append("chatId", selectedChat._id);

                            try {
                                const config = {
                                    headers: {
                                        Authorization: `Bearer ${user.token}`,
                                        "Content-Type": "multipart/form-data",
                                    },
                                };
                                const { data } = await axios.post("/api/message/upload", formData, config);
                                setMessages((prev) => [...prev, data]);
                                socket.emit("new message", data);
                            } catch {
                                toast({
                                    title: "Erreur d'envoi",
                                    description: "Le fichier n'a pas pu être envoyé.",
                                    status: "error",
                                    duration: 5000,
                                    isClosable: true,
                                });
                            }
                        }}
                    />
                    <label htmlFor="file-upload">
                        <IconButton as="span" icon={<FaPaperclip />} colorScheme="gray" aria-label="Ajouter un fichier" variant="ghost" />
                    </label>
                    <IconButton icon={isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />} colorScheme={isRecording ? "red" : "gray"} aria-label="Micro" variant="ghost" onClick={handleMicroClick} />
                    <IconButton icon={<FaSmile />} onClick={() => setShowEmoji(!showEmoji)} colorScheme="gray" variant="ghost" />
                    <Input
                        flex="1"
                        variant="filled"
                        bg="#E0E0E0"
                        placeholder="Écrivez un message..."
                        onChange={typingHandler}
                        value={newMessage}
                        onKeyDown={sendMessage}
                    />
                    {newMessage && (
                        <IconButton colorScheme="blue" aria-label="Envoyer" icon={<ArrowRightIcon />} onClick={(e) => sendMessage({ type: "click" })} />
                    )}
                </Box>
                {showEmoji && (
                    <Box position="absolute" bottom="70px" right="50px" zIndex="10">
                        <EmojiPicker onEmojiClick={(emojiData) => setNewMessage((prev) => prev + emojiData.emoji)} />
                    </Box>
                )}
            </FormControl>
        </Box>
    );
};

export default SingleChat;
