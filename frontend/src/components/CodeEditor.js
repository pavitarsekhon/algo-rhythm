import {Box, VStack} from "@chakra-ui/react";
import {Editor} from "@monaco-editor/react";
import {useRef, useState} from "react";
import LanguageSelector from "./LanguageSelector";
import {CODE_SNIPPETS} from "../constants";
import Output from "./Output";
import {HStack} from "@chakra-ui/icons";

const CodeEditor = ({question, onNextQuestion }) => {
    const editorRef = useRef()
    const [value, setValue] = useState('')
    const [language, setLanguage] = useState('python')
    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    }

    const onSelect = (language) => {
        setLanguage(language)
        setValue(CODE_SNIPPETS[language])
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
                                    onNextQuestion={() => {
                                        setValue(""); // Clear editor
                                        onNextQuestion();
                                    }}
                                />
                            </VStack>
                        </Box>
                    </Box>
            </VStack>
        </Box>
    )
}
export default CodeEditor