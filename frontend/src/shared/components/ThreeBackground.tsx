"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    // Subtle dark purple fog for depth blending
    scene.fog = new THREE.FogExp2('#0a0014', 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- 1. Space Dust Setup ---
    const createDustTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      if (context) {
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 5000; // Increased density of stars/dust
    const posArray = new Float32Array(particleCount * 3);
    const colorsArray = new Float32Array(particleCount * 3);
    
    const color1 = new THREE.Color('#d8b4fe'); 
    const color2 = new THREE.Color('#7e22ce'); 
    const color3 = new THREE.Color('#ffffff'); 

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 60;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 60;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const rand = Math.random();
      const c = rand < 0.05 ? color3 : (rand < 0.4 ? color1 : color2);
      colorsArray[i * 3] = c.r;
      colorsArray[i * 3 + 1] = c.g;
      colorsArray[i * 3 + 2] = c.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.1, // Even smaller dust
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
      map: createDustTexture(),
      depthWrite: false
    });

    const particlesMesh = new THREE.Points(particlesGeometry, dustMaterial);
    scene.add(particlesMesh);

    // --- 2. Central Raymarched Organic Morphing Sphere & Halo ---
    
    // Create the outer "Moon Glow" Halo (much more expanded and soft to prevent banding)
    const createGlowTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
        // Simple, extremely smooth 2-stop gradient to eliminate 8-bit banding
        grad.addColorStop(0, 'rgba(120, 0, 255, 0.5)');
        grad.addColorStop(1, 'rgba(20, 0, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const haloSpriteMat = new THREE.SpriteMaterial({
      map: createGlowTexture(),
      color: new THREE.Color('#ffffff'), // The texture already has the purple color baked in
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 1.0
    });
    const haloSprite = new THREE.Sprite(haloSpriteMat);
    scene.add(haloSprite);

    const raymarchMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        cameraPos: { value: camera.position },
        dynamicColor: { value: new THREE.Color('#ff1a4d') }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 cameraPos;
        uniform vec3 dynamicColor;
        varying vec3 vWorldPos;

        // Signed Distance Field (SDF) Map
        float map(vec3 p) {
            // Slower breathing cycle
            float breath = (sin(time * 0.25) + 1.0) * 0.5; // 0.0 to 1.0
            
            // Hoberman physical expansion: from much smaller (5.5) to much larger (8.5)
            float outerRadius = mix(5.5, 8.5, breath);
            float dOuter = length(p) - outerRadius;
            
            // Gyroid Pattern Scale (Increased to create more divisions and shapes)
            float scale = mix(1.6, 1.1, breath);
            vec3 np = p * scale;
            
            // Rotate the pattern slightly faster to the right
            float rotTime = -time * 0.15; 
            mat2 rot = mat2(cos(rotTime), -sin(rotTime), sin(rotTime), cos(rotTime));
            np.xz *= rot;
            
            // Uniform, symmetric time drift (only on Y axis) to prevent the "lava lamp" blobby effect
            np += vec3(0.0, time * 0.03, 0.0);
            
            // Pure, symmetric Gyroid lattice
            float g = dot(sin(np), cos(np.yzx));
            float n = abs(g);
            
            // Depth-based thresholding (Compact Core)
            float distToCenter = length(p);
            float depthRatio = smoothstep(2.5, outerRadius, distToCenter);
            
            // Threshold for surface cracks
            float baseThreshold = mix(0.1, 0.8, breath);
            float threshold = mix(-0.2, baseThreshold, depthRatio);
            
            // SDF for cracks
            float dCut = (threshold - n) / scale;
            
            return max(dOuter, dCut);
        }

        // Calculate Surface Normal
        vec3 calcNormal(vec3 p) {
            const vec2 e = vec2(0.01, 0);
            return normalize(vec3(
                map(p + e.xyy) - map(p - e.xyy),
                map(p + e.yxy) - map(p - e.yxy),
                map(p + e.yyx) - map(p - e.yyx)
            ));
        }

        void main() {
            vec3 rayDir = normalize(vWorldPos - cameraPos);
            vec3 ro = vWorldPos; // Start ray at the bounding box
            
            float t = 0.0;
            float maxD = 25.0;
            vec3 p = ro;
            bool hit = false;
            
            // Raymarching loop
            for(int i = 0; i < 80; i++) {
                p = ro + rayDir * t;
                float d = map(p);
                if(d < 0.01) {
                    hit = true;
                    break;
                }
                t += d;
                if(t > maxD) break;
            }
            
            if(hit) {
                vec3 n = calcNormal(p);
                vec3 viewDir = normalize(cameraPos - p);
                
                // Diffuse Light: added back subtly so deep canyons aren't completely pitch black
                vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
                float diff = max(dot(n, lightDir), 0.0);
                
                // Rim Fresnel Glow: Broadened to illuminate the patterns
                float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 2.5);
                
                // Colors: Lighter purple base to avoid pure black voids
                vec3 baseColor = vec3(0.04, 0.015, 0.08);  // Lighter dark purple
                vec3 rimColor = vec3(0.5, 0.0, 0.9);       // Bright neon purple rim
                vec3 coreColor = dynamicColor;             // Dynamic core
                
                float radius = length(p);
                float breath = (sin(time * 0.25) + 1.0) * 0.5;
                float outerRadius = mix(5.5, 8.5, breath);
                
                // Dynamic depth glow offset
                // When contracted (breath=0), offset is 2.2 (glow stays buried). 
                // When expanded (breath=1), offset is 1.0 (glow bleeds heavily into canyons).
                float glowOffset = mix(2.2, 1.0, breath);
                float glowStart = outerRadius - glowOffset; 
                float glowCore = 2.5;
                
                float depthFactor = 1.0 - smoothstep(glowCore, glowStart, radius);
                depthFactor = pow(depthFactor, 2.0); // Smooth falloff inside the deep trench
                
                // Base surface with subtle diffuse light to lift pure blacks
                vec3 finalColor = baseColor + diff * vec3(0.06, 0.02, 0.12);
                
                // Mix in the highly intense dynamic core glow
                finalColor = mix(finalColor, coreColor * 4.0, depthFactor);
                
                // Add intense colored bloom for the absolute deepest parts
                float extremeDepth = 1.0 - smoothstep(2.0, 3.0, radius);
                extremeDepth = pow(extremeDepth, 3.0);
                finalColor += coreColor * extremeDepth * 3.0;
                
                // Add the outer Fresnel rim to illuminate the geometry!
                finalColor += rimColor * fresnel * 0.8;
                
                gl_FragColor = vec4(finalColor, 1.0);
            } else {
                discard; 
            }
        }
      `,
      transparent: false,
      side: THREE.FrontSide,
    });

    // Box Geometry increased to 25 to prevent clipping when camera translates
    const raymarchBox = new THREE.Mesh(new THREE.BoxGeometry(25, 25, 25), raymarchMat);
    scene.add(raymarchBox);

    camera.position.z = 15;
    
    // --- Mouse Interaction & Animation ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) * 0.003;
      mouseY = (event.clientY - windowHalfY) * 0.003;
    };

    document.addEventListener('mousemove', onDocumentMouseMove);

    const clock = new THREE.Clock();

    // Color Palette for transitioning (Orange, Yellow, Green derivatives)
    const neonColor1 = new THREE.Color('#ff5500'); // Fiery Orange
    const neonColor2 = new THREE.Color('#ffcc00'); // Energy Yellow
    const neonColor3 = new THREE.Color('#11ff66'); // Neon Green

    const animate = () => {
      requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      // Faster rotation of the space dust to the right
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0002;

      // Update shader time for organic morphing
      raymarchMat.uniforms.time.value = elapsedTime;

      // Calculate dynamic color transitions slowly
      const cTime = elapsedTime * 0.2;
      const mix1 = (Math.sin(cTime) + 1.0) * 0.5;
      const mix2 = (Math.cos(cTime * 1.3) + 1.0) * 0.5;
      
      const currentColor = neonColor1.clone().lerp(neonColor2, mix1).lerp(neonColor3, mix2);
      raymarchMat.uniforms.dynamicColor.value.copy(currentColor);

      // Match halo size to the sphere's slow breathing with the NEW expansion math
      const breath = (Math.sin(elapsedTime * 0.25) + 1.0) * 0.5;
      const currentOuterRadius = 5.5 + breath * 3.0; // matches mix(5.5, 8.5)
      haloSprite.scale.set(currentOuterRadius * 6.0, currentOuterRadius * 6.0, 1);

      // Parallax mouse follow: Lateral translation without rotation (moves in a fixed, strictly limited quadrant)
      targetX = mouseX * 0.6; // Extremely restricted limit
      targetY = mouseY * 0.6;
      
      // Move camera opposite to target so objects follow the cursor, with a slight delay (retraso)
      camera.position.x += (-targetX - camera.position.x) * 0.03;
      camera.position.y += (targetY - camera.position.y) * 0.03;
      // Intentionally NOT using camera.lookAt to prevent scene from spinning/tilting.
      // We also update cameraPos uniform so the raymarching aligns perfectly.
      raymarchMat.uniforms.cameraPos.value.copy(camera.position);

      renderer.render(scene, camera);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      particlesGeometry.dispose();
      dustMaterial.dispose();
      haloSpriteMat.map?.dispose();
      haloSpriteMat.dispose();
      raymarchBox.geometry.dispose();
      raymarchMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />;
};
