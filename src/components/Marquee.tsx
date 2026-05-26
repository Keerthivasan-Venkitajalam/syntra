"use client";

import React from "react";

/** Editorial scrolling marquee — pauses on hover */
export function Marquee({ items }: { items: string[] }) {
  // Render the list twice for seamless loop
  const renderItems = (key: string) =>
    items.map((item, i) => (
      <React.Fragment key={`${key}-${i}`}>
        <span className="marquee-item">{item}</span>
        <span className="marquee-item dot">◆</span>
      </React.Fragment>
    ));

  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {renderItems("a")}
        {renderItems("b")}
      </div>
    </div>
  );
}
