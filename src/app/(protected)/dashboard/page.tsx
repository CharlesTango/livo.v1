"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { formatDate, matterStatusColors, priorityColors } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { NewMatterModal } from "@/components/matters/NewMatterModal";
import { NewClientModal } from "@/components/clients/NewClientModal";

export default function DashboardPage() {
  const stats = useQuery(api.matters.stats);
  const recentMatters = useQuery(api.matters.recent, { limit: 5 });
  const clients = useQuery(api.clients.list);
  
  const [showNewMatter, setShowNewMatter] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);

  return (
    <>
      <Header
        title="Dashboard"
        description="Welcome back. Here's an overview of your practice."
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowNewClient(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Client
            </Button>
            <Button onClick={() => setShowNewMatter(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Matter
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-secondary/50 uppercase tracking-wider">Total Matters</p>
                  <p className="text-4xl font-heading font-extrabold text-secondary mt-2">
                    {stats?.total ?? 0}
                  </p>
                </div>
                <div className="w-14 h-14 bg-primary rounded-m flex items-center justify-center shadow-subtle">
                  <svg className="w-7 h-7 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-secondary/50 uppercase tracking-wider">Open</p>
                  <p className="text-4xl font-heading font-extrabold text-secondary mt-2">
                    {stats?.open ?? 0}
                  </p>
                </div>
                <div className="w-14 h-14 bg-primary-yellow rounded-m flex items-center justify-center shadow-subtle">
                  <svg className="w-7 h-7 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-secondary/50 uppercase tracking-wider">In Progress</p>
                  <p className="text-4xl font-heading font-extrabold text-secondary mt-2">
                    {stats?.inProgress ?? 0}
                  </p>
                </div>
                <div className="w-14 h-14 bg-secondary rounded-m flex items-center justify-center shadow-subtle">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-secondary/50 uppercase tracking-wider">Pending</p>
                  <p className="text-4xl font-heading font-extrabold text-secondary mt-2">
                    {stats?.pendingReview ?? 0}
                  </p>
                </div>
                <div className="w-14 h-14 bg-neutral-light rounded-m flex items-center justify-center shadow-subtle border-2 border-neutral-medium/20">
                  <svg className="w-7 h-7 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-secondary/50 uppercase tracking-wider">Clients</p>
                  <p className="text-4xl font-heading font-extrabold text-secondary mt-2">
                    {clients?.length ?? 0}
                  </p>
                </div>
                <div className="w-14 h-14 bg-accent-soft rounded-m flex items-center justify-center shadow-subtle">
                  <svg className="w-7 h-7 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Matters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between mb-8">
            <CardTitle className="text-3xl font-heading font-extrabold">Recent Matters</CardTitle>
            <Link href="/matters">
              <Button variant="ghost" size="sm" className="px-6">
                View All
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentMatters && recentMatters.length > 0 ? (
              <div className="space-y-4">
                {recentMatters.map((matter) => (
                  <Link
                    key={matter._id}
                    href={`/matters/${matter._id}`}
                    className="block p-6 rounded-m bg-neutral-light/50 border-2 border-transparent hover:border-primary/30 hover:bg-white transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-xl font-heading font-bold text-secondary">{matter.title}</h4>
                        <p className="text-secondary/60 mt-2 line-clamp-1 font-body">
                          {matter.description || "No description"}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                          <Badge variant="default" className={matterStatusColors[matter.status]}>
                            {matter.status.replace("-", " ")}
                          </Badge>
                          <Badge variant="default" className={priorityColors[matter.priority]}>
                            {matter.priority}
                          </Badge>
                          <span className="text-xs font-bold text-secondary/40 uppercase tracking-widest">
                            Opened {formatDate(matter.openDate)}
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-pill flex items-center justify-center bg-white shadow-subtle">
                        <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-neutral-light/30 rounded-m">
                <div className="w-20 h-20 bg-neutral-light rounded-pill flex items-center justify-center mx-auto mb-6 shadow-subtle border-2 border-white">
                  <svg className="w-10 h-10 text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xl font-heading font-bold text-secondary/60 mb-8">No matters yet</p>
                <Button onClick={() => setShowNewMatter(true)} size="lg">
                  Create Your First Matter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <NewMatterModal
        isOpen={showNewMatter}
        onClose={() => setShowNewMatter(false)}
      />
      <NewClientModal
        isOpen={showNewClient}
        onClose={() => setShowNewClient(false)}
      />
    </>
  );
}
