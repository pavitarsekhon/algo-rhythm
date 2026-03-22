import React, { useState, useEffect } from "react";
import { Badge, Box, Flex, Heading, Stack } from "@chakra-ui/react";
import ChatBox from "../components/ChatBox";
import CodeEditor from "../components/CodeEditor";
import FormattedQuestion from "../components/FormattedQuestion";
import { getCurrentQuestion, getNextQuestion, getTopicCheckStatus } from "../api/questionsApi";
import { getUserProfile } from "../api/userApi";
import { useNavigate } from "react-router-dom";

function QuestionPage() {
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [editorRef, setEditorRef] = useState(null);
    const [topicProgressMap, setTopicProgressMap] = useState({});
    const [topicCheckPending, setTopicCheckPending] = useState(false);

    const normalizeTopicKey = (topic) =>
        (topic || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        // Load current question and topic-check session state together.
        Promise.all([getCurrentQuestion(), getTopicCheckStatus()])
            .then(([questionResponse, topicCheckStatusResponse]) => {
                const currentQuestion = questionResponse.data;
                setQuestion(currentQuestion);

                const status = topicCheckStatusResponse.data;
                const pending = Boolean(
                    status?.required &&
                    !status?.passed &&
                    status?.currentQuestionId &&
                    currentQuestion?.id === status.currentQuestionId
                );
                setTopicCheckPending(pending);
            })
            .catch((err) => console.error("Failed to initialize question page:", err));

        getUserProfile()
            .then((data) => setTopicProgressMap(data?.progress?.topicProgress || {}))
            .catch((err) => console.error("Failed to fetch topic progress:", err));
    }, [navigate]);

    const loadNextQuestion = () => {
        // Only called when "Next Question" button is clicked
        getNextQuestion()
            .then((res) => {
                setTopicCheckPending(false);
                setQuestion(res.data);
            })
            .catch((err) => console.error("Failed to fetch next question:", err));
    };

    const getDifficultyClass = (difficulty) => {
        return difficulty?.toLowerCase() || "";
    };

    const currentTopic = question?.topics?.split("|")[0]?.trim() || "";
    const currentTopicProgress = topicProgressMap[normalizeTopicKey(currentTopic)];

    const handleTopicProgressUpdate = (topicKey, score) => {
        if (!topicKey) return;
        setTopicProgressMap((prev) => ({ ...prev, [topicKey]: score }));
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
                            <Flex gap={2} wrap="wrap" justify="flex-end">
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
                                {currentTopicProgress !== undefined && (
                                    <Badge
                                        px={4}
                                        py={1.5}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="semibold"
                                        colorScheme="cyan"
                                        variant="subtle"
                                    >
                                        TopicProgress: {currentTopicProgress}%
                                    </Badge>
                                )}
                            </Flex>
                        )}
                        </Flex>
                        <FormattedQuestion content={question?.prompt} />
                    </Box>

                    <Box bg="rgba(15, 23, 42, 0.9)" borderRadius="16px" p={8} boxShadow="xl" borderWidth="1px" borderColor="whiteAlpha.200">
                        <CodeEditor
                            question={question}
                            topicCheckPending={topicCheckPending}
                            onNextQuestion={loadNextQuestion}
                            onEditorRef={setEditorRef}
                            onTopicProgressUpdate={handleTopicProgressUpdate}
                        />
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

