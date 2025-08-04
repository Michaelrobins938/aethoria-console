export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#00ff41', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <h1>Aethoria AI Gaming Console</h1>
      <p>Welcome to your AI-powered gaming platform!</p>
      <p>Server is running successfully.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}