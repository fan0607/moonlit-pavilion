import { Text3D, Float, Sparkles } from "@react-three/drei";
import { useMemo, memo } from "react";
import * as THREE from 'three';

const FONT_PATH = "/fonts/FZXingKai-S04T_Regular.json";

const createGradientCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      128, 128, 0,
      128, 128, 128
    );
    
    gradient.addColorStop(0, '#f0ebe1');
    gradient.addColorStop(0.7, '#e8e0d0');
    gradient.addColorStop(1, '#d5cdc0');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  }
  
  return canvas;
}

const TEXT_CONFIG = {
  size: 1,
  height: 0.05,
  material: {
    color: '#e8e0d0',
    metalness: 0.3,
    roughness: 0.7,
    transparent: true,
    opacity: 0.85,
    emissive: '#2a2a2a',
    emissiveIntensity: 0.1,
    blending: THREE.AdditiveBlending,
  },
  float: {
    speed: 0.8,
    rotationIntensity: 0.05,
    floatIntensity: 0.1,
  },
  sparkles: {
    count: 100,
    scale: [12, 1, 8] as [number, number, number],
    size: 1.5,
    speed: 0.2,
    opacity: 0.4,
    position: [0, 0.1, 0] as [number, number, number],
  },
};

interface CharacterProps {
  char: string;
  position: [number, number, number];
  textMaterial: THREE.Material;
}

const Character = memo(({ char, position, textMaterial }: CharacterProps) => (
  <Text3D
    font={FONT_PATH}
    size={TEXT_CONFIG.size}
    height={TEXT_CONFIG.height}
    position={position}
  >
    {char}
    <primitive object={textMaterial} attach="material" />
  </Text3D>
));

Character.displayName = 'Character';

const ChinesePoetry = memo(() => {
  const gradientTexture = useMemo(() => new THREE.CanvasTexture(createGradientCanvas()), []);
  
  const textMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    ...TEXT_CONFIG.material,
    map: gradientTexture,
  }), [gradientTexture]);

  const characters = useMemo(() => [
    { char: "水", position: [0, 3, 0] },
    { char: "榭", position: [0, 1, 0] },
    { char: "浮", position: [0, -1, 0] },
    { char: "光", position: [0, -3, 0] },
  ] as const, []);

  return (
    <group position={[10, 10, 0]}>
      <Float {...TEXT_CONFIG.float}>
        <group rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
          <group position={[4, 0, 0]}>
            {characters.map(({ char, position }) => (
              <Character
                key={char + position.join(',')}
                char={char}
                position={position}
                textMaterial={textMaterial}
              />
            ))}
          </group>
        </group>
      </Float>

      <Sparkles {...TEXT_CONFIG.sparkles} />
    </group>
  );
});

ChinesePoetry.displayName = 'ChinesePoetry';

export default ChinesePoetry; 