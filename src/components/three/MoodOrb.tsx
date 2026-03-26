// TODO: [Phase 3.1] Build the MoodOrb — a 3D animated sphere on the Dashboard
//   that morphs in color and motion based on the user's current mood.
//
// WHAT THIS FILE SHOULD DO:
//   Render a living 3D orb that pulses and shifts color to reflect how the user feels.
//   It's the emotional centerpiece of the Dashboard screen.
//
// PREREQUISITES — install these first:
//   npm install @react-three/fiber @react-three/drei three
//   npm install @types/three
//   (three.js needs expo-gl under the hood — already in Expo SDK)
//
// HOW TO BUILD IT (step by step):
//
//   Step 1 — Basic Canvas setup:
//     Import { Canvas } from '@react-three/fiber'
//     Render a <Canvas style={{ width, height: 220 }}> — this is the 3D viewport.
//     Inside Canvas, everything is 3D (no React Native Views, only Three.js elements).
//
//   Step 2 — The orb geometry:
//     Use <mesh> with <icosahedronGeometry args={[1.2, 4]} />
//     IcosahedronGeometry is a sphere made of triangles — looks more organic than a plain sphere.
//     args={[radius, detail]} — detail=4 gives smooth enough surface.
//
//   Step 3 — Animated vertex displacement (makes it "breathe"):
//     Use a custom ShaderMaterial (GLSL code) OR use @react-three/drei's MeshDistortMaterial:
//       import { MeshDistortMaterial } from '@react-three/drei'
//       <MeshDistortMaterial distort={0.3} speed={moodSpeed} color={moodColor} />
//     distort controls how much the surface warps; speed controls pulse rate.
//
//   Step 4 — Mood → visual mapping:
//     type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'awful'
//     const MOOD_CONFIG = {
//       great: { color: '#00e6ff', speed: 3, distort: 0.5 },  // fast cyan pulse
//       good:  { color: '#826ef5', speed: 2, distort: 0.3 },  // medium violet
//       okay:  { color: '#ffd700', speed: 1, distort: 0.2 },  // slow gold drift
//       bad:   { color: '#ff6b6b', speed: 1.5, distort: 0.6 },// red heavy wobble
//       awful: { color: '#4a4a6a', speed: 0.5, distort: 0.1 },// barely moving
//     }
//
//   Step 5 — Lighting:
//     Add a <pointLight position={[2, 2, 2]} intensity={1.5} /> — main light
//     Add an <ambientLight intensity={0.3} /> — fills shadows
//
//   Step 6 — Tap to navigate:
//     Wrap the Canvas in a TouchableOpacity; onPress → navigation.navigate('MoodForm')
//
// COMPONENT INTERFACE (props):
//   mood?: 'great' | 'good' | 'okay' | 'bad' | 'awful'  — defaults to 'okay' if no mood logged
//
// RESOURCES:
//   @react-three/fiber docs — https://docs.pmnd.rs/react-three-fiber/getting-started/introduction
//   @react-three/drei MeshDistortMaterial — https://github.com/pmndrs/drei#meshDistortMaterial
//   Three.js IcosahedronGeometry — https://threejs.org/docs/#api/en/geometries/IcosahedronGeometry
//   Three.js journey (best free course) — https://threejs-journey.com/
//   Bruno Simon's R3F tutorial — https://www.youtube.com/watch?v=vTfMjI4rVF4

// PLACEHOLDER — delete this export once you implement the real component
export {};
