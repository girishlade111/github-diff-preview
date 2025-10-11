"use client"

import type React from "react"
import { ChevronDown, Copy, MoreHorizontal, ChevronUp } from "lucide-react"
import { useState } from "react"

interface DiffLine {
  type: "unchanged" | "added" | "removed"
  oldLine: number | null
  newLine: number | null
  content: string
}

interface DiffChunk {
  type: "context" | "expand"
  oldStart: number
  newStart: number
  lines?: DiffLine[]
  expandDirection?: "up" | "down"
  hiddenLines?: number
  expandedLines?: DiffLine[]
}

interface DiffData {
  filePath: string
  changes: DiffChunk[]
}

interface DiffPreviewProps {
  diff: DiffData
  className?: string
  onExpandUp?: (chunkIndex: number) => void
  onExpandDown?: (chunkIndex: number) => void
}

export function DiffPreview({ diff, className, onExpandUp, onExpandDown }: DiffPreviewProps) {
  const getLineNumberWidth = () => {
    const maxLineNumber = Math.max(
      ...diff.changes.flatMap(
        (chunk) => chunk.lines?.map((line) => Math.max(line.oldLine || 0, line.newLine || 0)) || [0],
      ),
      ...diff.changes.flatMap(
        (chunk) => chunk.expandedLines?.map((line) => Math.max(line.oldLine || 0, line.newLine || 0)) || [0],
      ),
    )
    return Math.max(2, maxLineNumber.toString().length)
  }

  const lineNumberWidth = getLineNumberWidth()

  const containerStyle: React.CSSProperties = {
    border: "1px solid #30363d",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#0d1117",
    color: "#ffffff",
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  }

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#161b22",
    padding: "8px 16px",
    borderBottom: "1px solid #30363d",
    color: "#ffffff",
  }

  const diffContentStyle: React.CSSProperties = {
    backgroundColor: "#0d1117",
    color: "#ffffff",
    fontSize: "14px",
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  }

  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set())

  const handleExpand = (chunkIndex: number, direction: "up" | "down") => {
    setExpandedChunks((prev) => {
      const newSet = new Set(prev)
      newSet.add(chunkIndex)
      return newSet
    })

    if (direction === "up") {
      onExpandUp?.(chunkIndex)
    } else {
      onExpandDown?.(chunkIndex)
    }
  }

  return (
    <div style={containerStyle} className={className}>
      {/* File Header */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ChevronDown size={16} style={{ color: "#8b949e" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#22c55e" }}></div>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#eab308" }}></div>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444" }}></div>
            </div>
            <span style={{ fontSize: "14px", color: "#ffffff" }}>{diff.filePath}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", padding: "4px" }}>
            <Copy size={16} />
          </button>
          <button style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", padding: "4px" }}>
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div style={diffContentStyle}>
        {diff.changes.map((chunk, chunkIndex) => (
          <div key={chunkIndex}>
            {chunk.type === "expand" ? (
              <div>
                {expandedChunks.has(chunkIndex) && chunk.expandedLines && (
                  <div>
                    {chunk.expandedLines.map((line, lineIndex) => {
                      const lineStyle: React.CSSProperties = {
                        display: "flex",
                        backgroundColor: "#0d1117",
                      }

                      const lineNumberStyle: React.CSSProperties = {
                        padding: "2px 8px",
                        textAlign: "right",
                        color: "#8b949e",
                        userSelect: "none",
                        width: `${lineNumberWidth * 0.6 + 1}rem`,
                        backgroundColor: "#161b22",
                      }

                      const contentStyle: React.CSSProperties = {
                        flex: 1,
                        padding: "2px 8px",
                        whiteSpace: "pre",
                        overflowX: "auto",
                        color: "#ffffff",
                        backgroundColor: "#0d1117",
                      }

                      return (
                        <div key={`expanded-${lineIndex}`} style={lineStyle}>
                          <div
                            style={{ display: "flex", borderRight: "1px solid #30363d", backgroundColor: "#161b22" }}
                          >
                            <div style={lineNumberStyle}>{line.oldLine || ""}</div>
                            <div style={lineNumberStyle}>{line.newLine || ""}</div>
                          </div>
                          <div style={{ width: "24px", backgroundColor: "#0d1117" }}></div>
                          <div style={contentStyle}>
                            <SyntaxHighlightedCode content={line.content} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {!expandedChunks.has(chunkIndex) && (
                  <div
                    style={{
                      backgroundColor: "#1f2937",
                      display: "flex",
                      alignItems: "center",
                      borderTop: "1px solid #30363d",
                      borderBottom: "1px solid #30363d",
                    }}
                  >
                    <div style={{ display: "flex", borderRight: "1px solid #30363d", backgroundColor: "#161b22" }}>
                      <div style={{ width: `${lineNumberWidth * 0.6 + 1}rem`, padding: "8px", textAlign: "center" }}>
                        <div style={{ color: "#8b949e", fontSize: "12px" }}>...</div>
                      </div>
                      <div style={{ width: `${lineNumberWidth * 0.6 + 1}rem`, padding: "8px", textAlign: "center" }}>
                        <div style={{ color: "#8b949e", fontSize: "12px" }}>...</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleExpand(chunkIndex, chunk.expandDirection || "down")}
                      style={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        color: "#ffffff",
                        padding: "8px 16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        width: "100%",
                      }}
                    >
                      {chunk.expandDirection === "up" ? (
                        <>
                          <ChevronUp size={16} />
                          Expand Up
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Expand Down
                        </>
                      )}
                      {chunk.hiddenLines && (
                        <span style={{ color: "#8b949e", marginLeft: "auto" }}>{chunk.hiddenLines} hidden lines</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Chunk Header */}
                <div
                  style={{
                    backgroundColor: "#1f2937",
                    padding: "4px 16px",
                    color: "#8b949e",
                    borderTop: "1px solid #30363d",
                    borderBottom: "1px solid #30363d",
                  }}
                >
                  @@ -{chunk.oldStart},{chunk.lines?.length || 0} +{chunk.newStart},
                  {chunk.lines?.filter((l) => l.type !== "removed").length || 0} @@
                </div>

                {/* Lines */}
                {chunk.lines?.map((line, lineIndex) => {
                  const lineStyle: React.CSSProperties = {
                    display: "flex",
                    backgroundColor:
                      line.type === "added" ? "#0d4429" : line.type === "removed" ? "#67060c" : "#0d1117",
                  }

                  const lineNumberStyle: React.CSSProperties = {
                    padding: "2px 8px",
                    textAlign: "right",
                    color: "#8b949e",
                    userSelect: "none",
                    width: `${lineNumberWidth * 0.6 + 1}rem`,
                    backgroundColor:
                      line.type === "added" ? "#0d4429" : line.type === "removed" ? "#67060c" : "#161b22",
                  }

                  const indicatorStyle: React.CSSProperties = {
                    width: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    backgroundColor:
                      line.type === "added" ? "#0d4429" : line.type === "removed" ? "#67060c" : "#0d1117",
                    color: line.type === "added" ? "#3fb950" : line.type === "removed" ? "#f85149" : "transparent",
                  }

                  const contentStyle: React.CSSProperties = {
                    flex: 1,
                    padding: "2px 8px",
                    whiteSpace: "pre",
                    overflowX: "auto",
                    color: "#ffffff",
                    backgroundColor:
                      line.type === "added" ? "#0d4429" : line.type === "removed" ? "#67060c" : "#0d1117",
                  }

                  return (
                    <div key={lineIndex} style={lineStyle}>
                      {/* Line Numbers */}
                      <div style={{ display: "flex", borderRight: "1px solid #30363d", backgroundColor: "#161b22" }}>
                        <div style={lineNumberStyle}>{line.oldLine || ""}</div>
                        <div style={lineNumberStyle}>{line.newLine || ""}</div>
                      </div>

                      {/* Change Indicator */}
                      <div style={indicatorStyle}>
                        {line.type === "added" && "+"}
                        {line.type === "removed" && "-"}
                      </div>

                      {/* Code Content */}
                      <div style={contentStyle}>
                        <SyntaxHighlightedCode content={line.content} />
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function SyntaxHighlightedCode({ content }: { content: string }) {
  const highlightedContent = content
    .replace(
      /\b(import|export|const|let|var|function|async|await|if|else|return|new|from)\b/g,
      '<span style="color: #ff7b72;">$1</span>',
    )
    .replace(/\b(Date|NextResponse|Prisma|TaskStatus|parse)\b/g, '<span style="color: #79c0ff;">$1</span>')
    .replace(/'([^']*)'/g, "<span style=\"color: #ffffff;\">'$1'</span>")
    .replace(/"([^"]*)"/g, '<span style="color: #ffffff;">"$1"</span>')
    .replace(/\/\/.*$/gm, '<span style="color: #8b949e;">$&</span>')
    .replace(/\{|\}/g, '<span style="color: #ffffff;">$&</span>')
    .replace(/\[|\]/g, '<span style="color: #ffffff;">$&</span>')

  return <span dangerouslySetInnerHTML={{ __html: highlightedContent }} />
}
