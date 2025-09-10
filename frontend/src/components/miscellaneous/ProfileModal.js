import React from "react";
import { IconButton, useDisclosure } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Image, Text } from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {

    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            {
                children ? <span onClick={onOpen}>{children}</span> : (
                    <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
                )
            }
            <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent h="410px">
                    <ModalHeader fontSize="40px" fontFamily="Work sans" d="flex" justifyContent="center">{user.name}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={4}
                    >
                        <Image
                            borderRadius="full"
                            boxSize="150px"
                            src={user.pic}
                            alt={user.name}
                            mx="auto"
                        />
                        <Text fontSize={{ base: "28px", md: "30px" }} fontFamily="Work Sans">
                            Email : {user.email}
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Fermer
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ProfileModal;
