import {
    Box,
    IconButton,
    Menu,
    MenuButton,
    Avatar,
    Tooltip,
    MenuList,
    MenuItem,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    useDisclosure,
    Button,
    Text,
    Spinner,
    useToast,
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import {
    FiHome,
    FiStar,
    FiMessageSquare,
    FiLogOut,
    FiSearch,
    FiPlusSquare,
} from "react-icons/fi";
import { ChatState } from "../../Context/ChatProvider";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import CreatePublicChatModal from "./CreatePublicChatModal";
import UpdateProfileModal from "./UpdateProfileModal";

// N'oublie pas d'importer ton modal création salon public ici quand tu l'auras créé
// import CreatePublicChatModal from "./CreatePublicChatModal";

const SideDrawer = () => {
    const {
        user,
        showFavoritesOnly,
        setShowFavoritesOnly,
        setCurrentView,
        setNotification,
        notification,
        setSelectedChat,
        chats,
        setChats,
        fetchAgain,
        setFetchAgain,
    } = ChatState();

    const history = useHistory();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [publicChats, setPublicChats] = useState([]);
    const [loading, setLoading] = useState(false);

    // Nouvel état local pour afficher le modal de création de salon
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const openCreateModal = () => setIsCreateOpen(true);
    const closeCreateModal = () => setIsCreateOpen(false);

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push("/");
    };

    const handleExploreClick = async () => {
        onOpen();
        try {
            setLoading(true);
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get("/api/chat/public-rooms", config);
            const availablePublicGroups = data.filter(
                (chat) =>
                    chat.isGroupChat &&
                    !chat.users.some((u) => u._id.toString() === user._id.toString())
            );

            setPublicChats(data);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de récupérer les salons publics.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const joinGroup = async (chatId) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                "/api/chat/groupadd",
                { chatId, userId: user._id },
                config
            );
            setChats([data, ...chats]);
            setSelectedChat(data);
            toast({
                title: "Salon rejoint",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de rejoindre le salon.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <>
            <Box
                bg="white"
                w="100%"
                h="100%"
                p={4}
                borderRight="1px solid #ccc"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="center"
            >
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Avatar size="md" name={user.name} src={user.pic} />
                </Box>

                <Box display="flex" flexDirection="column" gap={4} alignItems="center">
                    <Tooltip label="Accueil" placement="right">
                        <IconButton
                            icon={<FiHome />}
                            aria-label="Accueil"
                            variant="ghost"
                            fontSize="20px"
                            onClick={() => {
                                window.location.href = "/chats";
                            }}
                        />
                    </Tooltip>

                    <Tooltip label="Favoris" placement="right">
                        <IconButton
                            icon={<FiStar />}
                            aria-label="Favoris"
                            variant={showFavoritesOnly ? "solid" : "ghost"}
                            fontSize="20px"
                            colorScheme={showFavoritesOnly ? "yellow" : "gray"}
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        />
                    </Tooltip>

                    <Tooltip label="Messages" placement="right">
                        <IconButton
                            icon={<FiMessageSquare />}
                            aria-label="Messages"
                            variant="ghost"
                            fontSize="20px"
                            onClick={() => setCurrentView("chat")}
                        />
                    </Tooltip>

                    <Menu>
                        <Tooltip label="Notifications" placement="right">
                            <MenuButton
                                as={IconButton}
                                icon={<BellIcon />}
                                variant="ghost"
                                fontSize="20px"
                                aria-label="Notifications"
                            />
                        </Tooltip>
                        <MenuList pl={2}>
                            {!notification.length && (
                                <MenuItem disabled>Aucune nouvelle notification</MenuItem>
                            )}
                            {notification.map((notif) => (
                                <MenuItem
                                    key={notif._id}
                                    onClick={() => {
                                        setSelectedChat(notif.chat);
                                        setNotification((prev) =>
                                            prev.filter((n) => n._id !== notif._id)
                                        );
                                    }}
                                >
                                    {notif.chat.isGroupChat
                                        ? `Nouveau message dans ${notif.chat.chatName}`
                                        : `Message de ${notif.sender.name}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>

                    <Tooltip label="Explorer" placement="right">
                        <IconButton
                            icon={<FiSearch />}
                            aria-label="Explorer"
                            variant="ghost"
                            fontSize="20px"
                            onClick={handleExploreClick}
                        />
                    </Tooltip>

                    <Tooltip label="Créer un salon public" placement="right">
                        <IconButton
                            icon={<FiPlusSquare />}
                            aria-label="Créer un salon public"
                            variant="ghost"
                            fontSize="20px"
                            onClick={openCreateModal}
                        />
                    </Tooltip>

                    <UpdateProfileModal isOpen={isOpen} onClose={onClose} />
                    
                </Box>

                <Tooltip label="Déconnexion" placement="right">
                    <IconButton
                        icon={<FiLogOut />}
                        colorScheme="gray"
                        onClick={logoutHandler}
                        aria-label="Déconnexion"
                        size="md"
                    />
                </Tooltip>
            </Box>

            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">
                        Explorer les salons publics
                    </DrawerHeader>
                    <DrawerBody>
                        {loading ? (
                            <Spinner />
                        ) : publicChats.length === 0 ? (
                            <Text>Aucun salon public disponible</Text>
                        ) : (
                            publicChats.map((chat) => (
                                <Box
                                    key={chat._id}
                                    display="flex"
                                    alignItems="center"
                                    gap={4}
                                    p={3}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    mb={2}
                                >
                                    {/* ✅ Avatar du salon */}
                                    <Avatar
                                        size="md"
                                        name={chat.chatName}
                                        src={chat.avatar}
                                    />

                                    {/* ✅ Détails du salon */}
                                    <Box flex="1">
                                        <Text fontWeight="bold">{chat.chatName}</Text>
                                        {chat.description && (
                                            <Text fontSize="sm" color="gray.600">
                                                {chat.description}
                                            </Text>
                                        )}
                                    </Box>

                                    {/* ✅ Bouton Rejoindre */}
                                    <Button
                                        size="sm"
                                        colorScheme="teal"
                                        onClick={() => joinGroup(chat._id)}
                                    >
                                        Rejoindre
                                    </Button>
                                </Box>
                            ))
                        )}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <CreatePublicChatModal
                isOpen={isCreateOpen}
                onClose={closeCreateModal}
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
            />
        </>
    );
};

export default SideDrawer;
