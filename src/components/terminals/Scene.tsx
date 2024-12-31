import { Environment, EffectComposer, N8AO } from "@react-three/postprocessing";
import WaterSurfaceSimple from "./WaterSurfaceSimple";
import RippleFX from "../InteractiveFX/RippleFX";
import ChinesePoetry from "../ChineseText";
import { memo } from "react";

interface SceneProps {
  isScattered: boolean;
}

const FX_RENDER = (
  <RippleFX 
    alpha={1.0} 
    frequency={0.01} 
    rotation={0.02} 
    scale={0.06} 
  />
);

const Scene = memo(({ isScattered }: SceneProps) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.5}
        castShadow 
      />
      
      <WaterSurfaceSimple
        position={[0, -2, 0]}
        width={1900}
        length={1900}
        fxDistortionFactor={0.2}
        fxDisplayColorAlpha={0.0}
        fxMixColor={0x01142a}
      >
        {FX_RENDER}
      </WaterSurfaceSimple>

      <EffectComposer>
        <N8AO intensity={5} aoRadius={8} halfRes />
      </EffectComposer>
      
      {isScattered && <ChinesePoetry />}
    </>
  );
});

Scene.displayName = 'Scene';

export default Scene;
