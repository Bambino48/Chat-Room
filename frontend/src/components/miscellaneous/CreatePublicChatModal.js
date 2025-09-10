import React, { useState } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Button, Input, useToast,
} from "@chakra-ui/react";
import axios from 'axios';
import { ChatState } from '../../Context/ChatProvider';

const CreatePublicChatModal = ({ isOpen, onClose, fetchAgain, setFetchAgain }) => {
    const [chatName, setChatName] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, setChats } = ChatState();
    const toast = useToast();

    const handleCreate = async () => {
        if (!chatName.trim()) {
            toast({
                title: "Veuillez entrer un nom pour le salon",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        setLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('/api/chat/public', { name: chatName }, config);
            setChats(prev => [data, ...prev]);
            setChatName('');
            toast({
                title: "Salon public créé avec succès",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setFetchAgain(!fetchAgain);
            onClose();
        } catch (error) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Erreur lors de la création",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Créer un salon public</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Input
                        placeholder="Nom du salon"
                        value={chatName}
                        onChange={(e) => setChatName(e.target.value)}
                    />
                </ModalBody>

                <ModalFooter>
                    <Button onClick={handleCreate} isLoading={loading} colorScheme="teal">
                        Créer
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreatePublicChatModal;
