import React from "react";
import { Button, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export default function ColorModeToggle() {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Button
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
            leftIcon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        >
            {colorMode === "light" ? "Dark Mode" : "Light Mode"}
        </Button>
    );
}
