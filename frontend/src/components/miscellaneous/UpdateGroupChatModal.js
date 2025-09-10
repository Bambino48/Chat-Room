import React from "react";
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
    Box,
    FormControl,
    Input,
    Spinner,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import { ChatState } from "../../Context/ChatProvider";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
import axios from "axios";

const UpdateGroupChatModal = ({fetchAgain, setFetchAgain, fetchMessages}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [ search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    
    const {selectedChat, setSelectedChat, user} = ChatState();
    const toast = useToast();

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            toast({
                title: "Seuls les admins peuvent retirer quelqu’un !",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                "/api/chat/groupremove",
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );

            user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
            fetchMessages();
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Une erreur est survenue !",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setLoading(false);
        }
    };
    
    const handleRename = async() => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                "/api/chat/rename",
                {
                    chatId: selectedChat._id,
                    chatName: groupChatName,
                },
                config
            );

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
        } catch (error) {
            toast({
                title: "Une erreur est survenue !",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setRenameLoading(false);
        }
        setGroupChatName("");
    };
    
    const handleSearch = async(query) => {
        setSearch(query);
        if (!query) {
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`/api/user?search=${search}`, config);
            console.log(data);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Une erreur est survenue !",
                description: "Impossible de charger les résultats de la recherche",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        };
    };
    
    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "Utilisateur déjà dans le groupe !",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Seuls les admins peuvent ajouter quelqu’un !",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                "/api/chat/groupadd",
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Une erreur est survenue !",
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
            <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen}/>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                            {selectedChat.users.map((u) => (
                                <UserBadgeItem
                                    key={user._id}
                                    user={u}
                                    handleFunction={() => handleRemove(u)}
                                />
                            ))}
                        </Box>
                        <FormControl display="flex">
                            <Input
                                placeholder="Nom du groupe"
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <Button
                                variant="solid"
                                colorScheme="teal"
                                ml={1}
                                isLoading={renameLoading}
                                onClick={handleRename}
                            >
                                Mettre à jour
                            </Button>
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Ajouter un utilisateur au groupe"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        {loading ? (
                            <Spinner size="lg" />
                        ) : (
                            searchResult?.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => handleAddUser(user)}
                                />
                            ))
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={() => handleRemove(user)} colorScheme="red" mr={3}>
                            Quitter le groupe
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
};

export default UpdateGroupChatModal;
