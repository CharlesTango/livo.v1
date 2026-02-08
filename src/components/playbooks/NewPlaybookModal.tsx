"use client";

import { useState, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Modal, Button, Input, Textarea } from "@/components/ui";

interface NewPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPlaybookModal({ isOpen, onClose }: NewPlaybookModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generateContent, setGenerateContent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.playbooks.generateUploadUrl);
  const createPlaybook = useMutation(api.playbooks.create);
  const startProcessing = useAction(api.ai.startProcessing);

  const extractPdfText = async (pdfFile: File): Promise<string> => {
    const arrayBuffer = await pdfFile.arrayBuffer();

    // Use dynamic import with require() fallback for Next.js compatibility
    // @ts-expect-error - dynamic require
    const pdfjs = window.pdfjsLib || (await loadPdfJs());

    const texts: string[] = [];
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => (typeof item.str === "string" ? item.str : ""))
        .filter(Boolean)
        .join(" ");
      texts.push(pageText);
    }

    return texts.join("\n\n");
  };

  const loadPdfJs = async (): Promise<any> => {
    // Load PDF.js from CDN to avoid Next.js/Webpack ESM issues
    // Using legacy build (v3.x) which has better browser compatibility
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        const pdfjs = (window as any).pdfjsLib;
        if (pdfjs) {
          pdfjs.GlobalWorkerOptions.workerSrc = 
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(pdfjs);
        } else {
          reject(new Error("PDF.js failed to initialize"));
        }
      };
      script.onerror = () => reject(new Error("PDF.js failed to load"));
      document.head.appendChild(script);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const extension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (extension !== "pdf" && extension !== "docx") {
        setError("Please upload a PDF or Word document (.pdf or .docx)");
        return;
      }
      setFile(selectedFile);
      setError(null);

      // Auto-fill name if empty
      if (!name) {
        const baseName = selectedFile.name.replace(/\.(pdf|docx)$/i, "");
        setName(baseName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a name for the playbook");
      return;
    }

    setIsSubmitting(true);

    try {
      const fileType = file.name.split(".").pop()?.toLowerCase() || "pdf";

      // Extract PDF text in-browser (Convex actions don't reliably support pdfjs DOM deps).
      let extractedText: string | undefined = undefined;
      if (fileType === "pdf") {
        extractedText = await extractPdfText(file);
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error("Could not extract text from the PDF. Try uploading a text-based PDF or a .docx file.");
        }
      }

      // Step 1: Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload the file
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await uploadResponse.json();

      // Step 3: Create the playbook record
      const playbookId = await createPlaybook({
        name: name.trim(),
        description: description.trim() || undefined,
        agreementType: "General",
        fileId: storageId,
        fileName: file.name,
        fileType,
      });

      // Step 4: Start AI processing
      await startProcessing({
        playbookId,
        generateContent,
        documentText: extractedText,
      });

      // Reset form and close modal
      handleClose();

      // Navigate to the new playbook
      router.push(`/playbooks/${playbookId}`);
    } catch (err) {
      console.error("Error creating playbook:", err);
      setError(err instanceof Error ? err.message : "Failed to create playbook");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setFile(null);
    setGenerateContent(true);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Playbook">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-bold text-secondary mb-2">
            Agreement Template *
          </label>
          <div
            className={`border-2 border-dashed rounded-l p-6 text-center transition-colors ${
              file ? "border-primary bg-primary/5" : "border-neutral-light hover:border-primary/50"
            }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-secondary">{file.name}</p>
                  <p className="text-xs text-secondary/50">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="ml-4 text-accent-error hover:text-accent-error/80"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg className="w-10 h-10 text-secondary/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-secondary/70 mb-2">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-secondary/50">
                  Supports PDF and Word documents (.pdf, .docx)
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="sr-only"
            id="file-upload"
          />
          {!file && (
            <label
              htmlFor="file-upload"
              className="mt-3 inline-flex items-center px-4 py-2 border border-neutral-light rounded-pill text-sm font-medium text-secondary/70 hover:bg-neutral-light/50 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Choose File
            </label>
          )}
        </div>

        {/* Playbook Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-secondary mb-2">
            Playbook Name *
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Standard NDA Playbook"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-secondary mb-2">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description of this playbook..."
            rows={3}
          />
        </div>

        {/* AI Content Generation Option */}
        <div className="bg-neutral-light/30 rounded-l p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={generateContent}
              onChange={(e) => setGenerateContent(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary border-neutral-medium rounded focus:ring-primary"
            />
            <div>
              <span className="font-bold text-secondary">AI-Assisted Content Generation</span>
              <p className="text-sm text-secondary/60 mt-1">
                Automatically generate summaries, talking points, and fallback positions for each clause using AI. You can edit all generated content afterward.
              </p>
            </div>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-accent-error/10 rounded-m text-accent-error text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-light">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !file}>
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              "Create Playbook"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
