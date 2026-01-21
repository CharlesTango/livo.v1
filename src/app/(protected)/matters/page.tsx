"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import { Button, Input, Select, Badge } from "@/components/ui";
import { NewMatterModal } from "@/components/matters";
import { useState, useMemo } from "react";
import { formatDate, matterStatusColors, priorityColors } from "@/lib/utils";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "pending-review", label: "Pending Review" },
  { value: "closed", label: "Closed" },
];

const priorityOptions = [
  { value: "", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function MattersPage() {
  const matters = useQuery(api.matters.list, {});
  const clients = useQuery(api.clients.list);
  const router = useRouter();
  
  const [showNewMatter, setShowNewMatter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Create a map of client IDs to names
  const clientMap = useMemo(() => {
    if (!clients) return {};
    return Object.fromEntries(clients.map((c) => [c._id, c.name]));
  }, [clients]);

  const filteredMatters = useMemo(() => {
    if (!matters) return [];
    
    return matters.filter((matter) => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          matter.title.toLowerCase().includes(term) ||
          matter.description?.toLowerCase().includes(term) ||
          clientMap[matter.clientId]?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (statusFilter && matter.status !== statusFilter) return false;
      
      // Priority filter
      if (priorityFilter && matter.priority !== priorityFilter) return false;
      
      return true;
    });
  }, [matters, searchTerm, statusFilter, priorityFilter, clientMap]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  const hasFilters = searchTerm || statusFilter || priorityFilter;

  const handleRowClick = (matterId: string) => {
    router.push(`/matters/${matterId}`);
  };

  return (
    <>
      <Header
        title="Matters"
        description="Track and manage all your legal matters."
        actions={
          <Button onClick={() => setShowNewMatter(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Matter
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
                placeholder="Search matters..."
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
              id="priority"
              options={priorityOptions}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            />
          </div>
          
          {hasFilters && (
            <Button variant="ghost" size="md" onClick={clearFilters} className="px-8">
              Clear Filters
            </Button>
          )}
        </div>

        {/* Matters Table */}
        {matters === undefined ? (
          <div className="bg-white rounded-l shadow-subtle overflow-hidden">
            <div className="animate-pulse">
              <div className="h-14 bg-neutral-light/50 border-b border-neutral-light" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 border-b border-neutral-light/50 bg-white/50" />
              ))}
            </div>
          </div>
        ) : filteredMatters.length > 0 ? (
          <div className="bg-white rounded-l shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-light/50 border-b border-neutral-light">
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Matter</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Client</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Priority</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Opened</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-secondary/60 uppercase tracking-wider">Due Date</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatters.map((matter) => (
                    <tr
                      key={matter._id}
                      onClick={() => handleRowClick(matter._id)}
                      className="border-b border-neutral-light/50 hover:bg-primary/5 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-m flex items-center justify-center shrink-0 shadow-subtle">
                            <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="font-heading font-bold text-secondary truncate max-w-[200px]">{matter.title}</p>
                            {matter.description && (
                              <p className="text-xs text-secondary/50 truncate max-w-[200px]">{matter.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-secondary/70">{clientMap[matter.clientId] || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold bg-neutral-light text-secondary/60 px-3 py-1.5 rounded-pill uppercase tracking-wider whitespace-nowrap">
                          {matter.matterType.replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="default" className={matterStatusColors[matter.status]}>
                          {matter.status.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="default" className={priorityColors[matter.priority]}>
                          {matter.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-secondary/60">{formatDate(matter.openDate)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-secondary/60">{matter.dueDate ? formatDate(matter.dueDate) : "—"}</span>
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
        ) : matters.length > 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-l shadow-subtle">
            <div className="w-20 h-20 bg-neutral-light rounded-pill flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-secondary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xl font-heading font-bold text-secondary/60 mb-8">No matters found with the current filters.</p>
            <Button variant="secondary" onClick={clearFilters} size="lg">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-l shadow-subtle">
            <div className="w-20 h-20 bg-neutral-light rounded-pill flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-secondary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl font-heading font-bold text-secondary/60 mb-8">No matters yet</p>
            <Button onClick={() => setShowNewMatter(true)} size="lg">
              Create Your First Matter
            </Button>
          </div>
        )}
      </div>

      <NewMatterModal
        isOpen={showNewMatter}
        onClose={() => setShowNewMatter(false)}
      />
    </>
  );
}
