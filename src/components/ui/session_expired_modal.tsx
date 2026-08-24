"use client";

import React, { useState } from "react";
import { Modal, Button } from "@/components/ui";

interface SessionExpiredModalProps {
  onRefresh: () => Promise<void>;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={() => {}} persistent size="sm" className="text-center">
      <div className="flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-[#F7F7F7] flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="9" stroke="#717171" strokeWidth="1.6" />

            <path
              d="M12 7v5l3 3"
              stroke="#717171"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle cx="19.5" cy="4.5" r="3" fill="#EED202" />
            <path
              d="M19.5 3v1.5M19.5 5.8h.01"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-black">Session Expired</h2>
          <p className="text-sm text-[#717171] leading-relaxed">
            Your session has timed out due to inactivity. <br />
            Please refresh to continue where you left off.
          </p>
        </div>

        <div className="w-full pt-1">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onClick={handleRefresh}
          >
            Refresh Session
          </Button>
        </div>

        <p className="text-xs text-[#717171]">
          If this keeps happening,{" "}
          <a
            href="/auth/login"
            className="font-semibold text-black hover:underline"
          >
            sign in again
          </a>
          .
        </p>
      </div>
    </Modal>
  );
};

export default SessionExpiredModal;
