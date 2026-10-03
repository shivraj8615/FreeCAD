import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, useGLTF } from '@react-three/drei';

interface ViewerPaneProps {
  modelUrl: string | null;
}

// Model component to load and render GLTF/GLB files
const Model: React.FC<{ url: string }> = ({ url }) => {
  // useGLTF relies on React Suspense and throws a Promise while loading.
  // We should not wrap it in a try-catch, because it needs to propagate to the Suspense boundary.
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

const ViewerPane: React.FC<ViewerPaneProps> = ({ modelUrl }) => {
  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: '#1e1e1e' }}>
      <Canvas camera={{ position: [20, 20, 20] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={
          <Box args={[1, 1, 1]}>
            <meshStandardMaterial color="gray" />
          </Box>
        }>
          {modelUrl ? (
            <Model url={modelUrl} />
          ) : (
            <Box args={[2, 2, 2]}>
              <meshStandardMaterial color="orange" />
            </Box>
          )}
        </Suspense>
        <OrbitControls makeDefault />
        <gridHelper args={[50, 50]} />
        <axesHelper args={[25]} />
      </Canvas>
    </div>
  );
};

export default ViewerPane;
