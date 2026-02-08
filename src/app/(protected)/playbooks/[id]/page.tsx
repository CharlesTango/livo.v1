"use client";

import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Header } from "@/components/layout";
import { Button, Badge, Modal } from "@/components/ui";
import { ClauseCard } from "@/components/playbooks";
import { useState } from "react";
import { formatDate, playbookStatusColors } from "@/lib/utils";

export default function PlaybookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playbookId = params.id as Id<"playbooks">;

  const playbook = useQuery(api.playbooks.getWithFileUrl, { id: playbookId });
  const clauses = useQuery(api.clauses.listByPlaybook, { playbookId });
  const removePlaybook = useMutation(api.playbooks.remove);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removePlaybook({ id: playbookId });
      router.push("/playbooks");
    } catch (error) {
      console.error("Failed to delete playbook:", error);
      setIsDeleting(false);
    }
  };

  const toggleClause = (clauseId: string) => {
    setExpandedClauses((prev) => {
      const next = new Set(prev);
      if (next.has(clauseId)) {
        next.delete(clauseId);
      } else {
        next.add(clauseId);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (clauses) {
      setExpandedClauses(new Set(clauses.map((c) => c._id)));
    }
  };

  const collapseAll = () => {
    setExpandedClauses(new Set());
  };

  if (playbook === undefined || clauses === undefined) {
    return (
      <>
        <Header title="Loading..." />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white/50 rounded-l" />
            <div className="h-64 bg-white/50 rounded-l" />
          </div>
        </div>
      </>
    );
  }

  if (playbook === null) {
    return (
      <>
        <Header title="Playbook Not Found" />
        <div className="flex-1 p-8">
          <div className="text-center py-20 bg-white/40 rounded-l shadow-subtle">
            <p className="text-xl font-heading font-bold text-secondary/60 mb-8">
              This playbook does not exist or you do not have access to it.
            </p>
            <Button onClick={() => router.push("/playbooks")}>
              Back to Playbooks
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={playbook.name}
        description={playbook.description}
        actions={
          <div className="flex items-center gap-3">
            {playbook.fileUrl && (
              <Button
                variant="secondary"
                onClick={() => window.open(playbook.fileUrl!, "_blank")}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Original
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(true)}
              className="text-accent-error hover:bg-accent-error/10"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-8">
        {/* Playbook Info Card */}
        <div className="bg-white rounded-l shadow-subtle p-6 mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-secondary/60">Agreement Type:</span>
              <span className="text-xs font-bold bg-neutral-light text-secondary/60 px-3 py-1.5 rounded-pill uppercase tracking-wider">
                {playbook.agreementType}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-secondary/60">Status:</span>
              <Badge variant="default" className={playbookStatusColors[playbook.status]}>
                {playbook.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-secondary/60">Clauses:</span>
              <span className="text-sm font-bold text-secondary">{playbook.clauseCount}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-secondary/60">Created:</span>
              <span className="text-sm text-secondary">{formatDate(playbook.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-secondary/60">File:</span>
              <span className="text-sm text-secondary">{playbook.fileName}</span>
            </div>
          </div>
          {playbook.status === "error" && playbook.errorMessage && (
            <div className="mt-4 p-4 bg-accent-error/10 rounded-m text-accent-error text-sm">
              <strong>Error:</strong> {playbook.errorMessage}
            </div>
          )}
          {playbook.status === "processing" && (
            <div className="mt-4 p-4 bg-primary-yellow/10 rounded-m text-secondary text-sm flex items-center gap-3">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing document... This may take a few moments.
            </div>
          )}
        </div>

        {/* Clauses Section */}
        {playbook.status === "ready" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold text-secondary">Clauses</h2>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={expandAll}>
                  Expand All
                </Button>
                <Button variant="ghost" size="sm" onClick={collapseAll}>
                  Collapse All
                </Button>
              </div>
            </div>

            {clauses.length > 0 ? (
              <div className="space-y-4">
                {clauses.map((clause) => (
                  <ClauseCard
                    key={clause._id}
                    clause={clause}
                    isExpanded={expandedClauses.has(clause._id)}
                    onToggle={() => toggleClause(clause._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/40 rounded-l shadow-subtle">
                <p className="text-secondary/60">No clauses found in this playbook.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Playbook"
      >
        <div className="space-y-6">
          <p className="text-secondary/70">
            Are you sure you want to delete <strong>{playbook.name}</strong>? This will also delete all associated clauses. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-accent-error hover:bg-accent-error/90"
            >
              {isDeleting ? "Deleting..." : "Delete Playbook"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
