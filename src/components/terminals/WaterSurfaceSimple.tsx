import { useMemo, useRef, memo } from 'react';
import { PlaneGeometry, RepeatWrapping, Vector2 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { WaterSimple } from './WaterSimple';
import { WaterContext } from './WaterContext';

const WATER_DEFAULTS = {
	width: 190,
	length: 190,
	dimensions: 1024,
	waterColor: 0x000000,
	position: [0, 0, 0] as [number, number, number],
	distortionScale: 0.7,
	fxDistortionFactor: 0.2,
	fxDisplayColorAlpha: 0.0,
	fxMixColor: 0x000000,
} as const;

interface WaterSurfaceSimpleProps {
	width?: number;
	length?: number;
	dimensions?: number;
	waterColor?: number;
	position?: [number, number, number];
	distortionScale?: number;
	fxDistortionFactor?: number;
	fxDisplayColorAlpha?: number;
	fxMixColor?: number | string;
	children?: React.ReactNode;
}

const WaterSurfaceSimple = memo(({
	width = WATER_DEFAULTS.width,
	length = WATER_DEFAULTS.length,
	dimensions = WATER_DEFAULTS.dimensions,
	waterColor = WATER_DEFAULTS.waterColor,
	position = WATER_DEFAULTS.position,
	distortionScale = WATER_DEFAULTS.distortionScale,
	fxDistortionFactor = WATER_DEFAULTS.fxDistortionFactor,
	fxDisplayColorAlpha = WATER_DEFAULTS.fxDisplayColorAlpha,
	fxMixColor = WATER_DEFAULTS.fxMixColor,
	children,
}: WaterSurfaceSimpleProps) => {
	const waterRef = useRef<any>();
	const pointerRef = useRef(new Vector2(0, 0));

	const gl = useThree((state) => state.gl);
	const waterNormals = useTexture('/water/waternormals.jpeg');
	waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping;

	const geometry = useMemo(
		() => new PlaneGeometry(width, length),
		[width, length]
	);

	const waterConfig = useMemo(
		() => ({
			textureWidth: dimensions,
			textureHeight: dimensions,
			waterNormals,
			waterColor,
			distortionScale,
			fxDistortionFactor,
			fxDisplayColorAlpha,
			fxMixColor,
			fog: false,
			format: (gl as any).encoding,
		}),
		[
			dimensions,
			distortionScale,
			fxDisplayColorAlpha,
			fxDistortionFactor,
			fxMixColor,
			gl,
			waterColor,
			waterNormals,
		]
	);

	const waterObject = useMemo(
		() => new WaterSimple(geometry, waterConfig),
		[geometry, waterConfig]
	);

	useFrame((_, delta) => {
		if (waterRef.current) {
			waterRef.current.material.uniforms.time.value += delta / 2;
		}
	});

	const handlePointerMove = (event: { uv: Vector2 }) => {
		pointerRef.current.copy(event.uv.multiplyScalar(2).subScalar(1));
	};

	const contextValue = useMemo(() => ({
		ref: waterRef,
		refPointer: pointerRef
	}), []);

	return (
		<WaterContext.Provider value={contextValue}>
			<primitive
				ref={waterRef}
				onPointerMove={handlePointerMove}
				object={waterObject}
				rotation-x={-Math.PI / 2}
				position={position}
			/>
			{children}
		</WaterContext.Provider>
	);
});

WaterSurfaceSimple.displayName = 'WaterSurfaceSimple';

export default WaterSurfaceSimple;