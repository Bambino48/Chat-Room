import {
    Box,
    Avatar,
    Text,
    Divider,
    VStack,
    AvatarGroup,
    Spinner,
    Image,
    Link,
    SimpleGrid,
} from "@chakra-ui/react";

const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
const isAudio = (filename) => /\.(webm|mp3|wav|ogg)$/i.test(filename);
const isVideo = (filename) => /\.(mp4|webm|mov)$/i.test(filename);
const isPDF = (filename) => /\.pdf$/i.test(filename);
const isLink = (text) => /https?:\/\/[^\s]+/i.test(text);

const formatUrl = (url) => {
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
};

const GroupDetailsPanel = ({ chat, messages }) => {
    if (!chat || !chat.users) {
        return (
            <Box p={4} textAlign="center">
                <Spinner size="lg" />
                <Text mt={2}>Chargement du salon...</Text>
            </Box>
        );
    }

    // Messages du groupe en cours
    const chatMessages = messages?.filter(
        (m) => m.chat && m.chat._id === chat._id
    );

    const mediaMessages = chatMessages?.filter(
        (m) => isImage(m.content) || isVideo(m.content)
    );

    const fileMessages = chatMessages?.filter(
        (m) =>
            isPDF(m.content) || /\.(docx?|xlsx?|zip|rar)$/i.test(m.content)
    );

    const linkMessages = chatMessages?.filter((m) => isLink(m.content));

    return (
        <Box p={4} overflowY="auto" height="100%" bg="white">
            {/* ✅ Infos du groupe */}
            <VStack spacing={2} mb={4}>
                <Avatar size="xl" name={chat.chatName} />
                <Text fontWeight="bold" fontSize="lg">
                    {chat.chatName}
                </Text>
                <Text fontSize="sm" color="gray.500">
                    Groupe de discussion
                </Text>
            </VStack>

            <Divider />

            {/* ✅ Membres */}
            <Box mt={4}>
                <Text fontWeight="semibold" mb={2}>
                    Membres ({chat.users.length})
                </Text>
                <AvatarGroup size="md" max={6}>
                    {chat.users.map((u) => (
                        <Avatar
                            key={u._id}
                            name={u.name}
                            src={u.pic}
                            title={u.name}
                        />
                    ))}
                </AvatarGroup>
            </Box>

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

export default GroupDetailsPanel;
