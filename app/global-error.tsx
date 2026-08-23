"use client";

import * as React from "react";

/**
 * Last-resort fallback — catches errors even in the root layout itself, so
 * it must render its own <html>/<body> and stay maximally self-contained
 * (no imported components, in case whatever broke is shared code they'd
 * also depend on).
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error("DevOS root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            display: "flex",
            minHeight: "100svh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1.5rem",
            textAlign: "center",
            background: "#fafafa",
            color: "#18181b",
          }}
        >
          <div>
            <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>DevOS hit an unexpected error.</p>
            <p style={{ fontSize: "0.875rem", color: "#71717a", marginTop: "0.5rem" }}>
              It&apos;s been logged. Try reloading, or come back in a moment.
            </p>
            {error.digest && (
              <p style={{ fontSize: "0.6875rem", color: "#a1a1aa", marginTop: "0.5rem", fontFamily: "monospace" }}>
                Ref: {error.digest}
              </p>
            )}
          </div>
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "1px solid #d4d4d8",
              background: "#18181b",
              color: "#fafafa",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
