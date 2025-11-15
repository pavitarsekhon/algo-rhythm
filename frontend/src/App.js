import React from "react";
import { Box, Flex, Heading } from "@chakra-ui/react";
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import QuestionPage from "./pages/QuestionPage";
import ColorModeToggle from "./components/ColorModeToggle";
import HomePage from "./pages/HomePage"; // ✅ add this

function App() {
    return (
        <Router>
            <Box minH="100vh" bg="gray.900" color="white">
                <Flex
                    justify="space-between"
                    align="center"
                    px={6}
                    py={4}
                    borderBottom="1px solid"
                    borderColor="gray.700"
                >
                    <Link to="/">
                        <Heading size="md">AlgoRhythm</Heading>
                    </Link>
                    {/*<ColorModeToggle /> /!* ✅ Toggle button here *!/*/}
                </Flex>

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/question" element={<QuestionPage />} />
                </Routes>
            </Box>
        </Router>
    );
}

export default App;
