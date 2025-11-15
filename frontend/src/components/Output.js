import {Box, Button, Text, HStack, useToast} from "@chakra-ui/react";
import {runSourceCode, submitCode} from "../api/questionsApi";
import {useState} from "react";

const Output = ({ editorRef, language, question }) => {

    const toast = useToast();
    const [output, setOutput] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    // ✅ FIXED submit function
    const submitSourceCode = async () => {
        const sourceCode = editorRef.current.getValue();
        if (!sourceCode) return;

        setIsLoading(true);
        try {
            const result = await submitCode(language, sourceCode, question);
            setSubmitResult(result);
        } catch (error) {
            setSubmitResult({ error: "Submission failed" });
        } finally {
            setIsLoading(false);
        }
    };

    const runCode = async () => {
        const sourceCode = editorRef.current.getValue();
        if (!sourceCode) return;

        setIsLoading(true);
        try {
            const result = await runSourceCode(language, sourceCode);

            const stdout = result.data.stdout || "";
            const stderr = result.data.stderr || "";

            if (stderr) {
                setIsError(true);
                setOutput(stderr.split("\n"));
            } else {
                console.log("Result from Judge0:", result)
                setIsError(false);
                setOutput(stdout.split("\n"));
            }

        } catch (error) {
            toast({
                title: "An error occurred.",
                description: error.message || "Unable to run code",
                status: "error",
                duration: 6000
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box w="50%">
            <HStack spacing={2} mb={4}>
                <Button variant='outline' colorScheme='green' isLoading={isLoading} onClick={runCode}>
                    Run code
                </Button>
                <Button variant='outline' colorScheme='blue' isLoading={isLoading} onClick={submitSourceCode}>
                    Submit
                </Button>
            </HStack>

            {/* ✅ Submit Results Box (Moved below buttons) */}
            {submitResult && (
                <Box mt={4} p={3} border="1px solid gray" borderRadius="md">
                    {submitResult.error ? (
                        <Text color="red.400">{submitResult.error}</Text>
                    ) : submitResult.allPassed ? (
                        <Text color="green.400" fontWeight="bold">✅ All test cases passed!</Text>
                    ) : (
                        <Box>
                            <Text fontWeight="bold" mb={2}>❌ Some test cases failed:</Text>
                            {submitResult.results.map((r, i) => (
                                <Box key={i} mb={2}>
                                    <Text>Input: {r.input}</Text>
                                    <Text>Expected: {r.expected}</Text>
                                    <Text>Your Output: {r.actual}</Text>
                                    <Text color={r.correct ? "green.300" : "red.400"}>
                                        {r.correct ? "✅ Correct" : "❌ Incorrect"}
                                    </Text>
                                    <hr />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            )}

            {/* ▶️ Run Output Box */}
            <Box
                height="30vh"
                mt={4}
                p={2}
                border="1px solid"
                overflowY="auto"
                bg="#212121"
                borderRadius={4}
                fontFamily="'Consolas', 'Monaco', 'Lucida Console', monospace"
                fontSize="14px"
                color={isError ? "red.400" : ""}
                borderColor={isError ? "red.500" : "#333"}
            >
                {output ?
                    output.map((line, i) => <Text key={i}>{line}</Text>) :
                    'Click "Run Code" to see the output here'}
            </Box>
        </Box>
    );
};

export default Output;
