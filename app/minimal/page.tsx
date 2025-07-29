export default function MinimalPage() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#000', 
      color: '#0f0', 
      fontFamily: 'monospace',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1>🎮 MINIMAL TEST 🎮</h1>
      <p>Next.js is working!</p>
      <p>Time: {new Date().toLocaleString()}</p>
      <p>✅ Server is responding</p>
      <p>✅ Pages are rendering</p>
    </div>
  )
} 