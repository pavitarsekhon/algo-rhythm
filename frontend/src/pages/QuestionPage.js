import React, { useState, useEffect } from "react";
import { Badge, Box, Flex, Heading, Stack } from "@chakra-ui/react";
import ChatBox from "../components/ChatBox";
import CodeEditor from "../components/CodeEditor";
import FormattedQuestion from "../components/FormattedQuestion";
import { getCurrentQuestion, getNextQuestion } from "../api/questionsApi";
import { useNavigate } from "react-router-dom";

function QuestionPage() {
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [editorRef, setEditorRef] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        // Load the user's current question on page load
        getCurrentQuestion()
            .then((res) => setQuestion(res.data))
            .catch((err) => console.error("Failed to fetch current question:", err));
    }, [navigate]);

    const loadNextQuestion = () => {
        // Only called when "Next Question" button is clicked
        getNextQuestion()
            .then((res) => setQuestion(res.data))
            .catch((err) => console.error("Failed to fetch next question:", err));
    };

    const getDifficultyClass = (difficulty) => {
        return difficulty?.toLowerCase() || "";
    };

    return (
        <Flex
            h="100dvh"
            bg="#0b1220"
            backgroundImage="radial-gradient(circle at 15% 20%, rgba(56, 189, 248, 0.1), transparent 30%)"
            fontFamily="'JetBrains Mono', monospace"
        >
            <Box flex="2" p={10} overflowY="auto">
                <Stack spacing={6}>
                    <Box bg="rgba(15, 23, 42, 0.9)" borderRadius="16px" p={8} boxShadow="xl" borderWidth="1px" borderColor="whiteAlpha.200">
                        <Flex justify="space-between" align="flex-start" mb={5} gap={4}>
                            <Heading size="md" color="white">
                            {question?.topics ? question.topics.split('|')[0] : "Loading..."}
                            </Heading>
                        {question?.difficulty && (
                            <Badge
                                px={4}
                                py={1.5}
                                borderRadius="full"
                                textTransform="capitalize"
                                fontSize="xs"
                                fontWeight="semibold"
                                colorScheme={
                                    getDifficultyClass(question.difficulty) === "easy"
                                        ? "green"
                                        : getDifficultyClass(question.difficulty) === "medium"
                                            ? "orange"
                                            : "red"
                                }
                                variant="subtle"
                            >
                                {question.difficulty}
                            </Badge>
                        )}
                        </Flex>
                        <FormattedQuestion content={question?.prompt} />
                    </Box>

                    <Box bg="rgba(15, 23, 42, 0.9)" borderRadius="16px" p={8} boxShadow="xl" borderWidth="1px" borderColor="whiteAlpha.200">
                        <CodeEditor question={question} onNextQuestion={loadNextQuestion} onEditorRef={setEditorRef} />
                    </Box>
                </Stack>
            </Box>

            <Box w="420px" borderLeftWidth="1px" borderColor="whiteAlpha.200" bg="rgba(2, 6, 23, 0.92)">
                <ChatBox editorRef={editorRef} />
            </Box>
        </Flex>
    );
}

export default QuestionPage;

