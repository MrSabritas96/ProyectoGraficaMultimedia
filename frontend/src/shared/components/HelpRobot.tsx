"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpRobotProps {
  tutorialStep?: number;
  onStartTutorial?: () => void;
  onNextStep?: () => void;
  onSkipTutorial?: () => void;
}

export const HelpRobot = ({ 
  tutorialStep = 0, 
  onStartTutorial, 
  onNextStep, 
  onSkipTutorial 
}: HelpRobotProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // State for the speech bubble sequence
  const [introMessage, setIntroMessage] = useState('');
  const [showIntroBubble, setShowIntroBubble] = useState(false);
  const isWavingRef = useRef(false);
  const tutorialStepRef = useRef(tutorialStep);

  useEffect(() => {
    tutorialStepRef.current = tutorialStep;
  }, [tutorialStep]);

  useEffect(() => {
    // Sequence Logic
    const t1 = setTimeout(() => {
      isWavingRef.current = true;
      setIntroMessage('¡Hola!');
      setShowIntroBubble(true);
    }, 800);

    const t2 = setTimeout(() => {
      isWavingRef.current = false;
      setIntroMessage('Mucho gusto, me llamo Sett');
    }, 3800);

    const t3 = setTimeout(() => {
      setIntroMessage('Seré tu guía para que puedas ingresar a tu plataforma.');
    }, 6800);

    const t4 = setTimeout(() => {
      setShowIntroBubble(false);
      if (onStartTutorial) onStartTutorial();
    }, 10800);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onStartTutorial]);

  useEffect(() => {
    if (!mountRef.current) return;

    // React Strict Mode Fix
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(500, 500);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; 
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 3; 
    controls.maxPolarAngle = Math.PI / 1.5; 
    controls.target.set(0, 1, 0);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3.5);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xa855f7, 2.5);
    fillLight.position.set(-8, 2, 5);
    scene.add(fillLight);

    const backRimLight = new THREE.PointLight(0xd8b4fe, 4, 20);
    backRimLight.position.set(0, 5, -5);
    scene.add(backRimLight);

    // MATERIALS
    const purpleMetal = new THREE.MeshPhysicalMaterial({
      color: 0x4c1d95,
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    
    const darkMetal = new THREE.MeshPhysicalMaterial({
      color: 0x111115,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.5,
    });
    
    const silverMetal = new THREE.MeshPhysicalMaterial({
      color: 0xa3a3a3,
      metalness: 0.95,
      roughness: 0.1,
    });
    
    const screenMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x05020a,
      metalness: 0.9,
      roughness: 0.0,
    });

    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe9d5ff,
      emissive: 0xa855f7,
      emissiveIntensity: 3.0,
    });

    // ROBOT GEOMETRY
    const robot = new THREE.Group();
    robot.position.y = -1;
    robot.scale.set(1.25, 1.25, 1.25);
    
    // Torso Base
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.7, 1.8, 32), purpleMetal);
    torso.position.y = 1.0;
    robot.add(torso);
    
    // Chest Armor Plate
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.5), darkMetal);
    chestPlate.position.set(0, 1.2, 0.6);
    robot.add(chestPlate);
    
    // Core (Glowing chest reactor)
    const chestGlow = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.4, 16, 16), eyeMaterial);
    chestGlow.position.set(0, 1.2, 0.86);
    chestGlow.rotation.z = Math.PI / 2;
    robot.add(chestGlow);

    // Backpack
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.6), darkMetal);
    backpack.position.set(0, 1.0, -0.8);
    robot.add(backpack);

    const backpackCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.2, 32), silverMetal);
    backpackCylinder.position.set(0, 1.0, -1.1);
    backpackCylinder.rotation.z = Math.PI / 2;
    robot.add(backpackCylinder);

    // Legs
    const leftThruster = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.8, 32), darkMetal);
    leftThruster.position.set(-0.5, -0.2, 0);
    robot.add(leftThruster);
    
    const leftThrusterRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 16, 32), silverMetal);
    leftThrusterRing.position.set(-0.5, -0.2, 0);
    leftThrusterRing.rotation.x = Math.PI / 2;
    robot.add(leftThrusterRing);
    
    const leftGlow = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), eyeMaterial);
    leftGlow.position.set(-0.5, -0.6, 0);
    robot.add(leftGlow);

    const rightThruster = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.8, 32), darkMetal);
    rightThruster.position.set(0.5, -0.2, 0);
    robot.add(rightThruster);

    const rightThrusterRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 16, 32), silverMetal);
    rightThrusterRing.position.set(0.5, -0.2, 0);
    rightThrusterRing.rotation.x = Math.PI / 2;
    robot.add(rightThrusterRing);

    const rightGlow = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), eyeMaterial);
    rightGlow.position.set(0.5, -0.6, 0);
    robot.add(rightGlow);

    // Arms
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-1.6, 1.6, 0); 
    
    const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), darkMetal);
    leftArmGroup.add(leftShoulder);
    
    const leftShoulderRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.05, 16, 32), eyeMaterial);
    leftShoulderRing.rotation.y = Math.PI / 2;
    leftArmGroup.add(leftShoulderRing);
    
    const leftBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 1.0, 32), purpleMetal);
    leftBicep.position.y = -0.6;
    leftArmGroup.add(leftBicep);
    
    const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), darkMetal);
    leftElbow.position.y = -1.2;
    leftArmGroup.add(leftElbow);
    
    robot.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(1.6, 1.6, 0); 
    
    const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), darkMetal);
    rightArmGroup.add(rightShoulder);
    
    const rightShoulderRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.05, 16, 32), eyeMaterial);
    rightShoulderRing.rotation.y = Math.PI / 2;
    rightArmGroup.add(rightShoulderRing);
    
    const rightBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 1.0, 32), purpleMetal);
    rightBicep.position.y = -0.6;
    rightArmGroup.add(rightBicep);
    
    const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), darkMetal);
    rightElbow.position.y = -1.2;
    rightArmGroup.add(rightElbow);
    
    robot.add(rightArmGroup);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.6, 32), silverMetal);
    neck.position.y = 2.1;
    robot.add(neck);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.y = 2.8; 
    
    const head = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.4), purpleMetal);
    headGroup.add(head);
    
    // Ear Muffs
    const leftEar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32), darkMetal);
    leftEar.position.set(-1.05, 0, 0);
    leftEar.rotation.z = Math.PI / 2;
    headGroup.add(leftEar);
    
    const leftEarGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 32), eyeMaterial);
    leftEarGlow.position.set(-1.05, 0, 0);
    leftEarGlow.rotation.z = Math.PI / 2;
    headGroup.add(leftEarGlow);
    
    const rightEar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32), darkMetal);
    rightEar.position.set(1.05, 0, 0);
    rightEar.rotation.z = Math.PI / 2;
    headGroup.add(rightEar);

    const rightEarGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 32), eyeMaterial);
    rightEarGlow.position.set(1.05, 0, 0);
    rightEarGlow.rotation.z = Math.PI / 2;
    headGroup.add(rightEarGlow);

    // Visor/Screen
    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.1), screenMaterial);
    screen.position.z = 0.71; 
    headGroup.add(screen);
    
    // Eyes
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 32), eyeMaterial);
    leftEye.position.set(-0.4, 0.1, 0.76); 
    headGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 32), eyeMaterial);
    rightEye.position.set(0.4, 0.1, 0.76);
    headGroup.add(rightEye);

    // Mouth / Audio Bar
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.05), eyeMaterial);
    mouth.position.set(0, -0.25, 0.76);
    headGroup.add(mouth);

    robot.add(headGroup);
    scene.add(robot);

    // Mouse Tracking
    const mouse = new THREE.Vector2();
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    const onWindowResize = () => {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
    };
    window.addEventListener('resize', onWindowResize);

    let isDragging = false;
    renderer.domElement.addEventListener('mousedown', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) {
        mouse.x = (event.clientX - windowHalfX) / windowHalfX;
        mouse.y = -(event.clientY - windowHalfY) / windowHalfY;
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let time = 0;
    
    const target = new THREE.Vector3();
    const dummy = new THREE.Object3D(); 

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();
      
      if (!isDragging) {
        target.x = mouse.x * 15;
        target.y = mouse.y * 10 + 2.8; 
        target.z = 15;
        
        dummy.position.copy(headGroup.position);
        dummy.lookAt(target);
        
        // If tutorial is active, the robot locks its head towards the right side instead of tracking the mouse completely
        if (tutorialStepRef.current > 0) {
          const lockedTarget = new THREE.Vector3(15, 2.8, 5);
          dummy.lookAt(lockedTarget);
        }
        
        headGroup.quaternion.slerp(dummy.quaternion, 0.1);
        
        let targetLeftZ = (Math.PI / 10) + mouse.x * 0.2;
        let targetLeftX = -mouse.y * 0.5;
        
        let targetRightZ = -(Math.PI / 10) + mouse.x * 0.2;
        let targetRightX = -mouse.y * 0.5;

        if (isWavingRef.current) {
          targetRightZ = -(Math.PI / 1.5) + Math.sin(time * 15) * 0.4;
          targetRightX = 0;
        } else if (tutorialStepRef.current > 0) {
          // Pointing towards the form based on the step
          targetRightZ = -(Math.PI / 1.8);
          targetRightX = Math.PI / 6;
          
          if (tutorialStepRef.current === 1) targetRightZ = -(Math.PI / 2) + 0.1; 
          if (tutorialStepRef.current === 2) targetRightZ = -(Math.PI / 2) - 0.1; 
          if (tutorialStepRef.current === 3) targetRightZ = -(Math.PI / 2) - 0.3; 
        }

        leftArmGroup.rotation.z = THREE.MathUtils.lerp(leftArmGroup.rotation.z, targetLeftZ, 0.1);
        leftArmGroup.rotation.x = THREE.MathUtils.lerp(leftArmGroup.rotation.x, targetLeftX, 0.1);

        rightArmGroup.rotation.z = THREE.MathUtils.lerp(rightArmGroup.rotation.z, targetRightZ, 0.1);
        rightArmGroup.rotation.x = THREE.MathUtils.lerp(rightArmGroup.rotation.x, targetRightX, 0.1);
      }
      
      robot.position.y = -1 + Math.sin(time) * 0.1;
      
      const glowScale = 1 + Math.sin(time * 5) * 0.1;
      leftGlow.scale.setScalar(glowScale);
      rightGlow.scale.setScalar(glowScale);
      
      // Mouth talking animation
      const isTalking = showIntroBubble || tutorialStepRef.current > 0;
      if (isTalking && time % 2 < 1.5) {
        mouth.scale.x = 1 + Math.sin(time * 20) * 0.5;
      } else {
        mouth.scale.x = 1;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mouseup', () => isDragging = false);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current && renderer.domElement) {
        try { mountRef.current.removeChild(renderer.domElement); } catch (e) {}
      }
      
      controls.dispose();
      renderer.dispose();
      
      scene.clear();
      purpleMetal.dispose();
      darkMetal.dispose();
      silverMetal.dispose();
      screenMaterial.dispose();
      eyeMaterial.dispose();
    };
  }, [showIntroBubble, onStartTutorial]);

  const getTutorialContent = () => {
    switch (tutorialStep) {
      case 1:
        return {
          title: "1 - PASO INICIAL",
          body: "Acá ingresa el correo institucional que se te proporcionó.",
          example: "Ejemplo: RicardoMendoza@medtrack.com",
          isLast: false
        };
      case 2:
        return {
          title: "2 - IDENTIFICACIÓN",
          body: "Acá coloca tu código único de usuario. Todos te podrán encontrar mediante este código.",
          example: "Ejemplo: ING-004",
          isLast: false
        };
      case 3:
        return {
          title: "3 - SEGURIDAD",
          body: "Acá brinda tu contraseña de acceso.",
          example: "Ten cuidado y protege tu privacidad. Nunca compartas tu clave con terceros.",
          isLast: true
        };
      default:
        return null;
    }
  };

  const tutorialData = getTutorialContent();

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[500px]">
      <div ref={mountRef} className="w-[500px] h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing z-10" title="Arrastra para rotar la cámara" />
      
      {/* Intro Speech Bubble */}
      <div 
        className={`absolute top-4 md:top-10 right-0 md:right-4 bg-[#05020a]/80 backdrop-blur-md border border-[#a855f7]/40 text-white px-6 py-4 rounded-2xl rounded-bl-none shadow-[0_0_20px_rgba(168,85,247,0.4)] z-20 transition-all duration-500 transform ${showIntroBubble && tutorialStep === 0 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}
      >
        <p className="font-light tracking-[0.1em] text-sm md:text-base metallic-text max-w-[200px] leading-relaxed text-center" style={{ 
          backgroundImage: 'linear-gradient(90deg, #ffffff, #d8b4fe, #a855f7)',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          {introMessage}
        </p>
      </div>

      {/* Tutorial Speech Bubble */}
      <AnimatePresence>
        {tutorialStep > 0 && tutorialData && (
          <motion.div 
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="absolute top-1/4 -right-16 md:-right-32 bg-[#0a0514]/95 backdrop-blur-xl border border-[#a855f7] p-5 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.6)] w-[320px] z-50 pointer-events-auto"
          >
            {/* Arrow pointing to the left (towards the robot) */}
            <div className="absolute top-[40%] -left-3 border-t-[8px] border-b-[8px] border-r-[12px] border-transparent border-r-[#a855f7]" />
            <div className="absolute top-[40%] -left-[10px] mt-[1px] border-t-[7px] border-b-[7px] border-r-[11px] border-transparent border-r-[#0a0514]" />
            
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#a855f7]/20 text-[#d8b4fe] text-xs font-bold border border-[#a855f7]/50">{tutorialStep}</span>
              <h4 className="text-[#d8b4fe] text-xs font-bold uppercase tracking-widest">{tutorialData.title.split(' - ')[1]}</h4>
            </div>

            <p className="text-slate-300 text-[13px] leading-relaxed font-light mb-5 tracking-wide">
              {tutorialData.body}<br/><br/>
              <span className="text-[#a855f7] italic text-xs">{tutorialData.example}</span>
            </p>
            
            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <button type="button" onClick={onSkipTutorial} className="text-[10px] text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Saltar</button>
              <button type="button" onClick={tutorialData.isLast ? onSkipTutorial : onNextStep} className="bg-gradient-to-r from-[#7e22ce] to-[#a855f7] hover:from-[#9333ea] hover:to-[#c084fc] text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all">
                {tutorialData.isLast ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
