export default function IsolatedPage() {
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
      <h1>🎮 ISOLATED TEST 🎮</h1>
      <p>No external dependencies</p>
      <p>No store imports</p>
      <p>No complex components</p>
      <p>Time: {new Date().toLocaleString()}</p>
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        border: '1px solid #0f0',
        borderRadius: '5px'
      }}>
        <p>✅ Pure React component</p>
        <p>✅ No useEffect</p>
        <p>✅ No state management</p>
      </div>
    </div>
  )
} 