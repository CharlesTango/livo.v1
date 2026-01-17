"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import { Button, Input, Select } from "@/components/ui";
import { MatterCard, NewMatterModal } from "@/components/matters";
import { useState, useMemo } from "react";

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

        {/* Matters Grid */}
        {matters === undefined ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse h-64 bg-white/50" />
            ))}
          </div>
        ) : filteredMatters.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredMatters.map((matter) => (
              <MatterCard
                key={matter._id}
                matter={matter}
                clientName={clientMap[matter.clientId]}
              />
            ))}
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
