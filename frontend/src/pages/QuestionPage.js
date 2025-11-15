import React, { useState, useEffect } from "react";
import { Box, Heading, Text, Table, Thead, Tr, Th, Tbody, Td, useColorMode, Flex } from "@chakra-ui/react";
import ChatBox from "../components/ChatBox";
import CodeEditor from "../components/CodeEditor"
import {getNextQuestion} from "../api/questionsApi";

function QuestionPage() {
    const [question, setQuestion] = useState(null);
    const [code] = useState("");
    const [language] = useState("python");
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const { colorMode } = useColorMode();

    useEffect(() => {
        getNextQuestion()
            .then((res) => setQuestion(res.data))
            .catch((err) => console.error("Failed to fetch question:", err));
    }, []);


    return (
        <Flex height="100vh" overflow="hidden">
            {/* LEFT SIDE — Question, Editor, and Results */}
            <Box flex="2" p={6} overflowY="auto">

                <Text fontSize="xl" mb={3}>
                    {question ? question.prompt : "Loading question..."}
                </Text>

                <CodeEditor question={question}/>

                {output && (
                    <Box mt={6}>
                        <Heading size="md" mb={2}>
                            Results
                        </Heading>
                        {output.allPassed ? (
                            <Text color="green.400" fontWeight="bold">
                                ✅ All test cases passed!
                            </Text>
                        ) : (
                            <Box>
                                <Text color="red.400" fontWeight="bold" mb={2}>
                                    ❌ Some test cases failed:
                                </Text>
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Input</Th>
                                            <Th>Expected</Th>
                                            <Th>Your Output</Th>
                                            <Th>Status</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {output.results.map((r, i) => (
                                            <Tr key={i}>
                                                <Td>{r.input || "(none)"}</Td>
                                                <Td>{r.expected || "(empty)"}</Td>
                                                <Td>{r.actual || "(empty)"}</Td>
                                                <Td color={r.correct ? "green.400" : "red.400"}>
                                                    {r.correct ? "✅ Correct" : "❌ Incorrect"}
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

            {/* RIGHT SIDE — ChatBox */}
            <Box flex="1" borderLeft="1px solid" borderColor="gray.600" bg={colorMode === "dark" ? "gray.800" : "gray.50"}>
                <ChatBox />
            </Box>
        </Flex>
    );
}

export default QuestionPage;
