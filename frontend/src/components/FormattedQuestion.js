import React from 'react';

/**
 * Component to render question prompts with proper formatting
 * Handles examples, constraints, input/output formatting
 */
function FormattedQuestion({ content }) {
    if (!content) return <div>Loading question...</div>;

    const parseQuestion = (text) => {
        const elements = [];

        // Split by common question sections
        const lines = text.split('\n');
        let currentSection = null;
        let sectionContent = [];

        const renderSection = (section, content) => {
            if (!content || content.length === 0) return null;

            return (
                <div key={section} style={{ marginBottom: '20px' }}>
                    {content.map((line, idx) => {
                        // Detect section headers (Example 1:, Example 2:, Constraints:, etc.)
                        const headerMatch = line.match(/^(Example \d+:|Constraints:|Follow[- ]up:|Note:)/i);
                        if (headerMatch) {
                            return (
                                <div
                                    key={`header-${idx}`}
                                    style={{
                                        fontSize: '15px',
                                        fontWeight: '700',
                                        color: '#667eea',
                                        marginTop: idx > 0 ? '16px' : '0',
                                        marginBottom: '8px'
                                    }}
                                >
                                    {line}
                                </div>
                            );
                        }

                        // Detect input/output lines
                        const ioMatch = line.match(/^(Input|Output|Explanation):\s*(.*)$/i);
                        if (ioMatch) {
                            const [, label, value] = ioMatch;
                            return (
                                <div
                                    key={`io-${idx}`}
                                    style={{
                                        display: 'flex',
                                        gap: '8px',
                                        marginBottom: '6px',
                                        fontSize: '14px',
                                        lineHeight: '1.6'
                                    }}
                                >
                                    <span style={{ fontWeight: '600', color: '#374151', minWidth: '90px' }}>
                                        {label}:
                                    </span>
                                    <code style={{
                                        background: '#f3f4f6',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        color: '#1f2937',
                                        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                                        flex: 1
                                    }}>
                                        {value || '(see above)'}
                                    </code>
                                </div>
                            );
                        }

                        // Detect constraint lines (format: "1 <= n <= 100" or "• constraint")
                        const constraintMatch = line.match(/^[\s]*([•\-*]|\d+\.?)\s*(.+)$/);
                        if (constraintMatch && currentSection === 'constraints') {
                            const [, bullet, text] = constraintMatch;
                            return (
                                <div
                                    key={`constraint-${idx}`}
                                    style={{
                                        paddingLeft: '24px',
                                        position: 'relative',
                                        marginBottom: '6px',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        color: '#4b5563'
                                    }}
                                >
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '8px',
                                            color: '#9ca3af',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        •
                                    </span>
                                    <code style={{
                                        background: '#f9fafb',
                                        padding: '2px 6px',
                                        borderRadius: '3px',
                                        fontSize: '13px',
                                        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
                                    }}>
                                        {text.trim()}
                                    </code>
                                </div>
                            );
                        }

                        // Regular text line
                        if (line.trim().length > 0) {
                            // Check if line contains inline code-like patterns (e.g., [1,2,3] or variable names)
                            const parts = [];
                            let lastIndex = 0;
                            const codePattern = /(\[[^\]]+\]|\b[a-z_][a-z0-9_]*\b(?=\s*[=<>])|`[^`]+`)/gi;
                            let match;

                            while ((match = codePattern.exec(line)) !== null) {
                                if (match.index > lastIndex) {
                                    parts.push(
                                        <span key={`text-${idx}-${lastIndex}`}>
                                            {line.substring(lastIndex, match.index)}
                                        </span>
                                    );
                                }
                                parts.push(
                                    <code
                                        key={`code-${idx}-${match.index}`}
                                        style={{
                                            background: '#f3f4f6',
                                            padding: '1px 5px',
                                            borderRadius: '3px',
                                            fontSize: '13px',
                                            color: '#dc2626',
                                            fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
                                        }}
                                    >
                                        {match[0].replace(/`/g, '')}
                                    </code>
                                );
                                lastIndex = match.index + match[0].length;
                            }

                            if (lastIndex < line.length) {
                                parts.push(
                                    <span key={`text-${idx}-end`}>
                                        {line.substring(lastIndex)}
                                    </span>
                                );
                            }

                            return (
                                <div
                                    key={`line-${idx}`}
                                    style={{
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        lineHeight: '1.7',
                                        color: '#4b5563'
                                    }}
                                >
                                    {parts.length > 0 ? parts : line}
                                </div>
                            );
                        }

                        // Empty line for spacing
                        return <div key={`space-${idx}`} style={{ height: '8px' }} />;
                    })}
                </div>
            );
        };

        // Process lines and group by sections
        lines.forEach((line, idx) => {
            // Detect section changes
            if (line.match(/^Constraints:/i)) {
                if (sectionContent.length > 0) {
                    elements.push(renderSection(currentSection, sectionContent));
                    sectionContent = [];
                }
                currentSection = 'constraints';
                sectionContent.push(line);
            } else if (line.match(/^Example \d+:/i)) {
                if (sectionContent.length > 0) {
                    elements.push(renderSection(currentSection, sectionContent));
                    sectionContent = [];
                }
                currentSection = 'example';
                sectionContent.push(line);
            } else if (line.match(/^Follow[- ]up:/i)) {
                if (sectionContent.length > 0) {
                    elements.push(renderSection(currentSection, sectionContent));
                    sectionContent = [];
                }
                currentSection = 'followup';
                sectionContent.push(line);
            } else {
                sectionContent.push(line);
            }
        });

        // Render last section
        if (sectionContent.length > 0) {
            elements.push(renderSection(currentSection, sectionContent));
        }

        return elements;
    };

    return (
        <div style={{ color: '#374151' }}>
            {parseQuestion(content)}
        </div>
    );
}

export default FormattedQuestion;

