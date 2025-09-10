import React from "react";
import { useState } from "react";
import {
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    VStack
} from "@chakra-ui/react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";

const Login = () => {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState(false);

    const toast = useToast();
    const history = useHistory();

    const handleClick = () => setShow(!show);

    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: "Veuillez remplir tous les champs",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };
            const { data } = await axios.post(
                "/api/user/login",
                { email, password },
                config
            );
            toast({
                title: "Connexion réussie",
                description: "Bienvenue !",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            history.push("/chats");
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
            return;
        }
    };

    return <VStack spacing="5px" color="black">
        <FormControl id="email" isRequired>
            <FormLabel>Adresse email</FormLabel>
            <Input placeholder="Entrez votre email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="password" isRequired>
            <FormLabel>Mot de passe</FormLabel>
            <InputGroup>
                <Input type={show ? "text" : "password"} placeholder="Entrez votre mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
                <InputRightElement>
                    <Button h="1.75rem" size="sm" mr="4px" onClick={handleClick}>
                        {show ? "Cacher" : "Afficher"}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>

        <Button colorScheme="blue" width="100%" style={{ marginTop: 15 }} onClick={submitHandler} isLoading={loading}>
            Connexion
        </Button>
        <Button variant="solid" colorScheme="red" width="100%" onClick={() => {
            setEmail("ibamba366@gmail.com");
            setPassword("12345678");
        }}>
            Obtenir les identifiants invité
        </Button>
    </VStack>;
}

export default Login;
