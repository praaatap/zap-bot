"use client";

import { useEffect } from "react";
import { useMeetingsPipelineStore } from "@/stores/meetingsPipelineStore";

export function useMeetingsPipeline() {
  const {
    activeTab,
    upcomingMeetings,
    pastMeetings,
    isLoading,
    isProcessingMeetingId,
    isBotActionMeetingId,
    error,
    lastSyncedAt,
    setActiveTab,
    clearError,
    fetchMeetings,
    runAiPipeline,
    toggleMeetingBot,
    stopMeetingBot,
  } = useMeetingsPipelineStore();

  useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  return {
    activeTab,
    currentList: activeTab === "upcoming" ? upcomingMeetings : pastMeetings,
    upcomingMeetings,
    pastMeetings,
    isLoading,
    isProcessingMeetingId,
    isBotActionMeetingId,
    error,
    lastSyncedAt,
    setActiveTab,
    clearError,
    fetchMeetings,
    runAiPipeline,
    toggleMeetingBot,
    stopMeetingBot,
  };
}
