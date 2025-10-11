"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

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
  oldEnd?: number
  newEnd?: number
  lines?: DiffLine[]
  expandDirection?: "up" | "down"
  hiddenLines?: number
  // Instead of storing expanded lines, we'll generate them on demand
}

interface DiffData {
  filePath: string
  chunks: DiffChunk[]
  // Store all file lines for proper expansion
  fullOldFile?: string[]
  fullNewFile?: string[]
}

// Generate proper line numbers for expanded sections
function generateExpandedLines(chunk: DiffChunk, fullOldFile?: string[], fullNewFile?: string[]): DiffLine[] {
  if (!fullOldFile || !fullNewFile) {
    // Fallback to showing placeholder lines if full file not available
    const lines: DiffLine[] = []
    const lineCount = chunk.hiddenLines || 10

    if (chunk.expandDirection === "up") {
      // Lines before the chunk
      for (let i = lineCount; i > 0; i--) {
        lines.push({
          type: "unchanged",
          oldLine: chunk.oldStart - i,
          newLine: chunk.newStart - i,
          content: `  // ... line ${chunk.oldStart - i} ...`,
        })
      }
    } else {
      // Lines after the chunk
      const startOld = (chunk.oldEnd || chunk.oldStart) + 1
      const startNew = (chunk.newEnd || chunk.newStart) + 1

      for (let i = 0; i < lineCount; i++) {
        lines.push({
          type: "unchanged",
          oldLine: startOld + i,
          newLine: startNew + i,
          content: `  // ... line ${startOld + i} ...`,
        })
      }
    }

    return lines
  }

  // If we have the full file content, show actual lines
  const lines: DiffLine[] = []

  if (chunk.expandDirection === "up") {
    const startLine = Math.max(0, chunk.oldStart - (chunk.hiddenLines || 10) - 1)
    const endLine = chunk.oldStart - 1

    for (let i = startLine; i < endLine; i++) {
      lines.push({
        type: "unchanged",
        oldLine: i + 1,
        newLine: i + 1, // Assuming unchanged lines have same numbers
        content: fullOldFile[i] || `  // line ${i + 1}`,
      })
    }
  } else {
    const startOld = chunk.oldEnd || chunk.oldStart
    const startNew = chunk.newEnd || chunk.newStart
    const lineCount = chunk.hiddenLines || 10

    for (let i = 0; i < lineCount; i++) {
      lines.push({
        type: "unchanged",
        oldLine: startOld + i + 1,
        newLine: startNew + i + 1,
        content: fullOldFile[startOld + i] || `  // line ${startOld + i + 1}`,
      })
    }
  }

  return lines
}

