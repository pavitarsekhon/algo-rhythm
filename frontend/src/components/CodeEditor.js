import {Box, VStack} from "@chakra-ui/react";
import {Editor} from "@monaco-editor/react";
import {useRef, useState, useEffect} from "react";
import {PYTHON_SNIPPET} from "../constants";
import Output from "./Output";

const CodeEditor = ({question, onNextQuestion, onEditorRef, onTopicProgressUpdate }) => {
    const editorRef = useRef()
    const [value, setValue] = useState('')

    // Initialize editor with starterCode when question changes
    useEffect(() => {
        if (question?.starterCode) {
            setValue(question.starterCode);
        } else {
            setValue(PYTHON_SNIPPET);
        }
    }, [question]);

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
        onEditorRef(editorRef);
    }


    return (
        <Box>
            <VStack spacing={4}>
                <Box w="100%">
                    <Editor
                        height="300px"
                        theme="vs-dark"
                        language="python"
                        value={value}
                        defaultValue={PYTHON_SNIPPET}
                        onMount={onMount}
                        onChange={(value) => setValue(value)}
                    />
                </Box>
                <Box w="100%">
                    <Output
                        editorRef={editorRef}
                        question={question}
                        onNextQuestion={onNextQuestion}
                        onTopicProgressUpdate={onTopicProgressUpdate}
                    />
                </Box>
            </VStack>
        </Box>
    )
}
export default CodeEditor