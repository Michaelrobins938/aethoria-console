export default function TestPage() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0a0a0a', 
      color: '#00ff41', 
      fontFamily: 'monospace',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
        🎮 AETHORIA TEST PAGE 🎮
      </h1>
      <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
        If you can see this page, your Next.js server is working correctly!
        <br /><br />
        The enhanced Aethoria application should be available at the root URL.
      </p>
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        border: '2px solid #00ff41', 
        borderRadius: '10px',
        backgroundColor: '#050505'
      }}>
        <h2>Server Status: ✅ RUNNING</h2>
        <p>Port: 3000</p>
        <p>Environment: Development</p>
        <p>Next.js Version: 14.0.3</p>
      </div>
    </div>
  )
} 