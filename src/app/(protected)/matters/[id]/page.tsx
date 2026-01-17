"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input, Textarea, Select } from "@/components/ui";
import { formatDate, matterStatusColors, priorityColors } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";

const matterTypes = [
  { value: "contract", label: "Contract" },
  { value: "litigation", label: "Litigation" },
  { value: "advisory", label: "Advisory" },
  { value: "compliance", label: "Compliance" },
  { value: "corporate", label: "Corporate" },
  { value: "employment", label: "Employment" },
  { value: "intellectual-property", label: "Intellectual Property" },
  { value: "real-estate", label: "Real Estate" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "pending-review", label: "Pending Review" },
  { value: "closed", label: "Closed" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function MatterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matterId = params.id as Id<"matters">;
  
  const matterWithClient = useQuery(api.matters.getWithClient, { id: matterId });
  const clients = useQuery(api.clients.list);
  const updateMatter = useMutation(api.matters.update);
  const deleteMatter = useMutation(api.matters.remove);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [matterType, setMatterType] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [clientId, setClientId] = useState("");

  const matter = matterWithClient;
  const client = matterWithClient?.client;

  const startEditing = () => {
    if (matter) {
      setTitle(matter.title);
      setDescription(matter.description || "");
      setMatterType(matter.matterType);
      setStatus(matter.status);
      setPriority(matter.priority);
      setDueDate(matter.dueDate ? new Date(matter.dueDate).toISOString().split("T")[0] : "");
      setNotes(matter.notes || "");
      setClientId(matter.clientId);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      await updateMatter({
        id: matterId,
        clientId: clientId as Id<"clients">,
        title,
        description: description || undefined,
        matterType,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        notes: notes || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update matter:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this matter?")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteMatter({ id: matterId });
      router.push("/matters");
    } catch (err) {
      console.error("Failed to delete matter:", err);
      setIsDeleting(false);
    }
  };

  const clientOptions = [
    { value: "", label: "Select a client..." },
    ...(clients?.map((c) => ({ value: c._id, label: c.name + (c.company ? ` (${c.company})` : "") })) || []),
  ];

  if (matter === undefined) {
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

  if (matter === null) {
    return (
      <>
        <Header title="Matter Not Found" />
        <div className="flex-1 p-8 bg-background">
          <div className="text-center py-20 bg-white/40 rounded-l shadow-subtle">
            <p className="text-xl font-heading font-bold text-secondary/60 mb-8">This matter could not be found.</p>
            <Button onClick={() => router.push("/matters")} size="lg">
              Back to Matters
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={isEditing ? "Edit Matter" : matter.title}
        description={client?.name || undefined}
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
            </div>
          )
        }
      />

      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <Card className="h-full">
              <CardHeader className="mb-8">
                <CardTitle className="text-3xl font-heading font-extrabold">Matter Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isEditing ? (
                  <div className="space-y-6">
                    <Input
                      id="title"
                      label="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                      id="description"
                      label="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[200px]"
                    />
                    <Select
                      id="client"
                      label="Client"
                      options={clientOptions}
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    {matter.description ? (
                      <p className="text-secondary/70 font-body font-medium text-lg leading-relaxed whitespace-pre-wrap">{matter.description}</p>
                    ) : (
                      <p className="text-secondary/40 font-body italic">No description provided.</p>
                    )}
                    
                    {client && (
                      <div className="mt-10 pt-10 border-t border-neutral-light">
                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-4">Client Reference</p>
                        <Link
                          href={`/clients/${client._id}`}
                          className="inline-flex items-center gap-5 p-5 rounded-m bg-neutral-light/50 border-2 border-transparent hover:border-primary/30 hover:bg-white transition-all duration-300"
                        >
                          <div className="w-12 h-12 bg-primary rounded-m flex items-center justify-center shadow-subtle">
                            <span className="text-secondary font-heading font-extrabold text-xl">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-xl font-heading font-extrabold text-secondary">{client.name}</p>
                            {client.company && (
                              <p className="text-sm font-body font-bold text-secondary/50 uppercase tracking-wider">{client.company}</p>
                            )}
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Card */}
            <Card>
              <CardHeader className="mb-8">
                <CardTitle className="text-3xl font-heading font-extrabold">Strategic Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes, key considerations, action items..."
                    className="min-h-[200px]"
                  />
                ) : matter.notes ? (
                  <p className="text-secondary/70 font-body font-medium leading-relaxed whitespace-pre-wrap">{matter.notes}</p>
                ) : (
                  <p className="text-secondary/40 font-body italic">No notes added.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Status Card */}
            <Card>
              <CardHeader className="mb-8">
                <CardTitle className="text-2xl font-heading font-extrabold text-secondary">Status &amp; Priority</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isEditing ? (
                  <div className="space-y-6">
                    <Select
                      id="status"
                      label="Status"
                      options={statusOptions}
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    />
                    <Select
                      id="priority"
                      label="Priority"
                      options={priorityOptions}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    />
                    <Select
                      id="matterType"
                      label="Matter Type"
                      options={matterTypes}
                      value={matterType}
                      onChange={(e) => setMatterType(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 rounded-m bg-neutral-light/50">
                      <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Current Status</p>
                      <Badge variant="default" className={matterStatusColors[matter.status]}>
                        {matter.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="p-4 rounded-m bg-neutral-light/50">
                      <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Priority Level</p>
                      <Badge variant="default" className={priorityColors[matter.priority]}>
                        {matter.priority}
                      </Badge>
                    </div>
                    <div className="p-4 rounded-m bg-neutral-light/50">
                      <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Matter Type</p>
                      <span className="text-secondary font-body font-bold uppercase tracking-wider">
                        {matter.matterType.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dates Card */}
            <Card>
              <CardHeader className="mb-8">
                <CardTitle className="text-2xl font-heading font-extrabold text-secondary">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-m bg-neutral-light/30">
                      <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Date Opened</p>
                      <p className="text-secondary font-body font-bold">{formatDate(matter.openDate)}</p>
                    </div>
                    <Input
                      id="dueDate"
                      type="date"
                      label="Due Date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 rounded-m bg-neutral-light/50">
                      <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Date Opened</p>
                      <p className="text-secondary font-body font-bold">{formatDate(matter.openDate)}</p>
                    </div>
                    {matter.dueDate && (
                      <div className="p-4 rounded-m bg-primary/10 border-2 border-primary/20">
                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Due Date</p>
                        <p className="text-secondary font-heading font-extrabold text-lg">{formatDate(matter.dueDate)}</p>
                      </div>
                    )}
                    <div className="p-4 rounded-m bg-neutral-light/50">
                      <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-2">Last Updated</p>
                      <p className="text-secondary/70 font-body font-medium">{formatDate(matter.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delete Button (only in edit mode) */}
            {isEditing && (
              <div className="pt-4">
                <Button
                  variant="ghost"
                  className="text-accent-error border-accent-error hover:bg-accent-error hover:text-white w-full py-4"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                >
                  Delete Matter
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
