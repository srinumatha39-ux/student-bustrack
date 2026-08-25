import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Bus3DAnimation({ type, onComplete }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // WebGL 3D Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 3.0);
    dirLight.position.set(12, 22, 12);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // REALISTIC 3D CARTOON COLLEGE BUS MESH
    const busGroup = new THREE.Group();

    // Main Bus Body (Bright Cartoon Yellow)
    const bodyGeometry = new THREE.BoxGeometry(4.4, 2.1, 1.9);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.15, metalness: 0.1 });
    const busBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    busBody.position.y = 1.4;
    busBody.castShadow = true;
    busGroup.add(busBody);

    // White Roof Cap
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(4.45, 0.18, 1.95),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 })
    );
    roof.position.y = 2.5;
    busGroup.add(roof);

    // Top Destination Sign ("COLLEGE BUS")
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.35, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    signBoard.position.set(1.6, 2.65, 0);
    busGroup.add(signBoard);

    // Black Side Racing Stripe
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const stripeL = new THREE.Mesh(new THREE.BoxGeometry(4.41, 0.25, 0.05), stripeMat);
    stripeL.position.set(0, 1.05, 0.96);
    busGroup.add(stripeL);

    const stripeR = stripeL.clone();
    stripeR.position.set(0, 1.05, -0.96);
    busGroup.add(stripeR);

    // Front Bumper
    const bumper = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.45, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    bumper.position.set(2.35, 0.45, 0);
    busGroup.add(bumper);

    // Front Radiator Grill
    const grill = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.55, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
    );
    grill.position.set(2.38, 0.95, 0);
    busGroup.add(grill);

    // Glass Windows
    const winMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 1.7), winMat);
    windshield.position.set(2.21, 1.65, 0);
    busGroup.add(windshield);

    // Side Windows
    for (let x = -1.4; x <= 1.2; x += 0.75) {
      const winL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.05), winMat);
      winL.position.set(x, 1.65, 0.96);
      busGroup.add(winL);

      const winR = winL.clone();
      winR.position.set(x, 1.65, -0.96);
      busGroup.add(winR);
    }

    // Side Mirrors
    const mirrorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.22), mirrorMat);
    mirrorL.position.set(2.2, 1.7, 1.15);
    busGroup.add(mirrorL);

    const mirrorR = mirrorL.clone();
    mirrorR.position.set(2.2, 1.7, -1.15);
    busGroup.add(mirrorR);

    // Cartoon Eyes LED Headlights
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hl1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), hlMat);
    hl1.rotation.z = Math.PI / 2;
    hl1.position.set(2.21, 0.95, 0.65);
    busGroup.add(hl1);

    const hl2 = hl1.clone();
    hl2.position.set(2.21, 0.95, -0.65);
    busGroup.add(hl2);

    // Spotlight Beams
    const spotlightL = new THREE.SpotLight(0xfffbeb, 4, 18, Math.PI / 5, 0.4);
    spotlightL.position.set(2.25, 0.95, 0.65);
    spotlightL.target.position.set(12, 0, 0.65);
    scene.add(spotlightL);
    scene.add(spotlightL.target);

    // Cartoon Wheels
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9 });
    const wheels = [];

    [
      [1.3, 0.48, 1.0],
      [-1.3, 0.48, 1.0],
      [1.3, 0.48, -1.0],
      [-1.3, 0.48, -1.0]
    ].forEach((pos) => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.38, 24), tireMat);
      tire.rotation.x = Math.PI / 2;
      wGroup.add(tire);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.39, 16), hubMat);
      hub.rotation.x = Math.PI / 2;
      wGroup.add(hub);

      wGroup.position.set(...pos);
      wheels.push(wGroup);
      busGroup.add(wGroup);
    });

    scene.add(busGroup);

    // 3D Road Track
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(60, 0.1, 10),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    );
    road.position.y = -0.05;
    road.receiveShadow = true;
    scene.add(road);

    // Center Yellow Stripes
    for (let x = -25; x <= 25; x += 4) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.11, 0.15), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      stripe.position.set(x, 0.01, 0);
      scene.add(stripe);
    }

    let startTime = performance.now();
    let animationFrameId;

    if (type === 'driver') {
      busGroup.position.set(-25, 0, 0);
      camera.position.set(0, 7, 16);
      camera.lookAt(0, 1.2, 0);

      const animateDriver = (now) => {
        const elapsed = (now - startTime) / 1000;
        animationFrameId = requestAnimationFrame(animateDriver);

        if (busGroup.position.x < 0) {
          busGroup.position.x += (0 - busGroup.position.x) * 0.08;
          wheels.forEach((w) => (w.children[0].rotation.y -= 0.2));
        } else {
          busGroup.position.x = 0;
        }

        busGroup.position.y = Math.sin(elapsed * 12) * 0.04;

        if (elapsed > 0.8) {
          camera.position.z += (11 - camera.position.z) * 0.05;
          camera.position.y += (4 - camera.position.y) * 0.05;
        }

        renderer.render(scene, camera);

        if (elapsed >= 1.6 && onComplete) {
          cancelAnimationFrame(animationFrameId);
          onComplete();
        }
      };
      animateDriver(performance.now());

    } else if (type === 'student') {
      const pinGroup = new THREE.Group();
      const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.4 }));
      const pinCone = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 16), new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.4 }));
      pinCone.rotation.x = Math.PI;
      pinCone.position.y = -1;
      pinGroup.add(pinHead);
      pinGroup.add(pinCone);
      pinGroup.position.set(7, 12, 0);
      scene.add(pinGroup);

      busGroup.position.set(-15, 0, 0);
      camera.position.set(0, 9, 18);
      camera.lookAt(0, 1.2, 0);

      const animateStudent = (now) => {
        const elapsed = (now - startTime) / 1000;
        animationFrameId = requestAnimationFrame(animateStudent);

        if (pinGroup.position.y > 2) {
          pinGroup.position.y -= (pinGroup.position.y - 2) * 0.1;
        }
        pinGroup.rotation.y += 0.03;

        if (busGroup.position.x < 5) {
          busGroup.position.x += (5 - busGroup.position.x) * 0.06;
          wheels.forEach((w) => (w.children[0].rotation.y -= 0.2));
        }

        busGroup.position.y = Math.sin(elapsed * 12) * 0.04;

        renderer.render(scene, camera);

        if (elapsed >= 1.7 && onComplete) {
          cancelAnimationFrame(animationFrameId);
          onComplete();
        }
      };
      animateStudent(performance.now());
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [type, onComplete]);

  return (
    <div className="relative w-full max-w-2xl mx-auto py-4">
      <div ref={mountRef} className="w-full h-64 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs font-bold text-amber-400 mt-3 flex items-center justify-center gap-2 bg-slate-900/90 py-2.5 px-4 rounded-xl border border-slate-800 shadow-md max-w-sm mx-auto"
      >
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        <span>3D Cartoon Bus Arriving... Revealing Portal</span>
      </motion.div>
    </div>
  );
}
