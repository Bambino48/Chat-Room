import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    useToast,
    useDisclosure,
    IconButton,
    Avatar,
} from "@chakra-ui/react";
import { FiSettings } from "react-icons/fi";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";

const UpdateProfileModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, setUser } = ChatState();
    const toast = useToast();

    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [pic, setPic] = useState(user.pic);
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(
                "/api/user/update",
                { name, email, pic, password },
                config
            );

            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data);
            toast({
                title: "Profil mis à jour",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
        } catch (err) {
            toast({
                title: "Erreur",
                description: err.response?.data?.message || "Erreur de mise à jour",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
    };

    return (
        <>
            <IconButton
                icon={<FiSettings />}
                aria-label="Réglages"
                variant="ghost"
                fontSize="20px"
                onClick={onOpen}
            />

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Modifier mon profil</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={3}>
                            <FormLabel>Nom</FormLabel>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Email</FormLabel>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Photo de profil (URL)</FormLabel>
                            <Input value={pic} onChange={(e) => setPic(e.target.value)} />
                            <Avatar src={pic} name={name} mt={2} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Nouveau mot de passe</FormLabel>
                            <Input
                                type="password"
                                placeholder="Laisser vide pour ne pas changer"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="teal" mr={3} onClick={handleSubmit}>
                            Enregistrer
                        </Button>
                        <Button onClick={onClose}>Annuler</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UpdateProfileModal;
