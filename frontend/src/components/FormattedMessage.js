import React from 'react';

/**
 * Component to render bot messages with proper formatting
 * Supports: bold text, code blocks, inline code, bullet points
 */
function FormattedMessage({ content }) {
    const parseMessage = (text) => {
        const parts = [];
        let currentIndex = 0;

        // Regex patterns
        const codeBlockRegex = /```[\s\S]*?```/g;
        const boldRegex = /\*\*(.+?)\*\*/g;
        const inlineCodeRegex = /`([^`]+)`/g;

        // Find all code blocks first (highest priority)
        const codeBlocks = [];
        let match;
        while ((match = codeBlockRegex.exec(text)) !== null) {
            codeBlocks.push({
                start: match.index,
                end: match.index + match[0].length,
                content: match[0].replace(/```/g, '').trim(),
                type: 'codeBlock'
            });
        }

        // Split text into segments
        const segments = [];
        let lastEnd = 0;

        codeBlocks.forEach(block => {
            if (block.start > lastEnd) {
                segments.push({
                    start: lastEnd,
                    end: block.start,
                    content: text.substring(lastEnd, block.start),
                    type: 'text'
                });
            }
            segments.push(block);
            lastEnd = block.end;
        });

        if (lastEnd < text.length) {
            segments.push({
                start: lastEnd,
                end: text.length,
                content: text.substring(lastEnd),
                type: 'text'
            });
        }

        // Process each segment
        const elements = [];
        segments.forEach((segment, segIndex) => {
            if (segment.type === 'codeBlock') {
                elements.push(
                    <pre
                        key={`code-${segIndex}`}
                        style={{
                            background: '#1e1e1e',
                            color: '#d4d4d4',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            overflowX: 'auto',
                            margin: '12px 0',
                            border: '1px solid #333',
                            fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
                        }}
                    >
                        <code>{segment.content}</code>
                    </pre>
                );
            } else {
                // Process text segment for bold, inline code, and bullets
                const lines = segment.content.split('\n');
                lines.forEach((line, lineIndex) => {
                    const lineElements = [];
                    let lineText = line;
                    let processedUpTo = 0;

                    // Check if it's a heading
                    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
                    const isHeading = headingMatch !== null;
                    let headingLevel = 0;
                    if (isHeading) {
                        headingLevel = headingMatch[1].length;
                        lineText = headingMatch[2];
                    }

                    // Check if it's a bullet point
                    const isBullet = !isHeading && /^\s*[-*•]\s+/.test(line);
                    if (isBullet) {
                        lineText = line.replace(/^\s*[-*•]\s+/, '');
                    }

                    // Find all bold and inline code in this line
                    const inlinePatterns = [];

                    // Find inline code
                    let inlineCodeMatch;
                    const inlineCodeReg = /`([^`]+)`/g;
                    while ((inlineCodeMatch = inlineCodeReg.exec(lineText)) !== null) {
                        inlinePatterns.push({
                            start: inlineCodeMatch.index,
                            end: inlineCodeMatch.index + inlineCodeMatch[0].length,
                            content: inlineCodeMatch[1],
                            type: 'inlineCode'
                        });
                    }

                    // Find bold text (that's not inside inline code)
                    let boldMatch;
                    const boldReg = /\*\*(.+?)\*\*/g;
                    while ((boldMatch = boldReg.exec(lineText)) !== null) {
                        // Check if this bold is inside a code block
                        const isInsideCode = inlinePatterns.some(
                            p => boldMatch.index >= p.start && boldMatch.index < p.end
                        );
                        if (!isInsideCode) {
                            inlinePatterns.push({
                                start: boldMatch.index,
                                end: boldMatch.index + boldMatch[0].length,
                                content: boldMatch[1],
                                type: 'bold'
                            });
                        }
                    }

                    // Sort patterns by start position
                    inlinePatterns.sort((a, b) => a.start - b.start);

                    // Build line elements
                    let lastPos = 0;
                    inlinePatterns.forEach((pattern, patternIndex) => {
                        // Add text before pattern
                        if (pattern.start > lastPos) {
                            lineElements.push(
                                <span key={`text-${lineIndex}-${patternIndex}`}>
                                    {lineText.substring(lastPos, pattern.start)}
                                </span>
                            );
                        }

                        // Add formatted pattern
                        if (pattern.type === 'bold') {
                            lineElements.push(
                                <strong
                                    key={`bold-${lineIndex}-${patternIndex}`}
                                    style={{ fontWeight: '700', color: '#111827' }}
                                >
                                    {pattern.content}
                                </strong>
                            );
                        } else if (pattern.type === 'inlineCode') {
                            lineElements.push(
                                <code
                                    key={`inline-${lineIndex}-${patternIndex}`}
                                    style={{
                                        background: '#e5e7eb',
                                        color: '#dc2626',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
                                    }}
                                >
                                    {pattern.content}
                                </code>
                            );
                        }

                        lastPos = pattern.end;
                    });

                    // Add remaining text
                    if (lastPos < lineText.length) {
                        lineElements.push(
                            <span key={`text-${lineIndex}-end`}>
                                {lineText.substring(lastPos)}
                            </span>
                        );
                    }

                    // Wrap line
                    if (lineElements.length > 0 || line.trim().length > 0) {
                        const lineStyle = {
                            display: 'block',
                            marginBottom: '8px',
                            lineHeight: '1.6'
                        };

                        if (isHeading) {
                            const headingStyles = {
                                1: { fontSize: '18px', fontWeight: '700', marginTop: '16px', marginBottom: '12px', color: '#111827' },
                                2: { fontSize: '16px', fontWeight: '700', marginTop: '14px', marginBottom: '10px', color: '#1f2937' },
                                3: { fontSize: '14px', fontWeight: '700', marginTop: '12px', marginBottom: '8px', color: '#374151' }
                            };
                            elements.push(
                                <div
                                    key={`line-${segIndex}-${lineIndex}`}
                                    style={{
                                        ...lineStyle,
                                        ...headingStyles[headingLevel]
                                    }}
                                >
                                    {lineElements.length > 0 ? lineElements : lineText}
                                </div>
                            );
                        } else if (isBullet) {
                            elements.push(
                                <div
                                    key={`line-${segIndex}-${lineIndex}`}
                                    style={{
                                        ...lineStyle,
                                        paddingLeft: '24px',
                                        position: 'relative'
                                    }}
                                >
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '8px',
                                            color: '#667eea',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        •
                                    </span>
                                    {lineElements}
                                </div>
                            );
                        } else {
                            elements.push(
                                <div key={`line-${segIndex}-${lineIndex}`} style={lineStyle}>
                                    {lineElements.length > 0 ? lineElements : line}
                                </div>
                            );
                        }
                    }
                });
            }
        });

        return elements;
    };

    return (
        <div style={{ color: '#374151' }}>
            {parseMessage(content)}
        </div>
    );
}

export default FormattedMessage;

