// TODO: [Phase 3.4] Build GlassSpheres — animated glass sphere field for the Auth screen background.
//
// WHAT THIS FILE SHOULD DO:
//   Render 12–15 translucent glass spheres that drift slowly through a deep-space background.
//   The form card floats over this animation. It gives the auth screen a premium, alive feeling.
//
// HOW TO BUILD IT:
//
//   Step 1 — Generate sphere data on mount:
//     Create an array of 12 spheres, each with random:
//       position: [randomX, randomY, randomZ]  (spread across -5 to +5)
//       radius: random between 0.3 and 1.2
//       speed: random drift velocity
//       phase: random start offset (so they don't all move together)
//
//   Step 2 — Render the spheres:
//     Use <mesh position={...}> with <sphereGeometry args={[radius, 32, 32]} />
//     Material: <meshPhysicalMaterial
//       roughness={0}
//       metalness={0.2}
//       transmission={0.9}    ← this is what makes it look like glass
//       thickness={1.5}       ← refraction thickness
//       color="#826ef5"       ← violet tint
//     />
//     Note: transmission requires renderer settings — set gl={{ alpha: true }} on Canvas.
//
//   Step 3 — Animate drift using useFrame:
//     import { useFrame } from '@react-three/fiber'
//     Inside a Sphere sub-component:
//       useFrame(({ clock }) => {
//         mesh.position.y = initialY + Math.sin(clock.elapsedTime * speed + phase) * 0.3
//         mesh.position.x = initialX + Math.cos(clock.elapsedTime * speed * 0.7 + phase) * 0.2
//       })
//
//   Step 4 — Sit behind the form:
//     In AuthScreen, render as an absolutely positioned layer:
//       <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
//         <Canvas><GlassSpheres /></Canvas>
//       </View>
//
// RESOURCES:
//   THREE.MeshPhysicalMaterial (transmission/glass) — https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial
//   useFrame hook — https://docs.pmnd.rs/react-three-fiber/api/hooks#useframe
//   Physical material transmission example — https://threejs.org/examples/#webgl_materials_physical_transmission

// PLACEHOLDER — delete this export once you implement the real component
export {};
