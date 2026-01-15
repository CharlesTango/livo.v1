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
        <div className="flex-1 p-8">
          <div className="text-center py-12">
            <p className="text-primary/60 mb-4">This client could not be found.</p>
            <Button onClick={() => router.push("/clients")}>
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
            <div className="flex gap-3">
              <Button variant="secondary" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button onClick={saveChanges} isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={startEditing}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
              <Button onClick={() => setShowNewMatter(true)}>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/20 rounded-card flex items-center justify-center">
                    <span className="text-primary font-bold text-xl">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {isEditing ? "Edit Details" : "Client Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
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
                    <div className="pt-4 border-t border-secondary/30">
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                      >
                        Delete Client
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {client.email && (
                      <div>
                        <p className="text-xs text-primary/50 uppercase tracking-wider mb-1">Email</p>
                        <p className="text-primary">{client.email}</p>
                      </div>
                    )}
                    {client.phone && (
                      <div>
                        <p className="text-xs text-primary/50 uppercase tracking-wider mb-1">Phone</p>
                        <p className="text-primary">{client.phone}</p>
                      </div>
                    )}
                    {client.address && (
                      <div>
                        <p className="text-xs text-primary/50 uppercase tracking-wider mb-1">Address</p>
                        <p className="text-primary">{client.address}</p>
                      </div>
                    )}
                    {client.industry && (
                      <div>
                        <p className="text-xs text-primary/50 uppercase tracking-wider mb-1">Industry</p>
                        <Badge variant="default">{client.industry}</Badge>
                      </div>
                    )}
                    {client.notes && (
                      <div>
                        <p className="text-xs text-primary/50 uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-primary/70 text-sm">{client.notes}</p>
                      </div>
                    )}
                    <div className="pt-4 border-t border-secondary/30">
                      <p className="text-xs text-primary/50">
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Matters ({matters?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matters && matters.length > 0 ? (
                  <div className="space-y-4">
                    {matters.map((matter) => (
                      <MatterCard key={matter._id} matter={matter} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-primary/60 mb-4">No matters for this client yet.</p>
                    <Button variant="secondary" onClick={() => setShowNewMatter(true)}>
                      Create Matter
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
