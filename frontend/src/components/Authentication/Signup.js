import { FormControl, FormLabel, Input, InputGroup, VStack, Button, InputRightElement } from "@chakra-ui/react";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const Signup = () => {

    const [show, setShow] = useState(false);
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    const [pic, setPic] = useState();
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const history = useHistory();

    const handleClick = () => setShow(!show);

    const postDetails = (pics) => {
        setLoading(true);
        if (pics === undefined) {
            toast({
                title: "Veuillez sélectionner une image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "Chat-Room");
            data.append("cloud_name", "dlulaoswj");
            fetch("https://api.cloudinary.com/v1_1/dlulaoswj/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
        } else {
            toast({
                title: "Veuillez sélectionner une image valide",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }
    };

    const submitHandler = async () => {
        setLoading(true);
        if (!name || !email || !password || !confirmpassword) {
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
        if (password !== confirmpassword) {
            toast({
                title: "Les mots de passe ne correspondent pas",
                status: "error",
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
            const { data } = await axios.post("/api/user", { name, email, password, pic }, config);
            toast({
                title: "Inscription réussie",
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
        console.log("User registered:", { name, email, password, pic });
        setLoading(false);
    };

    return <VStack spacing="5px" color="black">
        <FormControl id="first-name" isRequired>
            <FormLabel>Nom</FormLabel>
            <Input placeholder="Entrez votre nom" onChange={(e) => setName(e.target.value)} />
        </FormControl>
        <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input placeholder="Entrez votre email" onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="password" isRequired>
            <FormLabel>Mot de passe</FormLabel>
            <InputGroup>
                <Input type={show ? "text" : "password"} placeholder="Entrez votre mot de passe" onChange={(e) => setPassword(e.target.value)} />
                <InputRightElement>
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                        {show ? "Cacher" : "Afficher"}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>
        <FormControl id="confirmpassword" isRequired>
            <FormLabel>Confirmer le mot de passe</FormLabel>
            <InputGroup>
                <Input type={show ? "text" : "password"} placeholder="Confirmez votre mot de passe" onChange={(e) => setConfirmpassword(e.target.value)} />
                <InputRightElement>
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                        {show ? "Cacher" : "Afficher"}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>

        <FormControl id="pic">
            <FormLabel>Uploader votre photo</FormLabel>
            <Input type="file" p={1.5} accept="image/*" onChange={(e) => postDetails(e.target.files[0])} />
        </FormControl>

        <Button colorScheme="blue" width="100%" style={{ marginTop: 15 }} onClick={submitHandler} isLoading={loading}>
            S'inscrire
        </Button>
    </VStack>;
}

export default Signup;
