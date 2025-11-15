import { useState, useEffect, useRef } from "react";
import { useColorModeValue } from "@chakra-ui/react";
import { sendChatMessage } from "../api/chatApi";

function ChatBox() {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const messagesEndRef = useRef(null);
    const bgColor = useColorModeValue("gray.50", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("black", "white");


    // ✅ Auto-scroll to bottom when chat updates
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat]);

    const handleSend = async () => {
        if (!message.trim()) return;
        try {
            const res = await sendChatMessage(message);
            setChat([...chat, { user: message, bot: res.data.reply }]);
            setMessage("");
        } catch (err) {
            console.error("Chat error:", err);
        }
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            borderLeft: `1px solid ${borderColor}`,
            padding: "20px",
            backgroundColor: bgColor,
            color: textColor
        }}>
            <h3 style={{ marginBottom: "15px", fontSize: "18px", fontWeight: "600" }}>
                Ask AlgoBot 💬
            </h3>

            {/* Chat message area */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                marginBottom: "15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                backgroundColor: "black"
            }}>
                {chat.map((msg, i) => (
                    <div key={i} style={{ marginBottom: "1rem" }}>
                        <p><strong>You:</strong> {msg.user}</p>
                        <p><strong>Bot:</strong> {msg.bot}</p>
                    </div>
                ))}
                {/* invisible anchor for auto-scroll */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input and send button */}
            <div style={{ display: "flex", gap: "10px", backgroundColor: bgColor}}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask for a hint..."
                    style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                    }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default ChatBox;
