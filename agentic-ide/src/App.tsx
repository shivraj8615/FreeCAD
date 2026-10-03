import { useState } from 'react';
import EditorPane from './EditorPane';
import ViewerPane from './ViewerPane';

const DEFAULT_CODE = `import FreeCAD as App
import Part

# Create a new document
doc = App.newDocument()

# Create a box
box = doc.addObject("Part::Box", "MyBox")
box.Length = 10
box.Width = 10
box.Height = 10

# Recompute to update geometry
doc.recompute()
`;

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Idle');

  const handleRunCode = async () => {
    setStatus('Running...');
    try {
      const result = await window.electronAPI.runCode(code);
      if (result.success && result.modelPath) {
        setStatus('Success');
        // Use custom protocol created in main.js to load local file safely
        setModelUrl(`local-file://${result.modelPath}`);
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      {/* Top Bar */}
      <div style={{
        height: '50px',
        backgroundColor: '#333',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid #555'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', flex: 1 }}>Agentic CAD IDE</h2>
        <span style={{ marginRight: '20px', color: '#ccc', fontSize: '14px' }}>Status: {status}</span>
        <button
          onClick={handleRunCode}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Run Code
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Editor (Left Pane) */}
        <div style={{ flex: 1, borderRight: '1px solid #555' }}>
          <EditorPane code={code} onChange={(val) => setCode(val || '')} />
        </div>

        {/* 3D Viewer (Right Pane) */}
        <div style={{ flex: 1 }}>
          <ViewerPane modelUrl={modelUrl} />
        </div>
      </div>
    </div>
  );
}

export default App;
