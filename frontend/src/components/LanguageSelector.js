import { useState } from "react";
import { LANGUAGE_VERSIONS } from "../constants";

const languages = Object.entries(LANGUAGE_VERSIONS);

const LanguageSelector = ({ language, onSelect }) => {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ position: "relative", display: "inline-block", marginBottom: "16px" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    padding: "8px 14px",
                    fontSize: "14px",
                    borderRadius: "8px",
                    background: "#aba8a8",
                    border: "1px solid #d1d5db",
                    cursor: "pointer",
                    fontWeight: "600",
                    textTransform: "capitalize"
                }}
            >
                {language}
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        marginTop: "6px",
                        borderRadius: "8px",
                        background: "white",
                        border: "1px solid #d1d5db",
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                        width: "140px",
                        zIndex: 20,
                        overflow: "hidden",
                    }}
                >
                    {languages.map(([lang, version]) => {
                        const isActive = lang === language;
                        return (
                            <div
                                key={lang}
                                onClick={() => {
                                    onSelect(lang);
                                    setOpen(false);
                                }}
                                style={{
                                    padding: "10px 12px",
                                    background: isActive ? "#eef2ff" : "white",
                                    color: isActive ? "#4338ca" : "#111827",
                                    fontWeight: isActive ? "600" : "normal",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "14px",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                                onMouseLeave={(e) => e.currentTarget.style.background = isActive ? "#eef2ff" : "white"}
                            >
                                <span>{lang}</span>
                                <span style={{ color: "#6b7280", fontSize: "12px" }}>({version})</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
