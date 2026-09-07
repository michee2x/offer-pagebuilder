// OTO 1 – Pro
// TODO: Paste Pro page copy here when ready.
// URL: useofferiq.com/pro → rewrites to /jvzoo/pro via middleware

export default function ProPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#070708",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "DM Sans, system-ui, sans-serif",
      color: "#fff",
      gap: 12,
    }}>
      <div style={{ fontSize: 40 }}>🚧</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>OfferIQ Pro — Coming Soon</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", margin: 0 }}>This page is being built. Check back shortly.</p>
    </div>
  );
}