function DiffPreview({ diff }: { diff: DiffData }) {
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set())

  const getLineNumberWidth = () => {
    let maxLineNumber = 0

    diff.chunks.forEach((chunk) => {
      if (chunk.lines) {
        chunk.lines.forEach((line) => {
          maxLineNumber = Math.max(maxLineNumber, line.oldLine || 0, line.newLine || 0)
        })
      }
      // Also consider the potential expanded lines
      if (chunk.type === "expand") {
        if (chunk.expandDirection === "up") {
          maxLineNumber = Math.max(maxLineNumber, chunk.oldStart, chunk.newStart)
        } else {
          const endOld = (chunk.oldEnd || chunk.oldStart) + (chunk.hiddenLines || 10)
          const endNew = (chunk.newEnd || chunk.newStart) + (chunk.hiddenLines || 10)
          maxLineNumber = Math.max(maxLineNumber, endOld, endNew)
        }
      }
    })

    return Math.max(3, maxLineNumber.toString().length)
  }

  const lineNumberWidth = getLineNumberWidth()

  const handleExpand = (chunkIndex: number) => {
    setExpandedChunks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(chunkIndex)) {
        newSet.delete(chunkIndex)
      } else {
        newSet.add(chunkIndex)
      }
      return newSet
    })
  }

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900 text-white font-mono">
      {/* File Header */}

      <div className="text-sm">
        {diff.chunks.map((chunk, chunkIndex) => (
          <div key={chunkIndex}>
            {chunk.type === "expand" ? (
              <div>
                {expandedChunks.has(chunkIndex) ? (
                  <>
                    {/* Expanded lines */}
                    {generateExpandedLines(chunk, diff.fullOldFile, diff.fullNewFile).map((line, lineIndex) => (
                      <div key={`expanded-${lineIndex}`} className="flex">
                        <div className="flex bg-gray-800 border-r border-gray-700">
                          <div
                            className="px-2 py-0.5 text-right text-gray-400 select-none"
                            style={{ width: `${lineNumberWidth + 1}ch` }}
                          >
                            {line.oldLine || ""}
                          </div>
                          <div
                            className="px-2 py-0.5 text-right text-gray-400 select-none"
                            style={{ width: `${lineNumberWidth + 1}ch` }}
                          >
                            {line.newLine || ""}
                          </div>
                        </div>
                        <div className="w-6"></div>
                        <div className="flex-1 px-2 py-0.5 whitespace-pre overflow-x-auto">{line.content}</div>
                      </div>
                    ))}

                    {/* Collapse button */}
                    <button
                      onClick={() => handleExpand(chunkIndex)}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 px-4 flex items-center gap-2 text-xs border-y border-gray-700"
                    >
                      <ChevronUp size={14} />
                      Collapse
                    </button>
                  </>
                ) : (
                  /* Expand button */
                  <button
                    onClick={() => handleExpand(chunkIndex)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 px-4 flex items-center gap-2 text-xs border-y border-gray-700"
                  >
                    {chunk.expandDirection === "up" ? (
                      <>
                        <ChevronUp size={14} />
                        Expand Up
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        Expand Down
                      </>
                    )}
                    {chunk.hiddenLines && (
                      <span className="text-gray-500 ml-auto">{chunk.hiddenLines} hidden lines</span>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Chunk Header */}
                <div className="bg-gray-800 px-4 py-1 text-gray-400 text-xs border-y border-gray-700">
                  @@ -{chunk.oldStart},{chunk.lines?.filter((l) => l.type !== "added").length || 0} +{chunk.newStart},
                  {chunk.lines?.filter((l) => l.type !== "removed").length || 0} @@
                </div>

                {/* Lines */}
                {chunk.lines?.map((line, lineIndex) => (
                  <div
                    key={lineIndex}
                    className={`flex ${
                      line.type === "added" ? "bg-green-900/30" : line.type === "removed" ? "bg-red-900/30" : ""
                    }`}
                  >
                    {/* Line Numbers */}
                    <div
                      className={`flex border-r border-gray-700 ${
                        line.type === "added"
                          ? "bg-green-900/20"
                          : line.type === "removed"
                            ? "bg-red-900/20"
                            : "bg-gray-800"
                      }`}
                    >
                      <div
                        className="px-2 py-0.5 text-right text-gray-400 select-none"
                        style={{ width: `${lineNumberWidth + 1}ch` }}
                      >
                        {line.oldLine || ""}
                      </div>
                      <div
                        className="px-2 py-0.5 text-right text-gray-400 select-none"
                        style={{ width: `${lineNumberWidth + 1}ch` }}
                      >
                        {line.newLine || ""}
                      </div>
                    </div>

                    {/* Change Indicator */}
                    <div
                      className={`w-6 flex items-center justify-center text-xs font-bold ${
                        line.type === "added" ? "text-green-400" : line.type === "removed" ? "text-red-400" : ""
                      }`}
                    >
                      {line.type === "added" && "+"}
                      {line.type === "removed" && "-"}
                    </div>

                    {/* Code Content */}
                    <div className="flex-1 px-2 py-0.5 whitespace-pre overflow-x-auto">{line.content}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Example usage with corrected data structure
export default function App() {
  const sampleDiff: DiffData = {
    filePath: "src/components/UserProfile.tsx",
    chunks: [
      {
        type: "context",
        oldStart: 1,
        newStart: 1,
        lines: [
          { type: "unchanged", oldLine: 1, newLine: 1, content: "import React, { useState } from 'react';" },
          { type: "unchanged", oldLine: 2, newLine: 2, content: "import { User } from '../types';" },
          { type: "removed", oldLine: 3, newLine: null, content: "import { formatDate } from '../utils';" },
          {
            type: "added",
            oldLine: null,
            newLine: 3,
            content: "import { formatDate, validateEmail } from '../utils';",
          },
          { type: "unchanged", oldLine: 4, newLine: 4, content: "" },
          { type: "unchanged", oldLine: 5, newLine: 5, content: "interface UserProfileProps {" },
          { type: "unchanged", oldLine: 6, newLine: 6, content: "  user: User;" },
          { type: "added", oldLine: null, newLine: 7, content: "  onUpdate?: (user: User) => void;" },
          { type: "unchanged", oldLine: 7, newLine: 8, content: "}" },
        ],
      },
      {
        type: "expand",
        oldStart: 8,
        newStart: 9,
        oldEnd: 7,
        newEnd: 8,
        expandDirection: "down",
        hiddenLines: 12,
      },
      {
        type: "context",
        oldStart: 20,
        newStart: 21,
        lines: [
          {
            type: "unchanged",
            oldLine: 20,
            newLine: 21,
            content: "  const [isEditing, setIsEditing] = useState(false);",
          },
          { type: "added", oldLine: null, newLine: 22, content: "  const [email, setEmail] = useState(user.email);" },
          { type: "added", oldLine: null, newLine: 23, content: "  const [emailError, setEmailError] = useState('');" },
          { type: "unchanged", oldLine: 21, newLine: 24, content: "" },
          { type: "removed", oldLine: 22, newLine: null, content: "  const handleSave = () => {" },
          { type: "removed", oldLine: 23, newLine: null, content: "    setIsEditing(false);" },
          { type: "removed", oldLine: 24, newLine: null, content: "  };" },
          { type: "added", oldLine: null, newLine: 25, content: "  const handleSave = () => {" },
          { type: "added", oldLine: null, newLine: 26, content: "    if (!validateEmail(email)) {" },
          {
            type: "added",
            oldLine: null,
            newLine: 27,
            content: "      setEmailError('Please enter a valid email address');",
          },
          { type: "added", oldLine: null, newLine: 28, content: "      return;" },
          { type: "added", oldLine: null, newLine: 29, content: "    }" },
          { type: "added", oldLine: null, newLine: 30, content: "    " },
          { type: "added", oldLine: null, newLine: 31, content: "    const updatedUser = { ...user, email };" },
          { type: "added", oldLine: null, newLine: 32, content: "    onUpdate?.(updatedUser);" },
          { type: "added", oldLine: null, newLine: 33, content: "    setIsEditing(false);" },
          { type: "added", oldLine: null, newLine: 34, content: "    setEmailError('');" },
          { type: "added", oldLine: null, newLine: 35, content: "  };" },
        ],
      },
      {
        type: "expand",
        oldStart: 25,
        newStart: 36,
        oldEnd: 24,
        newEnd: 35,
        expandDirection: "down",
        hiddenLines: 8,
      },
      {
        type: "context",
        oldStart: 33,
        newStart: 44,
        lines: [
          { type: "unchanged", oldLine: 33, newLine: 44, content: '        <div className="profile-email">' },
          { type: "removed", oldLine: 34, newLine: null, content: "          <span>{user.email}</span>" },
          { type: "added", oldLine: null, newLine: 45, content: "          {isEditing ? (" },
          { type: "added", oldLine: null, newLine: 46, content: "            <div>" },
          { type: "added", oldLine: null, newLine: 47, content: "              <input" },
          { type: "added", oldLine: null, newLine: 48, content: '                type="email"' },
          { type: "added", oldLine: null, newLine: 49, content: "                value={email}" },
          {
            type: "added",
            oldLine: null,
            newLine: 50,
            content: "                onChange={(e) => setEmail(e.target.value)}",
          },
          {
            type: "added",
            oldLine: null,
            newLine: 51,
            content: "                className={emailError ? 'error' : ''}",
          },
          { type: "added", oldLine: null, newLine: 52, content: "              />" },
          {
            type: "added",
            oldLine: null,
            newLine: 53,
            content: '              {emailError && <span className="error-text">{emailError}</span>}',
          },
          { type: "added", oldLine: null, newLine: 54, content: "            </div>" },
          { type: "added", oldLine: null, newLine: 55, content: "          ) : (" },
          { type: "added", oldLine: null, newLine: 56, content: "            <span>{user.email}</span>" },
          { type: "added", oldLine: null, newLine: 57, content: "          )}" },
          { type: "unchanged", oldLine: 35, newLine: 58, content: "        </div>" },
        ],
      },
    ],
    fullOldFile: [
      "import React, { useState } from 'react';",
      "import { User } from '../types';",
      "import { formatDate } from '../utils';",
      "",
      "interface UserProfileProps {",
      "  user: User;",
      "}",
      "",
      "export default function UserProfile({ user }: UserProfileProps) {",
      "  const [isEditing, setIsEditing] = useState(false);",
      "",
      "  const handleEdit = () => {",
      "    setIsEditing(true);",
      "  };",
      "",
      "  const handleCancel = () => {",
      "    setIsEditing(false);",
      "  };",
      "",
      "  const [isEditing, setIsEditing] = useState(false);",
      "",
      "  const handleSave = () => {",
      "    setIsEditing(false);",
      "  };",
      "",
      "  return (",
      '    <div className="user-profile">',
      '      <div className="profile-header">',
      "        <h2>{user.name}</h2>",
      "        <button onClick={isEditing ? handleSave : handleEdit}>",
      "          {isEditing ? 'Save' : 'Edit'}",
      "        </button>",
      "      </div>",
      '        <div className="profile-email">',
      "          <span>{user.email}</span>",
      "        </div>",
      '        <div className="profile-joined">',
      "          <span>Joined: {formatDate(user.createdAt)}</span>",
      "        </div>",
      "      </div>",
      "    </div>",
      "  );",
      "}",
    ],
    fullNewFile: [
      "import React, { useState } from 'react';",
      "import { User } from '../types';",
      "import { formatDate, validateEmail } from '../utils';",
      "",
      "interface UserProfileProps {",
      "  user: User;",
      "  onUpdate?: (user: User) => void;",
      "}",
      "",
      "export default function UserProfile({ user, onUpdate }: UserProfileProps) {",
      "  const [isEditing, setIsEditing] = useState(false);",
      "  const [email, setEmail] = useState(user.email);",
      "  const [emailError, setEmailError] = useState('');",
      "",
      "  const handleEdit = () => {",
      "    setIsEditing(true);",
      "  };",
      "",
      "  const handleCancel = () => {",
      "    setIsEditing(false);",
      "  };",
      "",
      "  const handleSave = () => {",
      "    if (!validateEmail(email)) {",
      "      setEmailError('Please enter a valid email address');",
      "      return;",
      "    }",
      "",
      "    const updatedUser = { ...user, email };",
      "    onUpdate?.(updatedUser);",
      "    setIsEditing(false);",
      "    setEmailError('');",
      "  };",
      "",
      "  return (",
      '    <div className="user-profile">',
      '      <div className="profile-header">',
      "        <h2>{user.name}</h2>",
      "        <button onClick={isEditing ? handleSave : handleEdit}>",
      "          {isEditing ? 'Save' : 'Edit'}",
      "        </button>",
      "      </div>",
      '        <div className="profile-email">',
      "          {isEditing ? (",
      "            <div>",
      "              <input",
      '                type="email"',
      "                value={email}",
      "                onChange={(e) => setEmail(e.target.value)}",
      "                className={emailError ? 'error' : ''}",
      "              />",
      '              {emailError && <span className="error-text">{emailError}</span>}',
      "            </div>",
      "          ) : (",
      "            <span>{user.email}</span>",
      "          )}",
      "        </div>",
      '        <div className="profile-joined">',
      "          <span>Joined: {formatDate(user.createdAt)}</span>",
      "        </div>",
      "      </div>",
      "    </div>",
      "  );",
      "}",
    ],
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Improved Diff Preview</h1>
        <DiffPreview diff={sampleDiff} />
      </div>
    </div>
  )
}
