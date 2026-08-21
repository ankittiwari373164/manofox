import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function Rig({ children }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, state.pointer.x * 0.35, 0.05);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -state.pointer.y * 0.25, 0.05);
  });
  return <group ref={ref}>{children}</group>;
}

function OrangeMaterial(props) {
  return <meshPhysicalMaterial color="#FF5C00" roughness={0.2} clearcoat={1} clearcoatRoughness={0.15} {...props} />;
}

export default function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 8.5], fov: 45 }} dpr={[1, 1.75]} data-testid="hero-3d-canvas">
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 6, 6]} intensity={1.8} />
      <directionalLight position={[-6, -4, 2]} intensity={0.5} color="#ffd9c2" />
      <pointLight position={[-4, -3, 3]} intensity={30} color="#FF5C00" />
      <Rig>
        <Float speed={1.8} rotationIntensity={0.7} floatIntensity={1.3}>
          <mesh position={[0.4, 0.1, 0]}>
            <torusKnotGeometry args={[1.35, 0.4, 180, 28]} />
            <OrangeMaterial />
          </mesh>
        </Float>
        <Float speed={2.6} rotationIntensity={1.2} floatIntensity={2}>
          <mesh position={[-2.9, 1.9, -1.2]}>
            <icosahedronGeometry args={[0.62, 0]} />
            <OrangeMaterial roughness={0.15} />
          </mesh>
        </Float>
        <Float speed={2.2} rotationIntensity={0.9} floatIntensity={1.8}>
          <mesh position={[2.9, -1.7, -0.8]}>
            <sphereGeometry args={[0.5, 48, 48]} />
            <meshPhysicalMaterial color="#0A0A0A" roughness={0.25} clearcoat={1} />
          </mesh>
        </Float>
        <Float speed={3} rotationIntensity={1.4} floatIntensity={2.2}>
          <mesh position={[2.6, 2.1, -1.6]} rotation={[0.6, 0.3, 0]}>
            <torusGeometry args={[0.55, 0.2, 24, 64]} />
            <meshPhysicalMaterial color="#FFB380" roughness={0.3} clearcoat={0.8} />
          </mesh>
        </Float>
        <Float speed={2.4} rotationIntensity={1} floatIntensity={1.6}>
          <mesh position={[-2.4, -2, -0.6]} rotation={[0.4, 0.4, 0]}>
            <octahedronGeometry args={[0.45, 0]} />
            <meshPhysicalMaterial color="#0A0A0A" roughness={0.2} clearcoat={1} />
          </mesh>
        </Float>
      </Rig>
    </Canvas>
  );
}
