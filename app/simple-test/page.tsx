export default function SimpleTest() {
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
      <h1>🎮 SIMPLE TEST PAGE 🎮</h1>
      <p>If you can see this, Next.js is working!</p>
      <p>Time: {new Date().toLocaleString()}</p>
    </div>
  )
} 