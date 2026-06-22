"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (data: any) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload file");
      }
      if (data.mappingRequired) {
        const forceResponse = await fetch("/api/upload", {
          method: "POST",
          body: (() => {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("mapping", JSON.stringify(data.suggestedMapping));
            fd.append("force", "true");
            return fd;
          })(),
        });
        const forceData = await forceResponse.json();
        if (!forceResponse.ok) {
          throw new Error(forceData.error || "Failed to process file");
        }
        if (onUploadComplete) onUploadComplete(forceData);
      } else {
        if (onUploadComplete) onUploadComplete(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-colors ${
          dragActive
            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10"
            : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json,.xlsx,.xls"
          className="hidden"
          onChange={handleChange}
        />

        {!file ? (
          <>
            <div className="h-16 w-16 mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Upload Dataset
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">
              Drag and drop your social media engagement data here, or click to
              browse.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Supports CSV, JSON, Excel (.xlsx)
            </p>

            <button
              onClick={() => inputRef.current?.click()}
              className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Select File
            </button>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            <FileText className="h-12 w-12 text-emerald-500 mb-3" />
            <p className="font-medium text-slate-900 dark:text-white truncate max-w-[250px]">
              {file.name}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {(file.size / 1024).toFixed(2)} KB
            </p>

            {error && (
              <div className="mb-6 flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-lg text-sm w-full">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setFile(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Process Leads
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
