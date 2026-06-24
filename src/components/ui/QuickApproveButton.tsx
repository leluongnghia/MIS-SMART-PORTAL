"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function QuickApproveButton({ itemId }: { itemId: string }) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "loading">("pending");

  const handleAction = async (action: "approve" | "reject") => {
    setStatus("loading");
    // Giả lập API call
    setTimeout(() => {
      setStatus(action === "approve" ? "approved" : "rejected");
    }, 600);
  };

  if (status === "loading") {
    return <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />;
  }

  if (status === "approved") {
    return (
      <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold">
        <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-[10px] font-bold">
        <XCircle className="w-3.5 h-3.5" /> Đã từ chối
      </span>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button 
        onClick={() => handleAction("reject")}
        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold transition-colors text-[10px]"
      >
        Từ chối
      </button>
      <button 
        onClick={() => handleAction("approve")}
        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg font-bold transition-colors"
      >
        Duyệt ngay
      </button>
    </div>
  );
}
