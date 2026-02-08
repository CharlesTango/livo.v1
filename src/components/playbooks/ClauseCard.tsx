"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button, Input, Textarea } from "@/components/ui";

interface FallbackPosition {
  position: string;
  rationale?: string;
}

interface Clause {
  _id: Id<"clauses">;
  order: number;
  title: string;
  originalText: string;
  summary?: string;
  description?: string;
  talkingPoints?: string[];
  fallbackPositions?: FallbackPosition[];
}

interface ClauseCardProps {
  clause: Clause;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ClauseCard({ clause, isExpanded, onToggle }: ClauseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [summary, setSummary] = useState(clause.summary || "");
  const [description, setDescription] = useState(clause.description || "");
  const [talkingPoints, setTalkingPoints] = useState<string[]>(clause.talkingPoints || []);
  const [fallbackPositions, setFallbackPositions] = useState<FallbackPosition[]>(
    clause.fallbackPositions || []
  );

  const updateClause = useMutation(api.clauses.update);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateClause({
        id: clause._id,
        summary: summary || undefined,
        description: description || undefined,
        talkingPoints: talkingPoints.filter((tp) => tp.trim()),
        fallbackPositions: fallbackPositions.filter((fp) => fp.position.trim()),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save clause:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setSummary(clause.summary || "");
    setDescription(clause.description || "");
    setTalkingPoints(clause.talkingPoints || []);
    setFallbackPositions(clause.fallbackPositions || []);
    setIsEditing(false);
  };

  const addTalkingPoint = () => {
    setTalkingPoints([...talkingPoints, ""]);
  };

  const updateTalkingPoint = (index: number, value: string) => {
    const updated = [...talkingPoints];
    updated[index] = value;
    setTalkingPoints(updated);
  };

  const removeTalkingPoint = (index: number) => {
    setTalkingPoints(talkingPoints.filter((_, i) => i !== index));
  };

  const addFallbackPosition = () => {
    setFallbackPositions([...fallbackPositions, { position: "", rationale: "" }]);
  };

  const updateFallbackPosition = (index: number, field: keyof FallbackPosition, value: string) => {
    const updated = [...fallbackPositions];
    updated[index] = { ...updated[index], [field]: value };
    setFallbackPositions(updated);
  };

  const removeFallbackPosition = (index: number) => {
    setFallbackPositions(fallbackPositions.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-l shadow-subtle overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-light/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-secondary">
            {clause.order + 1}
          </span>
          <h3 className="font-heading font-bold text-secondary text-left">{clause.title}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-secondary/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-neutral-light">
          {/* Original Text */}
          <div className="px-6 py-4 bg-neutral-light/20">
            <h4 className="text-xs font-bold text-secondary/60 uppercase tracking-wider mb-2">
              Original Clause Text
            </h4>
            <p className="text-sm text-secondary/80 whitespace-pre-wrap">{clause.originalText}</p>
          </div>

          {/* Editable Content */}
          <div className="px-6 py-4 space-y-6">
            {isEditing ? (
              <>
                {/* Summary Section - Edit Mode */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-secondary flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Summary
                  </h4>
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief summary of the clause..."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary/60 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description and implications..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary/60 uppercase tracking-wider mb-2">
                    Talking Points
                  </label>
                  <div className="space-y-2">
                    {talkingPoints.map((point, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={point}
                          onChange={(e) => updateTalkingPoint(index, e.target.value)}
                          placeholder={`Talking point ${index + 1}...`}
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeTalkingPoint(index)}
                          className="px-3 text-accent-error hover:bg-accent-error/10 rounded-m"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={addTalkingPoint}>
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Talking Point
                    </Button>
                  </div>
                </div>

                {/* Fallback Positions - Edit Mode */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-secondary flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Fallback Positions
                  </h4>
                  <div className="space-y-4">
                    {fallbackPositions.map((fallback, index) => (
                      <div key={index} className="p-4 bg-neutral-light/30 rounded-m space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-primary-yellow/30 rounded-full flex items-center justify-center text-xs font-bold text-secondary shrink-0 mt-2">
                            {index + 1}
                          </span>
                          <div className="flex-1 space-y-2">
                            <Input
                              value={fallback.position}
                              onChange={(e) => updateFallbackPosition(index, "position", e.target.value)}
                              placeholder="Fallback position..."
                            />
                            <Textarea
                              value={fallback.rationale || ""}
                              onChange={(e) => updateFallbackPosition(index, "rationale", e.target.value)}
                              placeholder="Rationale for this position..."
                              rows={2}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFallbackPosition(index)}
                            className="px-2 py-2 text-accent-error hover:bg-accent-error/10 rounded-m"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={addFallbackPosition}>
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Fallback Position
                    </Button>
                  </div>
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-light">
                  <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Summary Section - View Mode */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-secondary flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Summary
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                  </div>

                  {clause.summary ? (
                    <p className="text-sm text-secondary/80">{clause.summary}</p>
                  ) : (
                    <p className="text-sm text-secondary/40 italic">No summary provided</p>
                  )}

                  {clause.description && (
                    <div>
                      <h5 className="text-xs font-bold text-secondary/60 uppercase tracking-wider mb-1">
                        Description
                      </h5>
                      <p className="text-sm text-secondary/70">{clause.description}</p>
                    </div>
                  )}

                  {clause.talkingPoints && clause.talkingPoints.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-secondary/60 uppercase tracking-wider mb-2">
                        Talking Points
                      </h5>
                      <ul className="space-y-1">
                        {clause.talkingPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-secondary/70">
                            <span className="text-primary mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Fallback Positions - View Mode */}
                <div className="space-y-4 pt-4 border-t border-neutral-light">
                  <h4 className="text-sm font-bold text-secondary flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Fallback Positions
                  </h4>

                  {clause.fallbackPositions && clause.fallbackPositions.length > 0 ? (
                    <div className="space-y-3">
                      {clause.fallbackPositions.map((fallback, index) => (
                        <div key={index} className="p-3 bg-primary-yellow/5 rounded-m border border-primary-yellow/20">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 bg-primary-yellow/30 rounded-full flex items-center justify-center text-xs font-bold text-secondary shrink-0">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-secondary">{fallback.position}</p>
                              {fallback.rationale && (
                                <p className="text-xs text-secondary/60 mt-1">{fallback.rationale}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-secondary/40 italic">No fallback positions defined</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
