"use client";

import { useEffect, useState } from "react";

const statusMessages = [
  "Connecting to IRCC Database...",
  "Loading Policy Matrix...",
  "System Online: Ready",
];

export default function StatusIndicator() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (messageIndex < statusMessages.length - 1) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setMessageIndex((prev) => prev + 1);
          setVisible(true);
        }, 200);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [messageIndex]);

  const isOnline = messageIndex === statusMessages.length - 1;

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          isOnline ? "bg-[#00FF88] shadow-[0_0_6px_#00FF88]" : "bg-[#FFB800] animate-pulse"
        }`}
      />
      <span
        className={`transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"} ${
          isOnline ? "text-[#00FF88]" : "text-[#FFB800]"
        }`}
      >
        {statusMessages[messageIndex]}
      </span>
    </div>
  );
}
