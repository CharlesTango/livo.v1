"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import { Button, Input, Select, Badge } from "@/components/ui";
import { NewPlaybookModal } from "@/components/playbooks";
import { useState, useMemo } from "react";
import { formatDate, playbookStatusColors } from "@/lib/utils";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "ready", label: "Ready" },
  { value: "processing", label: "Processing" },
  { value: "error", label: "Error" },
];

const agreementTypeOptions = [
  { value: "", label: "All Types" },
  { value: "NDA", label: "NDA" },
  { value: "MSA", label: "MSA" },
  { value: "Employment", label: "Employment" },
  { value: "License", label: "License" },
  { value: "SaaS", label: "SaaS" },
  { value: "Other", label: "Other" },
];

export default function PlaybooksPage() {
  const playbooks = useQuery(api.playbooks.list, {});
  const router = useRouter();

  const [showNewPlaybook, setShowNewPlaybook] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredPlaybooks = useMemo(() => {
    if (!playbooks) return [];

    return playbooks.filter((playbook) => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          playbook.name.toLowerCase().includes(term) ||
          playbook.description?.toLowerCase().includes(term) ||
          playbook.agreementType.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter && playbook.status !== statusFilter) return false;

      // Type filter
      if (typeFilter && playbook.agreementType !== typeFilter) return false;

      return true;
    });
  }, [playbooks, searchTerm, statusFilter, typeFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setTypeFilter("");
  };

  const hasFilters = searchTerm || statusFilter || typeFilter;

  const handleRowClick = (playbookId: string) => {
    router.push(`/playbooks/${playbookId}`);
  };

  return (
    <>
      <Header
        title="Playbooks"
        description="Create and manage your legal playbooks for agreement review."
        actions={
          <Button onClick={() => setShowNewPlaybook(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Playbook
          </Button>
        }
      />

      <div className="flex-1 p-8">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-6 mb-10">
          <div className="flex-1 min-w-[300px] max-w-md">
            <div className="relative">
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                id="search"
                placeholder="Search playbooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14"
              />
            </div>
          </div>

          <div className="w-48">
            <Select
              id="status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          <div className="w-48">
            <Select
              id="type"
              options={agreementTypeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>

          {hasFilters && (
            <Button variant="ghost" size="md" onClick={clearFilters} className="px-8">
              Clear Filters
            </Button>
          )}
        </div>

        {/* Playbooks Table */}
        {playbooks === undefined ? (
          <div className="bg-white rounded-l shadow-subtle overflow-hidden">
            <div className="animate-pulse">
              <div className="h-14 bg-neutral-light/50 border-b border-neutral-light" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 border-b border-neutral-light/50 bg-white/50" />
              ))}
            </div>
          </div>
        ) : filteredPlaybooks.length > 0 ? (
          <div className="bg-white rounded-l shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-light/50 border-b border-neutral-light">
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Playbook</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Agreement Type</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Clauses</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Created</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlaybooks.map((playbook) => (
                    <tr
                      key={playbook._id}
                      onClick={() => handleRowClick(playbook._id)}
                      className="border-b border-neutral-light/50 hover:bg-primary/5 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-m flex items-center justify-center shrink-0 shadow-subtle">
                            <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="font-heading font-bold text-secondary truncate max-w-[250px]">{playbook.name}</p>
                            {playbook.description && (
                              <p className="text-xs text-secondary/50 truncate max-w-[250px]">{playbook.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold bg-neutral-light text-secondary/60 px-3 py-1.5 rounded-pill uppercase tracking-wider whitespace-nowrap">
                          {playbook.agreementType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-secondary/70">
                          {playbook.clauseCount} {playbook.clauseCount === 1 ? "clause" : "clauses"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="default" className={playbookStatusColors[playbook.status]}>
                          {playbook.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-secondary/60">{formatDate(playbook.createdAt)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <svg className="w-5 h-5 text-secondary/20 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : playbooks.length > 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-l shadow-subtle">
            <div className="w-20 h-20 bg-neutral-light rounded-pill flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-secondary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xl font-heading font-bold text-secondary/60 mb-8">No playbooks found with the current filters.</p>
            <Button variant="secondary" onClick={clearFilters} size="lg">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-l shadow-subtle">
            <div className="w-20 h-20 bg-neutral-light rounded-pill flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-secondary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-xl font-heading font-bold text-secondary/60 mb-8">No playbooks yet</p>
            <p className="text-secondary/50 mb-8 max-w-md mx-auto">
              Create a playbook by uploading an agreement template. The AI will extract clauses and generate summaries and fallback positions.
            </p>
            <Button onClick={() => setShowNewPlaybook(true)} size="lg">
              Create Your First Playbook
            </Button>
          </div>
        )}
      </div>

      <NewPlaybookModal
        isOpen={showNewPlaybook}
        onClose={() => setShowNewPlaybook(false)}
      />
    </>
  );
}
