export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Next.js Test Page</h1>
      <p>If you can see this, Next.js is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
} 