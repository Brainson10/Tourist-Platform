"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#fafaf8" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 22 }}>Something went wrong</h1>
          <p style={{ color: "#57534e" }}>Please try again in a moment.</p>
          <button type="button" onClick={() => reset()} style={{ marginTop: 16, padding: "10px 18px", borderRadius: 8, border: 0, background: "#19584a", color: "white", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
