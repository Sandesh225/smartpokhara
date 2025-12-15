"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, ImageIcon, File, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FileUploaderProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
}

const FILE_ICONS: Record<string, React.ElementType> = {
  "image/": ImageIcon,
  "application/pdf": FileText,
  default: File,
}

function getFileIcon(type: string) {
  for (const [key, icon] of Object.entries(FILE_ICONS)) {
    if (type.startsWith(key)) return icon
  }
  return FILE_ICONS.default
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploader({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"],
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateAndAddFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null)
      const fileArray = Array.from(newFiles)
      const validFiles: File[] = []

      for (const file of fileArray) {
        if (files.length + validFiles.length >= maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`)
          break
        }

        if (!acceptedTypes.includes(file.type)) {
          setError(`${file.name}: Invalid file type`)
          continue
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`${file.name}: File too large (max ${maxSizeMB}MB)`)
          continue
        }

        validFiles.push(file)
      }

      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles])
      }
    },
    [files, maxFiles, maxSizeMB, acceptedTypes, onFilesChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      validateAndAddFiles(e.dataTransfer.files)
    },
    [validateAndAddFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
    setError(null)
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200",
          "hover:border-primary/50 hover:bg-accent/30",
          isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-muted/30",
        )}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => e.target.files && validateAndAddFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload files"
        />

        <div className="flex flex-col items-center justify-center text-center pointer-events-none">
          <div
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center mb-3 transition-colors",
              isDragging ? "bg-primary/10" : "bg-muted",
            )}
          >
            <Upload
              className={cn("h-6 w-6 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")}
            />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, GIF, PDF up to {maxSizeMB}MB each (max {maxFiles} files)
          </p>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
            <div className="space-y-2">
              {files.map((file, index) => {
                const Icon = getFileIcon(file.type)

                return (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
