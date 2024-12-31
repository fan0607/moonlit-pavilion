import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, Environment } from "@react-three/drei";
import { ShibaParticles } from "./components/ShibaParticles";
import { useCallback, useState, useEffect } from "react";
import Scene from "./components/terminals/Scene";
import { Model2 } from "./components/Model2";

export default function App() {
  const [isScattered, setIsScattered] = useState(false);
  const [showParticles, setShowParticles] = useState(true);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === ' ') {
      setIsScattered(prev => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="relative h-screen w-screen">
      <Canvas 
        camera={{ position: [-100, -2, 0], fov: 50 }}
        dpr={[1, 2]} // 优化性能的同时保持清晰度
      >
        <color attach="background" args={["#1f1f1f"]} />
        <Environment files="satara_night_no_lamps_4k.hdr" background />
        
        <Model2 position={[100, -1.5, 0]} />

        <Center>
          <ShibaParticles
            isScattered={isScattered}
            showParticles={showParticles}
          />
          <Scene isScattered={isScattered} />
        </Center>

        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
