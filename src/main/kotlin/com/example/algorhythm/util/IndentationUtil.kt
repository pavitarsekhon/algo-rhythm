package com.example.algorhythm.util

object IndentationUtil {
    private const val TAB_WIDTH = 4

    fun normalizeForPython(code: String): String {
        // Normalize CRLF/CR newlines to LF
        val normalizedNewlines = code.replace("\r\n", "\n").replace("\r", "\n")

        val sb = StringBuilder()
        val lines = normalizedNewlines.split('\n')
        for ((i, line) in lines.withIndex()) {
            // capture leading whitespace only
            var idx = 0
            while (idx < line.length && (line[idx] == ' ' || line[idx] == '\t')) idx++
            val leading = line.substring(0, idx)
            val rest = if (idx < line.length) line.substring(idx) else ""

            // compute space count: tabs * TAB_WIDTH + spaces
            var spaceCount = 0
            for (ch in leading) {
                spaceCount += if (ch == '\t') TAB_WIDTH else 1
            }

            // replace leading whitespace with spaceCount spaces
            if (spaceCount > 0) {
                repeat(spaceCount) { sb.append(' ') }
            }
            sb.append(rest)
            if (i < lines.size - 1) sb.append('\n')
        }
        return sb.toString()
    }
}

