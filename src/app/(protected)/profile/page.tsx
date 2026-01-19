"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from "@/components/ui";

export default function ProfilePage() {
  const user = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.updateProfile);
  
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync user data to form when loaded
  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updateProfile({ name: name.trim() || undefined });
      setSaveMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = user && name !== (user.name || "");

  if (!user) {
    return (
      <>
        <Header title="Profile" description="Manage your account settings" />
        <div className="flex-1 p-8">
          <div className="max-w-2xl">
            <Card>
              <CardContent>
                <div className="flex items-center justify-center py-12">
                  <div className="animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/30 rounded-full"></div>
                    <span className="text-secondary/50 font-medium">Loading profile...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Profile" description="Manage your account settings" />
      
      <div className="flex-1 p-8">
        <div className="max-w-2xl space-y-8">
          {/* Profile Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary rounded-pill flex items-center justify-center shadow-subtle border-4 border-white">
                  <span className="text-secondary font-heading font-bold text-3xl">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-secondary">
                    {user.name || "User"}
                  </h3>
                  <p className="text-secondary/60 font-medium">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-secondary mb-2">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-secondary mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="opacity-60 cursor-not-allowed"
                  />
                  <p className="mt-2 text-sm text-secondary/50">
                    Email cannot be changed as it is used for authentication.
                  </p>
                </div>

                {/* Save Message */}
                {saveMessage && (
                  <div
                    className={`p-4 rounded-m font-medium ${
                      saveMessage.type === "success"
                        ? "bg-accent-success/10 text-accent-success"
                        : "bg-accent-error/10 text-accent-error"
                    }`}
                  >
                    {saveMessage.text}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center gap-4">
                  <Button
                    type="submit"
                    disabled={isSaving || !hasChanges}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  {hasChanges && (
                    <span className="text-sm text-secondary/50 font-medium">
                      You have unsaved changes
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex justify-between py-3 border-b border-neutral-light/50">
                  <dt className="font-medium text-secondary/70">Account Status</dt>
                  <dd className="font-bold text-accent-success">Active</dd>
                </div>
                {user.emailVerificationTime && (
                  <div className="flex justify-between py-3 border-b border-neutral-light/50">
                    <dt className="font-medium text-secondary/70">Email Verified</dt>
                    <dd className="font-bold text-secondary">
                      {new Date(user.emailVerificationTime).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
