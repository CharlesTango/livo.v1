"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Modal, Button, Input, Textarea } from "@/components/ui";
import { useState } from "react";

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewClientModal({ isOpen, onClose }: NewClientModalProps) {
  const createClient = useMutation(api.clients.create);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createClient({
        name,
        email: email || undefined,
        phone: phone || undefined,
        company: company || undefined,
        address: address || undefined,
        industry: industry || undefined,
        notes: notes || undefined,
      });
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setAddress("");
      setIndustry("");
      setNotes("");
      onClose();
    } catch (err) {
      setError("Failed to create client. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setAddress("");
    setIndustry("");
    setNotes("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Client" className="max-w-3xl">
      {error && (
        <div className="bg-accent-error/10 border-2 border-accent-error/20 text-accent-error px-6 py-4 rounded-m mb-8 font-body font-bold text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            id="name"
            label="Client Name *"
            placeholder="John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="company"
            label="Company"
            placeholder="Acme Corporation"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="phone"
            label="Phone"
            placeholder="+1 (555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <Input
          id="address"
          label="Address"
          placeholder="123 Main St, City, State 12345"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Input
          id="industry"
          label="Industry"
          placeholder="Technology, Healthcare, Finance..."
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />

        <Textarea
          id="notes"
          label="Notes"
          placeholder="Additional notes about this client..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-4 pt-8 border-t border-neutral-light">
          <Button type="button" variant="ghost" onClick={handleClose} className="px-8">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="px-8">
            Add Client
          </Button>
        </div>
      </form>
    </Modal>
  );
}
