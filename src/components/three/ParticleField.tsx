// TODO: [Phase 3.3] Build ParticleField — morphing particle background for the Onboarding screen.
//
// WHAT THIS FILE SHOULD DO:
//   Render thousands of small glowing dots (particles) that form a different shape
//   on each onboarding slide. When the user swipes to the next slide, the particles
//   rearrange into the new shape (morph animation).
//
// HOW TO BUILD IT:
//
//   Step 1 — Define target shapes (arrays of Vector3 positions):
//     Each shape is an array of {x, y, z} coordinates the particles will move to.
//     You can generate these programmatically:
//       Slide 1 (cloud)   → random sphere distribution
//       Slide 2 (helix)   → parametric DNA helix: x=cos(t), y=t, z=sin(t)
//       Slide 3 (heart)   → parametric heart curve
//       Slide 4 (brain)   → sphere cluster (approximate)
//       Slide 5 (galaxy)  → logarithmic spiral
//     Keep all shapes at the same particle count (e.g. 800 particles).
//
//   Step 2 — Render with THREE.Points:
//     Create a BufferGeometry with a 'position' BufferAttribute (Float32Array of x,y,z)
//     Use PointsMaterial: { size: 0.02, color: '#826ef5', transparent: true, opacity: 0.8 }
//     In React Three Fiber: <points><bufferGeometry /><pointsMaterial ... /></points>
//
//   Step 3 — Morph between shapes using useFrame:
//     When `slideIndex` prop changes, lerp each particle toward its new target position:
//       newPos = currentPos + (targetPos - currentPos) * 0.05   (5% per frame = smooth)
//     Update the BufferAttribute and set needsUpdate = true each frame.
//
//   Step 4 — Accept slideIndex prop and update target positions when it changes.
//
// COMPONENT INTERFACE (props):
//   slideIndex: number   — which slide (0–4) → determines which particle shape to show
//
// RESOURCES:
//   THREE.BufferGeometry — https://threejs.org/docs/#api/en/core/BufferGeometry
//   Parametric curves for shapes — https://en.wikipedia.org/wiki/Parametric_equation
//   THREE.Points example — https://threejs.org/examples/#webgl_points_waves
//   Particle morph with lerp — https://threejs.org/examples/#webgl_morphtargets_points
//   Linear interpolation (lerp) explained — https://www.youtube.com/watch?v=YJB1QnEmlTs

// PLACEHOLDER — delete this export once you implement the real component
export {};
