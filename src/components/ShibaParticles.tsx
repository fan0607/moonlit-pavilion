import { useEffect, useMemo, useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";

interface ShibaParticlesProps {
  isScattered: boolean;
  showParticles: boolean;
}

const NUM_PARTICLES = 50000;
const PARTICLE_CONFIG = {
  velocityRange: 0.15,
  yVelocityMin: 0.1,
  rebuildDelayMax: 100,
  colorHueRange: [0.6, 0.7],
  transitionDuration: 1.5,
  scatterForce: 0.8,
  gatherForce: 0.03,
  maxScatterDistance: 50,
  damping: 0.98,
  gravity: 0.015,
  turbulence: 0.001,
  particleSize: 0.03,
  groundY: -20,
  bounceRestitution: 0.3,
  returnSpeed: 0.8,
  returnAcceleration: 0.02,
  initialExplosionForce: 1.2,
};

const createParticleSystem = (modelPositions: THREE.BufferAttribute, numParticles: number) => {
  const positions = new Float32Array(numParticles * 3);
  const initialPositions = new Float32Array(numParticles * 3);
  const colors = new Float32Array(numParticles * 3);
  const velocities = [];
  const rebuildDelays = [];

  const rotationMatrix = new THREE.Matrix4().makeRotationX(Math.PI / 2);

  for (let i = 0; i < numParticles; i++) {
    const idx = i * 3;
    const vertexIndex = Math.floor(Math.random() * (modelPositions.count - 1)) * 3;

    const vertex = new THREE.Vector3(
      modelPositions.array[vertexIndex],
      modelPositions.array[vertexIndex + 1],
      modelPositions.array[vertexIndex + 2]
    ).applyMatrix4(rotationMatrix);

    positions[idx] = vertex.x;
    positions[idx + 1] = vertex.y;
    positions[idx + 2] = vertex.z;

    initialPositions[idx] = positions[idx];
    initialPositions[idx + 1] = positions[idx + 1];
    initialPositions[idx + 2] = positions[idx + 2];

    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const r = Math.random() * PARTICLE_CONFIG.velocityRange * PARTICLE_CONFIG.initialExplosionForce;

    velocities[i] = {
      x: r * Math.sin(theta) * Math.cos(phi),
      y: r * Math.cos(theta),
      z: r * Math.sin(theta) * Math.sin(phi),
      returning: false,
      returnDelay: Math.random() * 1000,
      returnStartY: 0,
    };

    rebuildDelays[i] = {
      delay: Math.floor(Math.random() * PARTICLE_CONFIG.rebuildDelayMax),
      started: false,
      completed: false,
    };

    const heightFactor = (vertex.y + 10) / 20;
    const hue = THREE.MathUtils.lerp(
      PARTICLE_CONFIG.colorHueRange[0],
      PARTICLE_CONFIG.colorHueRange[1],
      heightFactor
    );
    const color = new THREE.Color().setHSL(hue, 1, 0.5);
    colors[idx] = color.r;
    colors[idx + 1] = color.g;
    colors[idx + 2] = color.b;
  }

  return { positions, initialPositions, colors, velocities, rebuildDelays };
};

const ShibaParticles = memo(({ isScattered, showParticles }: ShibaParticlesProps) => {
  const points = useRef<THREE.Points>(null);
  const modelRef = useRef<THREE.Group>(null);
  const velocities = useRef<Array<any>>([]);
  const isInitialized = useRef(false);
  const isTransitioning = useRef(false);
  const transitionStartTime = useRef(0);
  const rebuildDelays = useRef<Array<{ delay: number; started: boolean; completed: boolean }>>([]);
  const clock = useRef(new THREE.Clock());
  const particleOpacity = useRef(1);
  const time = useRef(0);

  const positions = useMemo(() => new Float32Array(NUM_PARTICLES * 3), []);
  const initialPositions = useMemo(() => new Float32Array(NUM_PARTICLES * 3), []);
  const colors = useMemo(() => new Float32Array(NUM_PARTICLES * 3), []);

  useEffect(() => {
    const loader = new GLTFLoader();
    
    loader.load("fire_in_the_sky.glb", (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(material => {
            material.transparent = true;
            material.opacity = 0;
          });
        }
      });

      modelRef.current = gltf.scene;

      const combineBuffer = (model: THREE.Group, bufferName: string) => {
        let count = 0;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            count += (mesh.geometry.attributes[bufferName] as THREE.BufferAttribute).array.length;
          }
        });

        const combined = new Float32Array(count);
        let offset = 0;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const buffer = mesh.geometry.attributes[bufferName] as THREE.BufferAttribute;
            combined.set(buffer.array, offset);
            offset += buffer.array.length;
          }
        });
        return new THREE.BufferAttribute(combined, 3);
      };

      const modelPositions = combineBuffer(gltf.scene, "position");
      const { positions: pos, initialPositions: initPos, colors: cols, velocities: vels, rebuildDelays: delays } = 
        createParticleSystem(modelPositions, NUM_PARTICLES);

      positions.set(pos);
      initialPositions.set(initPos);
      colors.set(cols);
      velocities.current = vels;
      rebuildDelays.current = delays;

      if (points.current) {
        points.current.geometry.attributes.position.needsUpdate = true;
        points.current.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      }
      
      isInitialized.current = true;
    });
  }, [colors, initialPositions, positions]);

  useEffect(() => {
    if (!isInitialized.current || !modelRef.current) return;

    isTransitioning.current = true;
    transitionStartTime.current = clock.current.getElapsedTime();

    gsap.killTweensOf(particleOpacity);
    modelRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(material => {
          gsap.killTweensOf(material);
        });
      }
    });

    const handleModelTransition = (material: THREE.Material, isScattering: boolean) => {
      material.visible = !isScattering;
      material.transparent = true;
      material.opacity = isScattering ? 0 : 0;

      if (!isScattering) {
        gsap.to(material, {
          opacity: 1,
          duration: PARTICLE_CONFIG.transitionDuration,
          ease: "power2.inOut",
          onComplete: () => {
            if (points.current) {
              points.current.visible = false;
              particleOpacity.current = 0;
            }
            isTransitioning.current = false;
          }
        });
      } else {
        gsap.to(material, {
          opacity: 0,
          duration: PARTICLE_CONFIG.transitionDuration,
          ease: "power2.inOut",
          onComplete: () => {
            material.visible = false;
          }
        });
      }
    };

    modelRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(material => handleModelTransition(material, isScattered));
      }
    });

    if (showParticles && points.current) {
      points.current.visible = true;
      gsap.to(particleOpacity, {
        current: 1,
        duration: PARTICLE_CONFIG.transitionDuration,
        ease: "power2.inOut"
      });
    }
  }, [isScattered, showParticles]);

  useFrame((state) => {
    if (!isInitialized.current || !points.current) return;

    const positions = points.current.geometry.attributes.position.array;
    const deltaTime = clock.current.getDelta();
    time.current += deltaTime;

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const idx = i * 3;
      const velocity = velocities.current[i];
      
      if (isScattered) {
        if (isTransitioning.current) {
          const progress = Math.min((time.current - transitionStartTime.current) / PARTICLE_CONFIG.transitionDuration, 1);
          const explosionForce = PARTICLE_CONFIG.initialExplosionForce * (1 - progress);
          
          velocity.y -= PARTICLE_CONFIG.gravity;
          
          positions[idx] += velocity.x * explosionForce;
          positions[idx + 1] += velocity.y * explosionForce;
          positions[idx + 2] += velocity.z * explosionForce;
          
          if (progress >= 1) {
            isTransitioning.current = false;
          }
        } else {
          velocity.x += (Math.random() - 0.5) * PARTICLE_CONFIG.turbulence;
          velocity.z += (Math.random() - 0.5) * PARTICLE_CONFIG.turbulence;
          velocity.y -= PARTICLE_CONFIG.gravity;

          velocity.x *= PARTICLE_CONFIG.damping;
          velocity.y *= PARTICLE_CONFIG.damping;
          velocity.z *= PARTICLE_CONFIG.damping;

          positions[idx] += velocity.x;
          positions[idx + 1] += velocity.y;
          positions[idx + 2] += velocity.z;

          if (positions[idx + 1] < PARTICLE_CONFIG.groundY) {
            positions[idx + 1] = PARTICLE_CONFIG.groundY;
            velocity.y = Math.abs(velocity.y) * PARTICLE_CONFIG.bounceRestitution;
            
            velocity.x *= 0.8;
            velocity.z *= 0.8;
          }
        }
      } else {
        const dx = initialPositions[idx] - positions[idx];
        const dy = initialPositions[idx + 1] - positions[idx + 1];
        const dz = initialPositions[idx + 2] - positions[idx + 2];
        
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance > 0.01) {
          const dirX = dx / distance;
          const dirY = dy / distance;
          const dirZ = dz / distance;

          const returnSpeed = PARTICLE_CONFIG.returnSpeed * (1 + distance * PARTICLE_CONFIG.returnAcceleration);

          velocity.x = THREE.MathUtils.lerp(velocity.x, dirX * returnSpeed, 0.1);
          velocity.y = THREE.MathUtils.lerp(velocity.y, dirY * returnSpeed, 0.1);
          velocity.z = THREE.MathUtils.lerp(velocity.z, dirZ * returnSpeed, 0.1);

          positions[idx] += velocity.x;
          positions[idx + 1] += velocity.y;
          positions[idx + 2] += velocity.z;
        } else {
          positions[idx] = initialPositions[idx];
          positions[idx + 1] = initialPositions[idx + 1];
          positions[idx + 2] = initialPositions[idx + 2];
          velocity.x = 0;
          velocity.y = 0;
          velocity.z = 0;
        }
      }
    }

    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={NUM_PARTICLES}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={NUM_PARTICLES}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={PARTICLE_CONFIG.particleSize}
          vertexColors
          transparent
          opacity={particleOpacity.current}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      {modelRef.current && <primitive object={modelRef.current} />}
      <EffectComposer>
        <Bloom intensity={1.5} />
      </EffectComposer>
    </>
  );
});

ShibaParticles.displayName = 'ShibaParticles';

export { ShibaParticles };
