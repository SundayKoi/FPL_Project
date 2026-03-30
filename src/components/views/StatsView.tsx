"use client";

export function StatsView() {
  return (
    <div className="w-full" style={{ height: "calc(100vh - 10rem)", minHeight: "500px" }}>
      <iframe
        src="/stats.html"
        className="w-full h-full border-0 rounded-lg"
        title="FPL Stats Dashboard"
      />
    </div>
  );
}
