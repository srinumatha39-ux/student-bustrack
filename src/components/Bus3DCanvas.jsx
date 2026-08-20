import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Bus3DCanvas({ autoRotate = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(11, 8, 14);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Realistic Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5ea, 3);
    sunLight.position.set(15, 25, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Soft Rim Light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-15, 10, -15);
    scene.add(rimLight);

    // 3. Create HIGH-DETAIL REALISTIC COLLEGE BUS GROUP
    const busGroup = new THREE.Group();

    // Main Bus Chassis (Yellow)
    const bodyGeometry = new THREE.BoxGeometry(4.2, 2.0, 1.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // College Bus Yellow
      roughness: 0.15,
      metalness: 0.2
    });
    const busBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    busBody.position.y = 1.35;
    busBody.castShadow = true;
    busBody.receiveShadow = true;
    busGroup.add(busBody);

    // Black Side Stripe
    const stripeMaterial = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const stripeLeft = new THREE.Mesh(new THREE.BoxGeometry(4.21, 0.25, 0.05), stripeMaterial);
    stripeLeft.position.set(0, 1.0, 0.91);
    busGroup.add(stripeLeft);

    const stripeRight = new THREE.Mesh(new THREE.BoxGeometry(4.21, 0.25, 0.05), stripeMaterial);
    stripeRight.position.set(0, 1.0, -0.91);
    busGroup.add(stripeRight);

    // Curved Front Hood Nose
    const hoodGeometry = new THREE.BoxGeometry(0.8, 0.9, 1.76);
    const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
    hood.position.set(2.4, 0.8, 0);
    hood.castShadow = true;
    busGroup.add(hood);

    // Front Bumper (Dark Metallic)
    const bumperMaterial = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 1.9), bumperMaterial);
    frontBumper.position.set(2.75, 0.4, 0);
    busGroup.add(frontBumper);

    // License Plate
    const plateMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.15, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 })
    );
    plateMesh.position.set(2.91, 0.4, 0);
    busGroup.add(plateMesh);

    // Front Metallic Radiator Grill
    const grillMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.5, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 })
    );
    grillMesh.position.set(2.81, 0.85, 0);
    busGroup.add(grillMesh);

    // White Roof
    const roofGeometry = new THREE.BoxGeometry(4.25, 0.15, 1.85);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const busRoof = new THREE.Mesh(roofGeometry, roofMaterial);
    busRoof.position.y = 2.42;
    busRoof.castShadow = true;
    busGroup.add(busRoof);

    // Top Destination Sign Board ("COLLEGE BUS")
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.35, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    signBoard.position.set(1.6, 2.55, 0);
    busGroup.add(signBoard);

    // Glass Windows
    const windowMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      roughness: 0.05,
      transmission: 0.6,
      thickness: 0.2
    });

    // Front Windshield (Large slanted glass)
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.95, 1.6), windowMaterial);
    windshield.rotation.z = -0.15;
    windshield.position.set(2.0, 1.6, 0);
    busGroup.add(windshield);

    // Side Windows (Passenger Row)
    for (let x = -1.4; x <= 1.2; x += 0.7) {
      const windowLeft = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.05), windowMaterial);
      windowLeft.position.set(x, 1.6, 0.91);
      busGroup.add(windowLeft);

      const windowRight = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.05), windowMaterial);
      windowRight.position.set(x, 1.6, -0.91);
      busGroup.add(windowRight);
    }

    // Side Rear-View Mirrors (Left & Right)
    const mirrorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5 });
    const mirrorArmLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6), mirrorMat);
    mirrorArmLeft.rotation.z = Math.PI / 3;
    mirrorArmLeft.position.set(2.1, 1.5, 1.05);
    busGroup.add(mirrorArmLeft);

    const mirrorHeadLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.2), mirrorMat);
    mirrorHeadLeft.position.set(2.3, 1.6, 1.2);
    busGroup.add(mirrorHeadLeft);

    const mirrorArmRight = mirrorArmLeft.clone();
    mirrorArmRight.position.set(2.1, 1.5, -1.05);
    busGroup.add(mirrorArmRight);

    const mirrorHeadRight = mirrorHeadLeft.clone();
    mirrorHeadRight.position.set(2.3, 1.6, -1.2);
    busGroup.add(mirrorHeadRight);

    // Realistic LED Dual Headlights
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hlLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16), headlightMat);
    hlLeft.rotation.z = Math.PI / 2;
    hlLeft.position.set(2.81, 0.85, 0.6);
    busGroup.add(hlLeft);

    const hlRight = hlLeft.clone();
    hlRight.position.set(2.81, 0.85, -0.6);
    busGroup.add(hlRight);

    // Spotlights for Night Headlight Beams
    const spotlightLeft = new THREE.SpotLight(0xfffbeb, 5, 20, Math.PI / 5, 0.4);
    spotlightLeft.position.set(2.85, 0.85, 0.6);
    spotlightLeft.target.position.set(15, 0, 0.6);
    scene.add(spotlightLeft);
    scene.add(spotlightLeft.target);

    // 4 Detailed Wheels with Chrome Hubcaps & Rubber Tires
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.1 });
    const wheels = [];

    const wheelCoords = [
      [1.3, 0.45, 0.95],
      [-1.3, 0.45, 0.95],
      [1.3, 0.45, -0.95],
      [-1.3, 0.45, -0.95]
    ];

    wheelCoords.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      
      // Rubber Tire
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.35, 24), tireMat);
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Chrome Rim
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.36, 16), hubMat);
      hub.rotation.x = Math.PI / 2;
      wheelGroup.add(hub);

      wheelGroup.position.set(...pos);
      wheels.push(wheelGroup);
      busGroup.add(wheelGroup);
    });

    scene.add(busGroup);

    // 4. Realistic Asphalt Road with Yellow Lines
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(45, 0.2, 9),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    );
    road.position.y = -0.1;
    road.receiveShadow = true;
    scene.add(road);

    // Double Center Yellow Lines
    for (let x = -20; x <= 20; x += 4) {
      const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.21, 0.12), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      stripe1.position.set(x, -0.09, 0.15);
      scene.add(stripe1);

      const stripe2 = stripe1.clone();
      stripe2.position.set(x, -0.09, -0.15);
      scene.add(stripe2);
    }

    // 5. Floating 3D Glowing GPS Pin
    const pinGroup = new THREE.Group();
    const pinHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.5, roughness: 0.2 })
    );
    pinHead.position.y = 5.2;
    pinGroup.add(pinHead);

    const pinCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.65, 1.3, 24),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.5, roughness: 0.2 })
    );
    pinCone.rotation.x = Math.PI;
    pinCone.position.y = 4.2;
    pinGroup.add(pinCone);
    pinGroup.position.set(7, 0, 0);
    scene.add(pinGroup);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / container.clientWidth - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / container.clientHeight - 0.5) * 2;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Spin Wheels
      wheels.forEach((w) => {
        w.children.forEach(c => (c.rotation.y -= 0.1));
      });

      // Realistic suspension rumble
      busGroup.position.y = Math.sin(elapsedTime * 10) * 0.03;

      // Float 3D GPS Pin
      pinGroup.position.y = Math.sin(elapsedTime * 3) * 0.35;
      pinGroup.rotation.y += 0.025;

      // Mouse Parallax Camera Movement
      if (autoRotate) {
        camera.position.x = 11 + Math.sin(elapsedTime * 0.4) * 2.5 + mouseX * 4;
        camera.position.z = 14 + Math.cos(elapsedTime * 0.4) * 2.5 + mouseY * 4;
        camera.lookAt(0, 1.2, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate]);

  return <div ref={mountRef} className="w-full h-full min-h-[320px] cursor-grab active:cursor-grabbing" />;
}
