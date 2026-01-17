"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input, Textarea } from "@/components/ui";
import { MatterCard, NewMatterModal } from "@/components/matters";
import { formatDate } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as Id<"clients">;
  
  const client = useQuery(api.clients.get, { id: clientId });
  const matters = useQuery(api.matters.list, { clientId });
  const updateClient = useMutation(api.clients.update);
  const deleteClient = useMutation(api.clients.remove);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showNewMatter, setShowNewMatter] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [notes, setNotes] = useState("");

  const startEditing = () => {
    if (client) {
      setName(client.name);
      setEmail(client.email || "");
      setPhone(client.phone || "");
      setCompany(client.company || "");
      setAddress(client.address || "");
      setIndustry(client.industry || "");
      setNotes(client.notes || "");
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      await updateClient({
        id: clientId,
        name,
        email: email || undefined,
        phone: phone || undefined,
        company: company || undefined,
        address: address || undefined,
        industry: industry || undefined,
        notes: notes || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update client:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this client? This will also delete all associated matters.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteClient({ id: clientId });
      router.push("/clients");
    } catch (err) {
      console.error("Failed to delete client:", err);
      setIsDeleting(false);
    }
  };

  if (client === undefined) {
    return (
      <>
        <Header title="Loading..." />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="card">
              <div className="h-6 bg-secondary rounded w-1/3 mb-4" />
              <div className="h-4 bg-secondary rounded w-1/2" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (client === null) {
    return (
      <>
        <Header title="Client Not Found" />
        <div className="flex-1 p-8 bg-background">
          <div className="text-center py-20 bg-white/40 rounded-l shadow-subtle">
            <p className="text-xl font-heading font-bold text-secondary/60 mb-8">This client could not be found.</p>
            <Button onClick={() => router.push("/clients")} size="lg">
              Back to Clients
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={isEditing ? "Edit Client" : client.name}
        description={client.company || undefined}
        actions={
          isEditing ? (
            <div className="flex gap-4">
              <Button variant="ghost" onClick={cancelEditing} className="px-8">
                Cancel
              </Button>
              <Button onClick={saveChanges} isLoading={isSaving} className="px-8">
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button variant="ghost" onClick={startEditing} className="px-8">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
              <Button onClick={() => setShowNewMatter(true)} className="px-8">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Matter
              </Button>
            </div>
          )
        }
      />

      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Details */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="mb-8">
                <CardTitle className="flex items-center gap-4 text-3xl font-heading font-extrabold">
                  <div className="w-16 h-16 bg-primary rounded-m flex items-center justify-center shadow-subtle">
                    <span className="text-secondary font-heading font-extrabold text-2xl">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {isEditing ? "Edit Details" : "Client Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isEditing ? (
                  <div className="space-y-6">
                    <Input
                      id="name"
                      label="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      id="company"
                      label="Company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                    <Input
                      id="email"
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      id="phone"
                      label="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input
                      id="address"
                      label="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <Input
                      id="industry"
                      label="Industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                    <Textarea
                      id="notes"
                      label="Notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="pt-8 border-t border-neutral-light">
                      <Button
                        variant="ghost"
                        className="text-accent-error border-accent-error hover:bg-accent-error hover:text-white w-full"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                      >
                        Delete Client
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {client.email && (
                      <div className="p-4 rounded-m bg-neutral-light/50">
                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Email</p>
                        <p className="text-secondary font-body font-bold">{client.email}</p>
                      </div>
                    )}
                    {client.phone && (
                      <div className="p-4 rounded-m bg-neutral-light/50">
                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Phone</p>
                        <p className="text-secondary font-body font-bold">{client.phone}</p>
                      </div>
                    )}
                    {client.address && (
                      <div className="p-4 rounded-m bg-neutral-light/50">
                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Address</p>
                        <p className="text-secondary font-body font-bold">{client.address}</p>
                      </div>
                    )}
                    {client.industry && (
                      <div className="p-4 rounded-m bg-neutral-light/50">
                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Industry</p>
                        <Badge variant="default" className="bg-primary/20 text-secondary">{client.industry}</Badge>
                      </div>
                    )}
                    {client.notes && (
                      <div className="p-4 rounded-m bg-neutral-light/50">
                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Notes</p>
                        <p className="text-secondary/70 font-body font-medium leading-relaxed">{client.notes}</p>
                      </div>
                    )}
                    <div className="pt-8 border-t border-neutral-light">
                      <p className="text-xs font-bold text-secondary/30 uppercase tracking-widest">
                        Added {formatDate(client.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Matters */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between mb-8">
                <CardTitle className="text-3xl font-heading font-extrabold">
                  Matters ({matters?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {matters && matters.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {matters.map((matter) => (
                      <MatterCard key={matter._id} matter={matter} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-neutral-light/30 rounded-m">
                    <p className="text-xl font-heading font-bold text-secondary/60 mb-8">No matters for this client yet.</p>
                    <Button onClick={() => setShowNewMatter(true)} size="lg">
                      Create First Matter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <NewMatterModal
        isOpen={showNewMatter}
        onClose={() => setShowNewMatter(false)}
        preselectedClientId={clientId}
      />
    </>
  );
}
