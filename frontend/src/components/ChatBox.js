import { useState, useEffect, useRef } from "react";
import { sendChatMessage } from "../api/chatApi";

function ChatBox() {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat]);

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = message;
        setMessage("");
        setChat(prev => [...prev, { user: userMessage, bot: null }]);
        setIsLoading(true);

        try {
            console.log("User message:", userMessage)
            const res = await sendChatMessage(userMessage);
            console.log("Response:", res)
            setChat(prev => {
                const updated = [...prev];
                updated[updated.length - 1].bot = res.data.reply;
                return updated;
            });
        } catch (err) {
            console.error("Chat error:", err);
            setChat(prev => {
                const updated = [...prev];
                updated[updated.length - 1].bot = "Sorry, I encountered an error. Please try again.";
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: "white"
        }}>
            {/* Header */}
            <div style={{
                padding: "24px",
                borderBottom: "1px solid #e5e7eb"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px"
                    }}>
                        🤖
                    </div>
                    <div>
                        <div style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#1a1a1a"
                        }}>
                            AlgoBot
                        </div>
                        <div style={{
                            fontSize: "13px",
                            color: "#6b7280"
                        }}>
                            Your AI Coding Assistant
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px"
            }}>
                {chat.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "#9ca3af"
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>💡</div>
                        <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
                            Need help? Ask me for hints, explanations, or coding tips!
                        </p>
                    </div>
                ) : (
                    <div>
                        {chat.map((msg, i) => (
                            <div key={i} style={{ marginBottom: "24px" }}>
                                {/* User Message */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginBottom: "12px"
                                }}>
                                    <div style={{
                                        maxWidth: "80%",
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        color: "white",
                                        padding: "12px 16px",
                                        borderRadius: "16px",
                                        borderBottomRightRadius: "4px",
                                        fontSize: "14px",
                                        lineHeight: "1.5"
                                    }}>
                                        {msg.user}
                                    </div>
                                </div>

                                {/* Bot Message */}
                                {msg.bot ? (
                                    <div style={{ display: "flex" }}>
                                        <div style={{
                                            maxWidth: "80%",
                                            background: "#f3f4f6",
                                            color: "#1f2937",
                                            padding: "12px 16px",
                                            borderRadius: "16px",
                                            borderBottomLeftRadius: "4px",
                                            fontSize: "14px",
                                            lineHeight: "1.5",
                                            whiteSpace: "pre-wrap"
                                        }}>
                                            {msg.bot}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex" }}>
                                        <div style={{
                                            background: "#f3f4f6",
                                            padding: "12px 16px",
                                            borderRadius: "16px",
                                            display: "flex",
                                            gap: "4px"
                                        }}>
                                            <span style={{
                                                animation: "pulse 1.4s infinite",
                                                color: "#9ca3af"
                                            }}>●</span>
                                            <span style={{
                                                animation: "pulse 1.4s infinite 0.2s",
                                                color: "#9ca3af"
                                            }}>●</span>
                                            <span style={{
                                                animation: "pulse 1.4s infinite 0.4s",
                                                color: "#9ca3af"
                                            }}>●</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div style={{
                padding: "20px",
                borderTop: "1px solid #e5e7eb"
            }}>
                <div style={{ display: "flex", gap: "12px" }}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        placeholder="Ask for a hint or explanation..."
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: "12px 16px",
                            fontSize: "14px",
                            border: "2px solid #e5e7eb",
                            borderRadius: "10px",
                            outline: "none",
                            transition: "all 0.3s"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#667eea"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        style={{
                            padding: "12px 24px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "white",
                            background: isLoading
                                ? "#9ca3af"
                                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "none",
                            borderRadius: "10px",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            transition: "all 0.3s"
                        }}
                        onMouseOver={(e) => {
                            if (!isLoading) {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                            }
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                        }}
                    >
                        {isLoading ? "..." : "Send"}
                    </button>
                </div>
                <p style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    marginTop: "8px",
                    marginBottom: 0,
                    textAlign: "center"
                }}>
                    Press Enter to send
                </p>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default ChatBox;