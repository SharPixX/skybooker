import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';

function FloatingDataDust() {
  const dustRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pts: number[] = [];
    const cls: number[] = [];
    for (let i = 0; i < 800; i++) {
      pts.push((Math.random() - 0.5) * 40);
      pts.push((Math.random() - 0.2) * 20); // slightly more vertical
      pts.push((Math.random() - 0.5) * 40);
      
      const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.8, 0.5);
      cls.push(c.r, c.g, c.b);
    }
    return { positions: new Float32Array(pts), colors: new Float32Array(cls) };
  }, []);

  useFrame((state) => {
    if (dustRef.current) {
      dustRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      dustRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={dustRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

export default function LidarPlaneModel() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pts: number[] = [];
    const cls: number[] = [];
    const count = 60000;

    const colorObj = new THREE.Color();
    // 0x0ea5e9 = Tailwind sky-500, 0x3b82f6 = blue-500
    const colorBase = new THREE.Color(0x0284c7); // deeper blue
    const colorHighlight = new THREE.Color(0xa855f7); // neon purple
    const colorAccent = new THREE.Color(0x22d3ee); // light blue

    const addPoint = (x: number, y: number, z: number, intensity: number = 0.5) => {
      // Add small lidar noise
      const noiseX = (Math.random() - 0.5) * 0.1;
      const noiseY = (Math.random() - 0.5) * 0.1;
      const noiseZ = (Math.random() - 0.5) * 0.1;
      
      pts.push(x + noiseX, y + noiseY, z + noiseZ);
      
      // Interpolate color based on intensity/height
      if (intensity > 0.8) {
        colorObj.lerpColors(colorHighlight, colorAccent, Math.random());
      } else {
        colorObj.lerpColors(colorBase, colorHighlight, intensity + Math.random() * 0.3);
      }
      cls.push(colorObj.r, colorObj.g, colorObj.b);
    };

    // --- Fuselage ---
    for (let i = 0; i < count * 0.45; i++) {
      const u = Math.random(); 
      const v = Math.random() * Math.PI * 2; 
      const z = -12 + u * 24; 
      
      let r = 1.6;
      let intensity = 0.3;
      
      if (z < -8) {
        // Nose
        const t = (z + 8) / -4; 
        r = 1.6 * Math.sqrt(1 - t * t);
        intensity = 0.8; // brighter nose
      } else if (z > 8) {
        // Tail section
        const t = (z - 8) / 4; 
        r = 1.6 * (1 - t * 0.8);
      }
      
      const x = r * Math.cos(v) * 0.95;
      const y = r * Math.sin(v) + (z > 8 ? (z - 8) * 0.2 : 0);
      
      addPoint(x, y, z, intensity + (y / 2));
    }

    // --- Wings ---
    for (let i = 0; i < count * 0.35; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const t = Math.pow(Math.random(), 1.5); // more points near root
      
      // span
      const x = (1.5 + t * 14) * side;
      
      // root chord vs tip chord
      const chordT = Math.random();
      const zRoot = -2 + chordT * 5.5; // wider root
      const zTip = 3 + chordT * 1.5;
      const z = zRoot * (1 - t) + zTip * t;
      
      const y = -0.3 + t * 0.8; // dihedral
      
      // wing edges glow more
      const isEdge = chordT < 0.1 || chordT > 0.9;
      addPoint(x, y, z, isEdge ? 0.9 : 0.4 + t * 0.2); 
    }

    // --- Vertical Stabilizer ---
    for (let i = 0; i < count * 0.06; i++) {
      const t = Math.random(); 
      const y = 1.2 + t * 4.5;
      
      const chordT = Math.random();
      const zRoot = 8.5 + chordT * 3.5;
      const zTip = 10.5 + chordT * 1.5;
      const z = zRoot * (1 - t) + zTip * t;
      
      const x = (Math.random() - 0.5) * 0.15;
      const isEdge = chordT < 0.1 || chordT > 0.9 || t > 0.9;
      addPoint(x, y, z, isEdge ? 0.9 : 0.5 + t * 0.3);
    }

    // --- Horizontal Stabilizer ---
    for (let i = 0; i < count * 0.08; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const t = Math.pow(Math.random(), 0.8);
      const x = (0.5 + t * 5.0) * side;
      
      const chordT = Math.random();
      const zRoot = 9 + chordT * 2.5;
      const zTip = 10.5 + chordT * 1;
      const z = zRoot * (1 - t) + zTip * t;
      
      const y = 1.0 + t * 0.3;
      const isEdge = chordT < 0.1 || chordT > 0.9;
      addPoint(x, y, z, isEdge ? 0.9 : 0.5 + t * 0.2);
    }

    // --- Engines ---
    for (let i = 0; i < count * 0.06; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      // Twin engines on each side (like 777 or 737)
      const u = Math.random(); 
      const v = Math.random() * Math.PI * 2; 
      const z = -2 + u * 3.5;
      const r = 0.7;
      
      const x = r * Math.cos(v) + (4.5 * side);
      const y = r * Math.sin(v) - 1.2;
      
      // Engine core bright
      const intensity = u < 0.2 ? 1.0 : 0.4;
      addPoint(x, y, z, intensity);
    }

    return { 
      positions: new Float32Array(pts), 
      colors: new Float32Array(cls) 
    };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      // Just a gentle hovering effect, the OrbitControls will handle the main rotation
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      pointsRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.6) * 0.05;
    }
  });

  return (
    <group>
      {/* 1. The Plane Points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 2. Cyberpunk Grid Base */}
      <Grid 
        position={[0, -4.5, 0]} 
        args={[40, 40]} 
        cellSize={1} 
        cellThickness={1.5} 
        cellColor="#0e7490" 
        sectionSize={5} 
        sectionThickness={2} 
        sectionColor="#22d3ee" 
        fadeDistance={25}
        fadeStrength={1.5}
      />

      {/* 4. Ambient Data "Dust" Particles */}
      <FloatingDataDust />
    </group>
  );
}
