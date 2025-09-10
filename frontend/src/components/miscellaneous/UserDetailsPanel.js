import {
    Box,
    Avatar,
    Text,
    Divider,
    VStack,
    Spinner,
    Center,
    Image,
    Link,
    SimpleGrid,
} from "@chakra-ui/react";

const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
const isVideo = (filename) => /\.(mp4|webm|mov)$/i.test(filename);
const isPDF = (filename) => /\.pdf$/i.test(filename);
const isLink = (text) => /https?:\/\/[^\s]+/i.test(text);

const formatUrl = (url) => {
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
};

const UserDetailsPanel = ({ user, messages, selectedChat }) => {
    if (!user || !selectedChat) {
        return (
            <Center p={4} flexDir="column" height="100%">
                <Spinner size="lg" />
                <Text mt={2}>Chargement de l'utilisateur...</Text>
            </Center>
        );
    }

    // Tous les messages du chat actif
    const chatMessages = messages?.filter(
        (m) => m.chat && m.chat._id === selectedChat._id
    );

    // Médias (images + vidéos)
    const mediaMessages = chatMessages?.filter(
        (m) => isImage(m.content) || isVideo(m.content)
    );

    // Fichiers (pdf, doc, etc.)
    const fileMessages = chatMessages?.filter(
        (m) =>
            isPDF(m.content) || /\.(docx?|xlsx?|zip|rar)$/i.test(m.content)
    );

    // Liens
    const linkMessages = chatMessages?.filter((m) => isLink(m.content));

    return (
        <Box p={4} overflowY="auto" height="100%" bg="white">
            {/* ✅ Profil utilisateur */}
            <VStack spacing={3} mb={4}>
                <Avatar size="xl" name={user.name} src={user.pic} />
                <Text fontWeight="bold" fontSize="lg">
                    {user.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                    {user.email}
                </Text>
                <Text fontSize="sm" color="green.500">
                    ● En ligne
                </Text>
            </VStack>

            <Divider my={4} />

            {/* 📸 Médias */}
            <Box mt={4}>
                <Text fontWeight="semibold" fontSize="md" mb={2}>
                    📸 Médias
                </Text>
                {mediaMessages?.length > 0 ? (
                    <SimpleGrid columns={3} spacing={2}>
                        {mediaMessages.map((m) =>
                            isImage(m.content) ? (
                                <Image
                                    key={m._id}
                                    src={formatUrl(m.content)}
                                    alt="media"
                                    borderRadius="md"
                                />
                            ) : (
                                <video
                                    key={m._id}
                                    src={formatUrl(m.content)}
                                    controls
                                    style={{ width: "100%", borderRadius: "8px" }}
                                />
                            )
                        )}
                    </SimpleGrid>
                ) : (
                    <Text fontSize="sm" color="gray.500">
                        Aucun média.
                    </Text>
                )}
            </Box>

            {/* 📁 Fichiers */}
            <Box mt={6}>
                <Text fontWeight="semibold" fontSize="md" mb={2}>
                    📁 Fichiers
                </Text>
                {fileMessages?.length > 0 ? (
                    <VStack align="start" spacing={2}>
                        {fileMessages.map((m) => (
                            <Link
                                key={m._id}
                                href={formatUrl(m.content)}
                                isExternal
                                color="blue.600"
                                fontSize="sm"
                                textDecoration="underline"
                            >
                                📎 {m.content.split("/").pop()}
                            </Link>
                        ))}
                    </VStack>
                ) : (
                    <Text fontSize="sm" color="gray.500">
                        Aucun fichier.
                    </Text>
                )}
            </Box>

            {/* 🔗 Liens */}
            <Box mt={6}>
                <Text fontWeight="semibold" fontSize="md" mb={2}>
                    🔗 Liens
                </Text>
                {linkMessages?.length > 0 ? (
                    <VStack align="start" spacing={2}>
                        {linkMessages.map((m) => (
                            <Link
                                key={m._id}
                                href={m.content}
                                isExternal
                                color="blue.500"
                                fontSize="sm"
                            >
                                🔗 {m.content}
                            </Link>
                        ))}
                    </VStack>
                ) : (
                    <Text fontSize="sm" color="gray.500">
                        Aucun lien.
                    </Text>
                )}
            </Box>
        </Box>
    );
};

export default UserDetailsPanel;
