import React from 'react';
import Editor from '@monaco-editor/react';

interface EditorPaneProps {
  code: string;
  onChange: (value: string | undefined) => void;
}

const EditorPane: React.FC<EditorPaneProps> = ({ code, onChange }) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        defaultLanguage="python"
        theme="vs-dark"
        value={code}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
};

export default EditorPane;
