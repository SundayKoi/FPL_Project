"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type = "success", onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
      type === "success" ? "bg-green/20 text-green border border-green/30" : "bg-red/20 text-red border border-red/30"
    }`}>
      {type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 cursor-pointer">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
