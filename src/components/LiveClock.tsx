"use client";

import { useEffect, useState } from "react";

/** Live clock showing IST in HH:MM:SS — updates every second */
export function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // IST = UTC+5:30
      const istOffset = 5.5 * 60 * 60 * 1000;
      const ist = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
      const hh = String(ist.getUTCHours()).padStart(2, "0");
      const mm = String(ist.getUTCMinutes()).padStart(2, "0");
      const ss = String(ist.getUTCSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="clock" suppressHydrationWarning>
      {time || "--:--:--"} · IST
    </span>
  );
}
