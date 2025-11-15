import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Button,
    Heading,
    Text,
    Input,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Link,
    VStack,
    useColorMode,
    useColorModeValue,
    Card,
    CardBody
} from "@chakra-ui/react";

function HomePage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { colorMode, toggleColorMode } = useColorMode();

    const cardBg = useColorModeValue("white", "gray.700");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("http://localhost:8080/api/auth/login", {
                username,
                password
            });

            // Save JWT
            localStorage.setItem("token", response.data.token);

            navigate("/question");
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <Box
            minH="100vh"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            px={4}
        >
            <Heading mb={2} fontSize="4xl">AlgoRhythm</Heading>
            <Text fontSize="lg" mb={8} color="gray.400">
                Welcome to your personalised coding tutor!
            </Text>

            <Card w="350px" bg={cardBg} shadow="lg" borderRadius="lg">
                <CardBody>
                    <form onSubmit={handleLogin}>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Username</FormLabel>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Password</FormLabel>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                />
                            </FormControl>

                            {error && (
                                <Text color="red.300" fontSize="sm">
                                    {error}
                                </Text>
                            )}

                            <Button colorScheme="blue" type="submit" w="100%">
                                Login
                            </Button>

                            <Text fontSize="sm">
                                Don’t have an account?{" "}
                                <Link as={RouterLink} to="/register" color="blue.300">
                                    Register here
                                </Link>
                            </Text>
                        </VStack>
                    </form>
                </CardBody>
            </Card>
        </Box>
    );
}

export default HomePage;
