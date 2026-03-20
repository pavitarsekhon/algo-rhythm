import { useState } from "react";
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Grid,
    Heading,
    Input,
    Select,
    Stack,
    Text,
} from "@chakra-ui/react";
import API from "../api/axiosConfig";

const LANGUAGE_OPTIONS = [
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "php", label: "PHP" }
];

function HomePage() {
    const [mode, setMode] = useState("initial"); // "initial", "login", "register"
    const [error, setError] = useState("");

    // Login form state
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register form state
    const [registerForm, setRegisterForm] = useState({
        username: "",
        password: "",
        age: "",
        experienceLevel: "",
        knownLanguages: []
    });

    const handleRegisterChange = (e) => {
        const { name, value, selectedOptions } = e.target;
        const fieldValue = name === "knownLanguages"
            ? Array.from(selectedOptions, (option) => option.value)
            : value;

        setRegisterForm({ ...registerForm, [name]: fieldValue });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await API.post("/auth/login", {
                username: loginUsername,
                password: loginPassword
            });
            localStorage.setItem("token", response.data.token);
            window.location.href = "/dashboard";
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await API.post("/auth/register", {
                username: registerForm.username,
                password: registerForm.password,
                age: registerForm.age ? parseInt(registerForm.age) : null,
                experienceLevel: registerForm.experienceLevel,
                knownLanguages: registerForm.knownLanguages.join(",")
            });

            // Auto login after registration
            const response = await API.post("/auth/login", {
                username: registerForm.username,
                password: registerForm.password
            });
            localStorage.setItem("token", response.data.token);
            window.location.href = "/dashboard";
        } catch (err) {
            setError("Registration failed — username may already exist.");
        }
    };

    return (
        <Box
            minH="100vh"
            bg="#0b1220"
            backgroundImage="radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.12), transparent 32%)"
            py={8}
            px={4}
            fontFamily="'JetBrains Mono', monospace"
        >
            <Container maxW="5xl" h="full" display="flex" alignItems="center" justifyContent="center">
                <Box
                    w="100%"
                    maxW={mode === "register" ? "560px" : "480px"}
                    bg="rgba(15, 23, 42, 0.9)"
                    borderWidth="1px"
                    borderColor="whiteAlpha.200"
                    borderRadius="2xl"
                    p={{ base: 6, md: 10 }}
                    boxShadow="0 24px 80px rgba(2, 6, 23, 0.7)"
                    transition="all 0.2s ease"
                >
                    <Stack spacing={6}>
                        <Stack spacing={2} textAlign="center">
                            <Heading color="cyan.300" fontSize={{ base: "3xl", md: "4xl" }}>
                                AlgoRhythm
                            </Heading>
                            <Text color="gray.300" fontSize="sm">
                                {mode === "initial" && "Your AI-powered coding tutor"}
                                {mode === "login" && "Welcome back. Continue your streak."}
                                {mode === "register" && "Create your account and start solving."}
                            </Text>
                        </Stack>

                        {mode === "initial" && (
                            <Stack spacing={3}>
                                <Button
                                    onClick={() => setMode("login")}
                                    bg="cyan.600"
                                    color="white"
                                    size="lg"
                                    _hover={{ transform: "translateY(-2px)", bg: "cyan.500", boxShadow: "0 10px 30px rgba(56, 189, 248, 0.25)" }}
                                >
                                    Get Started ->
                                </Button>
                            </Stack>
                        )}

                        {mode === "login" && (
                            <Stack as="form" spacing={4} onSubmit={handleLogin}>
                                <FormControl>
                                    <FormLabel color="gray.300">Username</FormLabel>
                                    <Input
                                        value={loginUsername}
                                        onChange={(e) => setLoginUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        bg="whiteAlpha.100"
                                        borderColor="whiteAlpha.300"
                                        color="white"
                                        _placeholder={{ color: "gray.400" }}
                                        _focus={{ borderColor: "cyan.300", boxShadow: "0 0 0 1px #67e8f9" }}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel color="gray.300">Password</FormLabel>
                                    <Input
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        bg="whiteAlpha.100"
                                        borderColor="whiteAlpha.300"
                                        color="white"
                                        _placeholder={{ color: "gray.400" }}
                                        _focus={{ borderColor: "cyan.300", boxShadow: "0 0 0 1px #67e8f9" }}
                                    />
                                </FormControl>

                                {error && <Box bg="red.900" borderWidth="1px" borderColor="red.500" color="red.200" p={3} borderRadius="md" fontSize="sm">{error}</Box>}

                                <Button type="submit" bg="cyan.600" color="white" _hover={{ bg: "cyan.500" }}>
                                    Sign In
                                </Button>
                                <Text color="gray.400" fontSize="sm" textAlign="center">
                                    Don't have an account?{" "}
                                    <Text
                                        as="button"
                                        color="cyan.300"
                                        onClick={() => {
                                            setMode("register");
                                            setError("");
                                        }}
                                    >
                                        Sign Up
                                    </Text>
                                </Text>
                            </Stack>
                        )}

                        {mode === "register" && (
                            <Stack as="form" spacing={4} onSubmit={handleRegister}>
                                <FormControl>
                                    <FormLabel color="gray.300">Username</FormLabel>
                                    <Input
                                        name="username"
                                        value={registerForm.username}
                                        onChange={handleRegisterChange}
                                        placeholder="Choose a username"
                                        bg="whiteAlpha.100"
                                        borderColor="whiteAlpha.300"
                                        color="white"
                                        _placeholder={{ color: "gray.400" }}
                                        _focus={{ borderColor: "cyan.300", boxShadow: "0 0 0 1px #67e8f9" }}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel color="gray.300">Password</FormLabel>
                                    <Input
                                        type="password"
                                        name="password"
                                        value={registerForm.password}
                                        onChange={handleRegisterChange}
                                        placeholder="Choose a password"
                                        bg="whiteAlpha.100"
                                        borderColor="whiteAlpha.300"
                                        color="white"
                                        _placeholder={{ color: "gray.400" }}
                                        _focus={{ borderColor: "cyan.300", boxShadow: "0 0 0 1px #67e8f9" }}
                                    />
                                </FormControl>

                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                    <FormControl>
                                        <FormLabel color="gray.300">Age (optional)</FormLabel>
                                        <Input
                                            type="number"
                                            name="age"
                                            value={registerForm.age}
                                            onChange={handleRegisterChange}
                                            placeholder="18"
                                            bg="whiteAlpha.100"
                                            borderColor="whiteAlpha.300"
                                            color="white"
                                            _placeholder={{ color: "gray.400" }}
                                            _focus={{ borderColor: "cyan.300", boxShadow: "0 0 0 1px #67e8f9" }}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel color="gray.300">Experience</FormLabel>
                                        <Select
                                            name="experienceLevel"
                                            value={registerForm.experienceLevel}
                                            onChange={handleRegisterChange}
                                            placeholder="Select..."
                                            bg="whiteAlpha.100"
                                            borderColor="whiteAlpha.300"
                                            color="white"
                                            _focus={{ borderColor: "cyan.300", boxShadow: "0 0 0 1px #67e8f9" }}
                                        >
                                            <option style={{ color: "#111827" }} value="Beginner">Beginner</option>
                                            <option style={{ color: "#111827" }} value="Intermediate">Intermediate</option>
                                            <option style={{ color: "#111827" }} value="Advanced">Advanced</option>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <FormControl>
                                    <FormLabel color="gray.300">Known Languages</FormLabel>
                                    <Select
                                        name="knownLanguages"
                                        value={registerForm.knownLanguages}
                                        onChange={handleRegisterChange}
                                        multiple
                                        h="140px"
                                        bg="whiteAlpha.100"
                                        borderColor="whiteAlpha.300"
                                        color="white"
                                        _focus={{ borderColor: "cyan.300", boxShadow: "0 0 0 1px #67e8f9" }}
                                    >
                                        {LANGUAGE_OPTIONS.map((language) => (
                                            <option style={{ color: "#111827" }} key={language.value} value={language.value}>
                                                {language.label}
                                            </option>
                                        ))}
                                    </Select>
                                    <Text mt={2} fontSize="xs" color="gray.400">
                                        Use Cmd/Ctrl + click to select multiple languages.
                                    </Text>
                                </FormControl>

                                {error && <Box bg="red.900" borderWidth="1px" borderColor="red.500" color="red.200" p={3} borderRadius="md" fontSize="sm">{error}</Box>}

                                <Button type="submit" bg="cyan.600" color="white" _hover={{ bg: "cyan.500" }}>
                                    Create Account
                                </Button>
                                <Text color="gray.400" fontSize="sm" textAlign="center">
                                    Already have an account?{" "}
                                    <Text
                                        as="button"
                                        color="cyan.300"
                                        onClick={() => {
                                            setMode("login");
                                            setError("");
                                        }}
                                    >
                                        Sign In
                                    </Text>
                                </Text>
                            </Stack>
                        )}

                        {mode !== "initial" && (
                            <Button
                                variant="ghost"
                                color="gray.300"
                                alignSelf="flex-start"
                                onClick={() => {
                                    setMode("initial");
                                    setError("");
                                }}
                                _hover={{ bg: "whiteAlpha.100" }}
                            >
                                Back
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}

export default HomePage;
