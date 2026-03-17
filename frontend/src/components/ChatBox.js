import { useState, useEffect, useRef } from "react";
import {
    Avatar,
    Box,
    Button,
    Flex,
    HStack,
    Input,
    Text,
    VStack,
    keyframes,
} from "@chakra-ui/react";
import { sendChatMessage } from "../api/chatApi";
import FormattedMessage from "./FormattedMessage";

const dotPulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

function ChatBox({ editorRef }) {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLogoAvailable, setIsLogoAvailable] = useState(true);
    const messagesEndRef = useRef(null);
    const chatbotLogoSrc = "/chatbot-logo.jpg";

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat]);

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = message;
        const userCode = editorRef?.current?.getValue() || "";

        setMessage("");
        setChat(prev => [...prev, { user: userMessage, bot: null }]);
        setIsLoading(true);

        try {
            console.log("im here 1")
            const res = await sendChatMessage(userMessage, userCode);
            console.log("im here 2")
            setChat(prev => {
                const updated = [...prev];
                updated[updated.length - 1].bot = res.data.reply;
                return updated;
            });

        } catch (err) {
            setChat(prev => {
                const updated = [...prev];
                updated[updated.length - 1].bot = "Error: please try again.";
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Flex direction="column" h="100%" bg="rgba(2, 6, 23, 0.82)">
            <Box p={6} borderBottomWidth="1px" borderColor="whiteAlpha.200">
                <HStack spacing={3} align="center">
                    {isLogoAvailable ? (
                        <Avatar
                            src={chatbotLogoSrc}
                            name="AlgoBot"
                            borderRadius="12px"
                            bg="purple.500"
                            size="md"
                            onError={() => setIsLogoAvailable(false)}
                        />
                    ) : (
                        <Box
                            w="48px"
                            h="48px"
                            borderRadius="12px"
                            bg="cyan.700"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="24px"
                        >
                            <Text>🤖</Text>
                        </Box>
                    )}
                    <Box>
                        <Text fontSize="lg" fontWeight="700" color="gray.100">AlgoBot</Text>
                        <Text fontSize="sm" color="gray.400">Your AI Coding Assistant</Text>
                    </Box>
                </HStack>
            </Box>

            <Box flex="1" overflowY="auto" p={5}>
                {chat.length === 0 ? (
                    <Box textAlign="center" py={16} px={5} color="gray.500">
                        <Text fontSize="48px" mb={4}>💡</Text>
                        <Text fontSize="sm" lineHeight="1.6">
                            Need help? Ask me for hints, explanations, or coding tips!
                        </Text>
                    </Box>
                ) : (
                    <VStack align="stretch" spacing={6}>
                        {chat.map((msg, i) => (
                            <Box key={i}>
                                <Flex justify="flex-end" mb={3}>
                                    <Box
                                        maxW="80%"
                                        bg="cyan.700"
                                        color="white"
                                        px={4}
                                        py={3}
                                        borderRadius="16px"
                                        borderBottomRightRadius="4px"
                                        fontSize="sm"
                                        lineHeight="1.5"
                                    >
                                        {msg.user}
                                    </Box>
                                </Flex>

                                {msg.bot ? (
                                    <Flex>
                                        <Box
                                            maxW="80%"
                                            bg="whiteAlpha.100"
                                            color="gray.100"
                                            p={4}
                                            borderRadius="16px"
                                            borderBottomLeftRadius="4px"
                                            fontSize="sm"
                                            boxShadow="sm"
                                            borderWidth="1px"
                                            borderColor="whiteAlpha.200"
                                        >
                                            <FormattedMessage content={msg.bot} />
                                        </Box>
                                    </Flex>
                                ) : (
                                    <Flex>
                                        <HStack bg="whiteAlpha.100" px={4} py={3} borderRadius="16px" spacing={1}>
                                            <Text animation={`${dotPulse} 1.4s infinite`} color="gray.500">●</Text>
                                            <Text animation={`${dotPulse} 1.4s infinite 0.2s`} color="gray.500">●</Text>
                                            <Text animation={`${dotPulse} 1.4s infinite 0.4s`} color="gray.500">●</Text>
                                        </HStack>
                                    </Flex>
                                )}
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </VStack>
                )}
            </Box>

            <Box p={5} borderTopWidth="1px" borderColor="whiteAlpha.200">
                <HStack spacing={3}>
                    <Input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        placeholder="Ask for a hint or explanation..."
                        disabled={isLoading}
                        size="md"
                        borderWidth="2px"
                        bg="whiteAlpha.100"
                        color="gray.100"
                        borderColor="whiteAlpha.300"
                        _placeholder={{ color: "gray.500" }}
                        _focus={{ borderColor: "cyan.300", boxShadow: "0 0 0 1px #67e8f9" }}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isLoading}
                        color="white"
                        bg={isLoading ? "gray.400" : "cyan.600"}
                        _hover={isLoading ? {} : { transform: "translateY(-2px)", bg: "cyan.500", boxShadow: "0 4px 12px rgba(8, 145, 178, 0.35)" }}
                        _active={{ transform: "translateY(0)" }}
                    >
                        {isLoading ? "..." : "Send"}
                    </Button>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={2} mb={0} textAlign="center">
                    Press Enter to send
                </Text>
            </Box>
        </Flex>
    );
}

export default ChatBox;