"use client";

import { useState } from "react";
import { X, Loader2, Bot, Calendar, Clock, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
}

interface FormData {
  meetingUrl: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  botName: string;
  recordingMode: "speaker_view" | "gallery_view";
}

interface FormErrors {
  meetingUrl?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
}

export default function MeetingDialog({ isOpen, onClose, onSuccess }: MeetingDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    meetingUrl: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    botName: "Zap Bot",
    recordingMode: "speaker_view",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "dispatching" | "success" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  const detectPlatform = (url: string): string => {
    if (url.includes("meet.google.com")) return "Google Meet";
    if (url.includes("zoom.us")) return "Zoom";
    if (url.includes("teams.microsoft.com")) return "Microsoft Teams";
    if (url.includes("webex.com")) return "WebEx";
    if (url.includes("livekit:")) return "LiveKit";
    return "Other";
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.meetingUrl.trim()) {
      newErrors.meetingUrl = "Meeting URL is required";
    } else if (!/^https?:\/\//i.test(formData.meetingUrl)) {
      newErrors.meetingUrl = "Please enter a valid URL";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Meeting title is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    } else if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end.getTime() <= start.getTime()) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setStep("dispatching");

    try {
      const response = await fetch("/api/bot/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingUrl: formData.meetingUrl,
          title: formData.title,
          description: formData.description || undefined,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          botName: formData.botName || "Zap Bot",
          recordingMode: formData.recordingMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to dispatch bot");
      }

      setSuccessData(data);
      setStep("success");
      onSuccess?.(data);
    } catch (error) {
      console.error("Error dispatching bot:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to dispatch bot");
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData({
      meetingUrl: "",
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      botName: "Zap Bot",
      recordingMode: "speaker_view",
    });
    setErrors({});
    setStep("form");
    setErrorMessage("");
    setSuccessData(null);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      meetingUrl: "",
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      botName: "Zap Bot",
      recordingMode: "speaker_view",
    });
    setErrors({});
    setStep("form");
    setErrorMessage("");
    setSuccessData(null);
  };

  if (!isOpen) return null;

  const platform = detectPlatform(formData.meetingUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#f7f8fb]/80"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-lg border border-[#e6e8ee] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e6e8ee] bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-100">
              <Bot size={22} className="text-sky-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#111827]">
                {step === "form" && "Add Meeting"}
                {step === "dispatching" && "Dispatching Bot..."}
                {step === "success" && "Meeting Scheduled"}
                {step === "error" && "Failed to Schedule"}
              </h2>
              <p className="text-sm text-[#6b7280]">
                {step === "form" && "Schedule a meeting and dispatch Zap Bot automatically"}
                {step === "dispatching" && "Setting up your meeting bot"}
                {step === "success" && "Bot will join the meeting at scheduled time"}
                {step === "error" && "Something went wrong"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-[#6b7280]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#f7f8fb]">
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Meeting URL */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#374151] flex items-center gap-2">
                  <LinkIcon size={14} />
                  Meeting URL *
                </label>
                <input
                  type="text"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm",
                    errors.meetingUrl
                      ? "border-red-300 bg-red-50"
                      : "border-[#e5e7eb] bg-white hover:border-slate-300"
                  )}
                />
                {errors.meetingUrl && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.meetingUrl}
                  </p>
                )}
                {formData.meetingUrl && !errors.meetingUrl && (
                  <p className="text-xs font-medium text-[#6b7280]">
                    Platform detected: <span className="text-sky-600 font-semibold">{platform}</span>
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#374151]">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Weekly Team Standup"
                  maxLength={120}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm",
                    errors.title
                      ? "border-red-300 bg-red-50"
                      : "border-[#e5e7eb] bg-white hover:border-slate-300"
                  )}
                />
                {errors.title && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#374151]">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add notes about this meeting..."
                  rows={3}
                  maxLength={2000}
                  className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-white hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm resize-none"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#374151] flex items-center gap-2">
                    <Calendar size={14} />
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm",
                      errors.startTime
                        ? "border-red-300 bg-red-50"
                        : "border-[#e5e7eb] bg-white hover:border-slate-300"
                    )}
                  />
                  {errors.startTime && (
                    <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.startTime}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#374151] flex items-center gap-2">
                    <Clock size={14} />
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm",
                      errors.endTime
                        ? "border-red-300 bg-red-50"
                        : "border-[#e5e7eb] bg-white hover:border-slate-300"
                    )}
                  />
                  {errors.endTime && (
                    <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Bot Name & Recording Mode */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#374151]">
                    Bot Name
                  </label>
                  <input
                    type="text"
                    value={formData.botName}
                    onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
                    placeholder="Zap Bot"
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-white hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#374151]">
                    Recording Mode
                  </label>
                  <select
                    value={formData.recordingMode}
                    onChange={(e) => setFormData({ ...formData, recordingMode: e.target.value as "speaker_view" | "gallery_view" })}
                    className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-white hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  >
                    <option value="speaker_view">Speaker View</option>
                    <option value="gallery_view">Gallery View</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 h-11 rounded-lg border border-[#e5e7eb] bg-white text-[#374151] font-semibold hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-lg bg-[#1f2937] text-white font-semibold hover:bg-[#111827] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Bot size={16} />
                  Schedule Bot
                </button>
              </div>
            </form>
          )}

          {step === "dispatching" && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bot size={28} className="text-sky-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-bold text-[#111827]">Dispatching Zap Bot...</p>
                <p className="text-sm text-[#6b7280] max-w-sm">
                  Setting up your meeting bot and configuring recording
                </p>
              </div>
              <div className="w-full max-w-sm space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#374151]">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Validating meeting URL</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#374151]">
                  <Loader2 size={16} className="animate-spin text-sky-600" />
                  <span>Dispatching bot to meeting</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#9ca3af]">
                  <div className="w-4 h-4 rounded-full border-2 border-[#d1d5db]" />
                  <span>Confirming bot joined</span>
                </div>
              </div>
            </div>
          )}

          {step === "success" && successData && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="p-2 rounded-md bg-emerald-100">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-bold text-emerald-900">Meeting scheduled successfully!</p>
                  <p className="text-sm text-emerald-700">
                    Zap Bot will automatically join the meeting at the scheduled time.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#374151] uppercase tracking-wide">Meeting Details</h3>
                <div className="space-y-2 p-4 rounded-lg bg-white border border-[#e6e8ee]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Title:</span>
                    <span className="font-semibold text-[#111827]">{successData.data.meeting?.title || formData.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Bot ID:</span>
                    <span className="font-mono text-xs font-semibold text-sky-600">{successData.data.botId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Platform:</span>
                    <span className="font-semibold text-[#111827] capitalize">{successData.data.platform}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Status:</span>
                    <span className="font-semibold text-emerald-600">Bot Dispatched</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 h-11 rounded-lg border border-[#e5e7eb] bg-white text-[#374151] font-semibold hover:bg-slate-50 transition-colors text-sm"
                >
                  Schedule Another
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 h-11 rounded-lg bg-[#1f2937] text-white font-semibold hover:bg-[#111827] transition-colors text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="p-2 rounded-md bg-red-100">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-bold text-red-900">Failed to schedule meeting</p>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 h-11 rounded-lg border border-[#e5e7eb] bg-white text-[#374151] font-semibold hover:bg-slate-50 transition-colors text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 h-11 rounded-lg bg-[#1f2937] text-white font-semibold hover:bg-[#111827] transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
