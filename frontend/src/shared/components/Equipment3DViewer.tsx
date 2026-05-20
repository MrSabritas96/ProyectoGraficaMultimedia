"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

export interface Hotspot3D {
  id: number;
  position: [number, number, number];
  color: string; // Hex color
  pulse?: boolean;
}

interface Equipment3DViewerProps {
  hotspots?: Hotspot3D[];
  modelUrl?: string;
  onHotspotClick?: (id: number) => void;
  onCoordinateSelected?: (x: number, y: number, z: number) => void;
  isActive?: boolean;
}

export function Equipment3DViewer({ hotspots = [], modelUrl, onHotspotClick, onCoordinateSelected, isActive = false }: Equipment3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.background = null; // Transparent

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Build Geometry based on modelUrl
    const buildModel = () => {
      const group = new THREE.Group();
      
      const isImg = modelUrl?.includes('img_');
      const imgId = isImg ? parseInt(modelUrl!.split('img_')[1].split('.')[0]) : 1;

      // Base for all
      const baseGeometry = new THREE.BoxGeometry(2, 0.5, 2);
      const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, -1, 0);
      group.add(base);

      if (imgId === 1) { // Arco en C
        const arcGeo = new THREE.TorusGeometry(1.5, 0.3, 16, 100, Math.PI);
        const arcMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
        const arc = new THREE.Mesh(arcGeo, arcMat);
        arc.position.set(0, 0.5, 0);
        group.add(arc);
        
        const monitorGeo = new THREE.BoxGeometry(1, 0.8, 0.1);
        const monitorMat = new THREE.MeshStandardMaterial({ color: 0x020617, emissive: 0xa855f7, emissiveIntensity: 0.3 });
        const monitor = new THREE.Mesh(monitorGeo, monitorMat);
        monitor.position.set(-1.8, 1, 0);
        monitor.rotation.y = Math.PI / 4;
        group.add(monitor);
      } 
      else if (imgId === 2) { // Tomógrafo (Torus completo)
        const torusGeometry = new THREE.TorusGeometry(1.5, 0.5, 32, 100);
        const torusMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.rotation.y = Math.PI / 2;
        group.add(torus);
        
        const bedGeometry = new THREE.BoxGeometry(1, 0.2, 4);
        const bedMaterial = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const bed = new THREE.Mesh(bedGeometry, bedMaterial);
        bed.position.set(0, -0.6, 1);
        group.add(bed);
      }
      else if (imgId === 3) { // Ecógrafo (Cuerpo alto con pantalla)
        const bodyGeo = new THREE.BoxGeometry(1, 1.5, 1);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.set(0, -0.25, 0);
        group.add(body);
        
        const keyboardGeo = new THREE.BoxGeometry(1.2, 0.1, 0.8);
        const keyboardMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const keyboard = new THREE.Mesh(keyboardGeo, keyboardMat);
        keyboard.position.set(0, 0.5, 0.2);
        keyboard.rotation.x = 0.1;
        group.add(keyboard);
        
        const screenGeo = new THREE.BoxGeometry(1.2, 0.8, 0.1);
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x020617, emissive: 0x10b981, emissiveIntensity: 0.2 });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(0, 1.2, -0.1);
        screen.rotation.x = -0.1;
        group.add(screen);
      }
      else if (imgId === 4) { // Mamógrafo
        const columnGeo = new THREE.BoxGeometry(0.5, 3, 0.5);
        const columnMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });
        const column = new THREE.Mesh(columnGeo, columnMat);
        column.position.set(-0.5, 0.5, 0);
        group.add(column);
        
        const tubeGeo = new THREE.BoxGeometry(1.5, 0.4, 0.8);
        const tubeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.position.set(0.2, 1.5, 0);
        group.add(tube);
        
        const plateGeo = new THREE.BoxGeometry(0.8, 0.05, 0.8);
        const plateMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        plate.position.set(0.2, 0.5, 0);
        group.add(plate);
      }
      else if (imgId === 5) { // Rayos X Digital
        const tableGeo = new THREE.BoxGeometry(3, 0.2, 1);
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.set(0, -0.5, 0);
        group.add(table);
        
        const standGeo = new THREE.BoxGeometry(0.3, 3, 0.3);
        const standMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
        const stand = new THREE.Mesh(standGeo, standMat);
        stand.position.set(-1.5, 0.5, -0.8);
        group.add(stand);
        
        const headGeo = new THREE.BoxGeometry(0.8, 0.5, 0.8);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 2, -0.4);
        head.rotation.x = Math.PI / 4;
        group.add(head);
      }
      else if (imgId === 6) { // Densitómetro
        const tableGeo = new THREE.BoxGeometry(3.5, 0.3, 1.2);
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.set(0, -0.5, 0);
        group.add(table);
        
        const armGeo = new THREE.BoxGeometry(0.4, 2, 0.4);
        const armMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });
        const arm = new THREE.Mesh(armGeo, armMat);
        arm.position.set(-1, 0.5, -0.8);
        group.add(arm);
        
        const scannerGeo = new THREE.BoxGeometry(1.5, 0.2, 0.8);
        const scannerMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
        const scanner = new THREE.Mesh(scannerGeo, scannerMat);
        scanner.position.set(-1, 1.5, 0);
        group.add(scanner);
      }
      else if (imgId === 7) { // Resonador (MRI) - Deep Donut
        const mriGeo = new THREE.CylinderGeometry(1.8, 1.8, 3, 32);
        const mriMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
        const mri = new THREE.Mesh(mriGeo, mriMat);
        mri.rotation.z = Math.PI / 2;
        mri.position.set(0, 0.5, 0);
        group.add(mri);
        
        const holeGeo = new THREE.CylinderGeometry(1, 1, 3.1, 32);
        const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const hole = new THREE.Mesh(holeGeo, holeMat);
        hole.rotation.z = Math.PI / 2;
        hole.position.set(0, 0.5, 0);
        group.add(hole);
        
        const bedGeo = new THREE.BoxGeometry(3, 0.1, 0.8);
        const bedMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const bed = new THREE.Mesh(bedGeo, bedMat);
        bed.position.set(1.5, 0, 0);
        group.add(bed);
      }
      else if (imgId === 8) { // Impresora Médica
        const printerGeo = new THREE.BoxGeometry(1.5, 1.2, 1);
        const printerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        const printer = new THREE.Mesh(printerGeo, printerMat);
        printer.position.set(0, -0.2, 0);
        group.add(printer);
        
        const slotGeo = new THREE.BoxGeometry(1.2, 0.05, 0.5);
        const slotMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const slot = new THREE.Mesh(slotGeo, slotMat);
        slot.position.set(0, 0.2, 0.4);
        group.add(slot);
        
        const screenGeo = new THREE.BoxGeometry(0.4, 0.3, 0.05);
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x020617, emissive: 0x3b82f6, emissiveIntensity: 0.5 });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(0.4, 0.5, 0.5);
        screen.rotation.x = -0.2;
        group.add(screen);
      }
      else { // Generic Default
        const boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(0, 0, 0);
        group.add(box);
      }

      return group;
    };

    const equipmentGroup = buildModel();
    scene.add(equipmentGroup);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xa855f7, 2, 10);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // HOTSPOTS (Sprite Markers)
    const markerSprites: THREE.Sprite[] = [];
    
    // Default hotspots if none provided (REMOVED)
    const activeHotspots = hotspots;

    activeHotspots.forEach(hs => {
      // Create circular texture for sprite
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      if (context) {
        context.beginPath();
        context.arc(32, 32, 24, 0, 2 * Math.PI, false);
        context.fillStyle = hs.color;
        context.fill();
        if (hs.pulse) {
          context.lineWidth = 4;
          context.strokeStyle = '#ffffff';
          context.stroke();
        }
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(hs.position[0], hs.position[1], hs.position[2]);
      sprite.scale.set(0.3, 0.3, 0.3);
      // Store custom data for animation and click detection
      sprite.userData = { id: hs.id, pulse: hs.pulse, originalScale: 0.3 };
      equipmentGroup.add(sprite);
      markerSprites.push(sprite);
    });

    // MOUSE INTERACTION (Rotation and Raycasting)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let hasDragged = false;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => { 
      isDragging = true; 
      hasDragged = false;
    };
    
    const onMouseUp = (e: MouseEvent) => { 
      isDragging = false; 
      
      // If we didn't drag, treat it as a click for raycasting
      if (!hasDragged) {
        const rect = containerRef.current!.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        // Check hotspots first
        if (onHotspotClick) {
          const intersects = raycaster.intersectObjects(markerSprites);
          if (intersects.length > 0) {
            const clickedSprite = intersects[0].object;
            if (clickedSprite.userData && clickedSprite.userData.id !== undefined) {
              onHotspotClick(clickedSprite.userData.id);
              return;
            }
          }
        }
        
        // If no hotspot clicked, check geometry
        if (onCoordinateSelected) {
          const geometryObjects = equipmentGroup.children.filter(child => child.type === 'Mesh');
          const intersects = raycaster.intersectObjects(geometryObjects);
          if (intersects.length > 0) {
            const point = intersects[0].point;
            // The point is in world space, we need it relative to equipmentGroup if we rotated it
            // For simplicity, let's just pass the local coordinates by inverse transforming
            const localPoint = equipmentGroup.worldToLocal(point.clone());
            onCoordinateSelected(localPoint.x, localPoint.y, localPoint.z);
          }
        }
      }
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaMove = {
          x: e.offsetX - previousMousePosition.x,
          y: e.offsetY - previousMousePosition.y
        };
        
        // Only count as drag if moved more than 2 pixels
        if (Math.abs(deltaMove.x) > 2 || Math.abs(deltaMove.y) > 2) {
          hasDragged = true;
        }
        
        equipmentGroup.rotation.y += deltaMove.x * 0.01;
        equipmentGroup.rotation.x += deltaMove.y * 0.01;
      }
      previousMousePosition = { x: e.offsetX, y: e.offsetY };
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.01;
      camera.translateZ(zoomFactor);
      
      const dist = camera.position.length();
      if (dist < 2) {
        camera.position.setLength(2);
      } else if (dist > 15) {
        camera.position.setLength(15);
      }
    };

    containerRef.current.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    containerRef.current.addEventListener('mousemove', onMouseMove);
    containerRef.current.addEventListener('wheel', onWheel, { passive: false });

    // ANIMATION LOOP
    let animationFrameId: number;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const time = performance.now() / 1000;
      
      // Idle slow rotation
      if (!isDragging) {
        equipmentGroup.rotation.y += 0.001;
      }

      // Animate pulsing hotspots
      markerSprites.forEach(sprite => {
        if (sprite.userData.pulse) {
          const scale = sprite.userData.originalScale + Math.sin(time * 5) * 0.1;
          sprite.scale.set(scale, scale, scale);
        }
      });

      renderer.render(scene, camera);
    };
    render();

    // RESIZE HANDLER
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', onMouseUp);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousedown', onMouseDown);
        containerRef.current.removeEventListener('mousemove', onMouseMove);
        containerRef.current.removeEventListener('wheel', onWheel);
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose ThreeJS resources
      scene.clear();
      renderer.dispose();
      // Clean up meshes
      equipmentGroup.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    };
  }, [mounted, hotspots, modelUrl]);

  return (
    <div className="relative w-full h-full min-h-[300px] cursor-move overflow-hidden rounded-xl bg-gradient-to-b from-[#050010] to-[#110121] border border-slate-800 shadow-inner">
      <AnimatePresence>
        {!isActive && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 left-4 z-10 flex gap-4 pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-xs text-slate-300">Mantenimiento Previo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse" />
              <span className="text-xs text-slate-300">Falla Actual</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isActive && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 right-4 z-10 text-[10px] text-slate-500 tracking-widest uppercase pointer-events-none"
          >
            Arrastra para rotar modelo 3D
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
