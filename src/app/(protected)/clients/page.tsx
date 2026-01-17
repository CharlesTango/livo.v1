"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { ClientCard, NewClientModal } from "@/components/clients";
import { useState, useMemo } from "react";

export default function ClientsPage() {
  const clients = useQuery(api.clients.list);
  const [showNewClient, setShowNewClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    if (!searchTerm) return clients;
    
    const term = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.company?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.industry?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  return (
    <>
      <Header
        title="Clients"
        description="Manage your client relationships."
        actions={
          <Button onClick={() => setShowNewClient(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Client
          </Button>
        }
      />

      <div className="flex-1 p-8">
        {/* Search */}
        <div className="mb-10">
          <div className="relative max-w-md">
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
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14"
            />
          </div>
        </div>

        {/* Clients Grid */}
        {clients === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse h-48 bg-white/50" />
            ))}
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClients.map((client) => (
              <ClientCard key={client._id} client={client} />
            ))}
          </div>
        ) : clients.length > 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-l shadow-subtle">
            <div className="w-20 h-20 bg-neutral-light rounded-pill flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-secondary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xl font-heading font-bold text-secondary/60 mb-8">No clients found matching &quot;{searchTerm}&quot;</p>
            <Button variant="secondary" onClick={() => setSearchTerm("")} size="lg">
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-l shadow-subtle">
            <div className="w-20 h-20 bg-neutral-light rounded-pill flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-secondary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-xl font-heading font-bold text-secondary/60 mb-8">No clients yet</p>
            <Button onClick={() => setShowNewClient(true)} size="lg">
              Add Your First Client
            </Button>
          </div>
        )}
      </div>

      <NewClientModal
        isOpen={showNewClient}
        onClose={() => setShowNewClient(false)}
      />
    </>
  );
}
