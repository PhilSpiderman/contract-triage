export default function Home() {
  const envLoaded = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui, sans-serif', maxWidth: 600 }}>
      <h1 style={{ margin: 0 }}>contract triage</h1>
      <p style={{ color: '#666', marginTop: 8 }}>scaffold smoke test</p>
      <p style={{ marginTop: 32 }}>
        <strong>env:</strong>{' '}
        <span style={{ color: envLoaded ? '#0a7' : '#c44' }}>
          {envLoaded ? 'ANTHROPIC_API_KEY loaded' : 'ANTHROPIC_API_KEY missing'}
        </span>
      </p>
      <p style={{ color: '#888', fontSize: 14, marginTop: 32 }}>
        If env shows loaded, the toolchain works and we can start building.
      </p>
    </main>
  );
}
