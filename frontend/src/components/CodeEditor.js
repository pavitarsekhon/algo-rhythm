import {Box, VStack} from "@chakra-ui/react";
import {Editor} from "@monaco-editor/react";
import {useRef, useState, useEffect} from "react";
import LanguageSelector from "./LanguageSelector";
import {CODE_SNIPPETS} from "../constants";
import Output from "./Output";

const CodeEditor = ({question, onNextQuestion, onEditorRef }) => {
    const editorRef = useRef()
    const [value, setValue] = useState('')
    const [language, setLanguage] = useState('python')

    // Initialize editor with starterCode when question changes
    useEffect(() => {
        if (question?.starterCode) {
            setValue(question.starterCode);
        } else {
            setValue(CODE_SNIPPETS[language]);
        }
    }, [question, language]);

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
        onEditorRef(editorRef);
    }

    const onSelect = (language) => {
        setLanguage(language)
        // Use starterCode if available, otherwise use default snippet
        if (question?.starterCode) {
            setValue(question.starterCode)
        } else {
            setValue(CODE_SNIPPETS[language])
        }
    }
    return (
        <Box>
            <VStack spacing={4}>
                <Box w="100%">
                    <LanguageSelector language={language} onSelect={onSelect}/>
                    <Editor
                        height="300px"
                        theme="vs-dark"
                        language={language}
                        value={value}
                        defaultValue={CODE_SNIPPETS[language]}
                        onMount={onMount}
                        onChange={(value) => setValue(value)}
                    />
                </Box>
                    <Box w="100%" display="flex" justifyContent="flex-start">
                        <Box>
                            <VStack spacing={4}>
                                ...
                                <Output
                                    editorRef={editorRef}
                                    language={language}
                                    question={question}
                                    onNextQuestion={onNextQuestion}
                                />
                            </VStack>
                        </Box>
                    </Box>
            </VStack>
        </Box>
    )
}
export default CodeEditor