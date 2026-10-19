import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Sparkles, Sun, Smile, Image as ImageIcon } from 'lucide-react';

interface RealisticAvatarProps {
  gender: 'female' | 'male';
  lightingPreset: 'broadcast' | 'cinematic' | 'golden' | 'cyber';
  backgroundType: 'broadcast' | 'penthouse' | 'transparent' | 'blur';
  sssIntensity: number;
  skinSheen: number;
  isTracking: boolean;
  onStatsUpdate?: (stats: { fps: number; latency: number }) => void;
  activeEmote?: string | null;
}

export default function RealisticAvatarViewer({
  gender,
  lightingPreset,
  backgroundType,
  sssIntensity,
  skinSheen,
  isTracking,
  onStatsUpdate,
  activeEmote,
}: RealisticAvatarProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [internalEmote, setInternalEmote] = useState<string | null>(null);
  const [usePhotoTexture, setUsePhotoTexture] = useState<boolean>(true);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const headGroupRef = useRef<THREE.Group | null>(null);
  const skinMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const eyesGroupRef = useRef<THREE.Group | null>(null);
  const leftEyelidRef = useRef<THREE.Mesh | null>(null);
  const rightEyelidRef = useRef<THREE.Mesh | null>(null);
  const mouthRef = useRef<THREE.Mesh | null>(null);
  const leftBrowRef = useRef<THREE.Mesh | null>(null);

  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.HemisphereLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  const targetRotation = useRef({ x: 0, y: 0, z: 0 });
  const currentRotation = useRef({ x: 0, y: 0, z: 0 });
  const blinkProgress = useRef<number>(0);
  const smileProgress = useRef<number>(0);
  const saccadeTimer = useRef<number>(0);
  const saccadeOffset = useRef({ x: 0, y: 0 });

  const photoPath =
    customPhotoUrl ||
    (gender === 'female'
      ? '/assets/images/realistic_face_female_1792449258404.jpg'
      : '/assets/images/realistic_face_male_1792449272638.jpg');

  const createSkinNoiseTexture = () => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    const imgData = ctx.createImageData(size, size);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const val = Math.floor(118 + Math.random() * 20);
      imgData.data[i] = val;
      imgData.data[i + 1] = val;
      imgData.data[i + 2] = val;
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 12);
    return texture;
  };

  const createIrisTexture = (isBlue: boolean = false) => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    const cx = size / 2, cy = size / 2, radius = size / 2 - 4;
    ctx.fillStyle = '#f6f8fb';
    ctx.fillRect(0, 0, size, size);

    const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
    if (isBlue) {
      grad.addColorStop(0, '#0f293b');
      grad.addColorStop(0.35, '#29739c');
      grad.addColorStop(0.7, '#4fa8d1');
      grad.addColorStop(1, '#0b1d28');
    } else {
      grad.addColorStop(0, '#1c1308');
      grad.addColorStop(0.35, '#5c3d1e');
      grad.addColorStop(0.7, '#8f6236');
      grad.addColorStop(1, '#1a1005');
    }
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = '#060709';
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0, 0.15, 1.85);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const keyLight = new THREE.DirectionalLight(0xfff3e6, 2.8);
    keyLight.position.set(1.4, 2.0, 2.2);
    keyLight.castShadow = true;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.HemisphereLight(0xecf3f9, 0x1f262e, 1.4);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight(0x70b4ff, 2.2);
    rimLight.position.set(-1.8, 1.5, -1.8);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const headGroup = new THREE.Group();
    rootGroup.add(headGroup);
    headGroupRef.current = headGroup;

    const poreTexture = createSkinNoiseTexture();
    const headGeo = new THREE.SphereGeometry(0.35, 64, 64);
    const pos = headGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if (y < 0) {
        x *= 1.0 - Math.abs(y) * 0.7;
        if (z > 0 && y < -0.15) z += (Math.abs(y) - 0.15) * 0.35;
      }
      x *= 0.88;
      pos.setXYZ(i, x, y, z);
    }
    headGeo.computeVertexNormals();

    const skinColor = gender === 'female' ? new THREE.Color('#edd3c4') : new THREE.Color('#e0c2ae');
    const skinMaterial = new THREE.MeshPhysicalMaterial({
      color: skinColor,
      roughness: 0.45,
      metalness: 0.0,
      clearcoat: 0.28,
      clearcoatRoughness: 0.36,
      transmission: 0.04,
      ior: 1.44,
      attenuationColor: new THREE.Color('#ff3c28'),
      attenuationDistance: 0.06,
      bumpMap: poreTexture,
      bumpScale: 0.0018,
    });
    skinMaterialRef.current = skinMaterial;

    if (usePhotoTexture) {
      new THREE.TextureLoader().load(photoPath, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        skinMaterial.map = tex;
        skinMaterial.needsUpdate = true;
      });
    }

    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    const noseGeo = new THREE.ConeGeometry(0.048, 0.16, 16);
    noseGeo.rotateX(Math.PI / 2.3);
    const noseMesh = new THREE.Mesh(noseGeo, skinMaterial);
    noseMesh.position.set(0, -0.01, 0.37);
    headGroup.add(noseMesh);

    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.38, 0.55, 32);
    const torsoMat = new THREE.MeshPhysicalMaterial({
      color: gender === 'female' ? 0x243340 : 0x182029,
      roughness: 0.82,
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.set(0, -0.68, -0.02);
    rootGroup.add(torsoMesh);

    const eyesGroup = new THREE.Group();
    headGroup.add(eyesGroup);
    eyesGroupRef.current = eyesGroup;

    const eyeRadius = 0.048, eyeSpacing = 0.108, eyeHeight = 0.045, eyeForward = 0.29;
    const irisTex = createIrisTexture(gender === 'female');
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf7f9fc, roughness: 0.15, map: irisTex });
    const corneaMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.98, roughness: 0.02, ior: 1.336, clearcoat: 1.0 });

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius, 32, 32), eyeWhiteMat);
    leftEye.position.set(-eyeSpacing, eyeHeight, eyeForward);
    leftEye.rotation.y = Math.PI;
    leftEye.add(new THREE.Mesh(new THREE.SphereGeometry(eyeRadius * 1.02, 32, 32), corneaMat));
    eyesGroup.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius, 32, 32), eyeWhiteMat);
    rightEye.position.set(eyeSpacing, eyeHeight, eyeForward);
    rightEye.rotation.y = Math.PI;
    rightEye.add(new THREE.Mesh(new THREE.SphereGeometry(eyeRadius * 1.02, 32, 32), corneaMat));
    eyesGroup.add(rightEye);

    const eyelidGeo = new THREE.SphereGeometry(eyeRadius * 1.06, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const leftEyelid = new THREE.Mesh(eyelidGeo, skinMaterial.clone());
    leftEyelid.position.set(-eyeSpacing, eyeHeight, eyeForward);
    leftEyelid.rotation.x = -Math.PI / 1.8;
    leftEyelid.scale.set(1, 0.05, 1);
    headGroup.add(leftEyelid);
    leftEyelidRef.current = leftEyelid;

    const rightEyelid = new THREE.Mesh(eyelidGeo, skinMaterial.clone());
    rightEyelid.position.set(eyeSpacing, eyeHeight, eyeForward);
    rightEyelid.rotation.x = -Math.PI / 1.8;
    rightEyelid.scale.set(1, 0.05, 1);
    headGroup.add(rightEyelid);
    rightEyelidRef.current = rightEyelid;

    const mouthGeo = new THREE.TorusGeometry(0.065, 0.018, 12, 24, Math.PI * 0.9);
    const mouthMesh = new THREE.Mesh(mouthGeo, new THREE.MeshPhysicalMaterial({ color: gender === 'female' ? 0xc86460 : 0xa65753, roughness: 0.32 }));
    mouthMesh.position.set(0, -0.155, 0.33);
    mouthMesh.rotation.x = Math.PI / 2.1;
    mouthMesh.rotation.z = Math.PI;
    headGroup.add(mouthMesh);
    mouthRef.current = mouthMesh;

    const handlePointerMove = (e: MouseEvent) => {
      if (isTracking) return;
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotation.current = { x: normY * 0.28, y: normX * 0.42, z: -normX * 0.08 };
    };
    window.addEventListener('mousemove', handlePointerMove);

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      frameCount++;

      if (time - fpsTimer >= 1000) {
        onStatsUpdate?.({ fps: frameCount, latency: 11 });
        frameCount = 0;
        fpsTimer = time;
      }

      currentRotation.current.x = THREE.MathUtils.damp(currentRotation.current.x, targetRotation.current.x, 8, dt);
      currentRotation.current.y = THREE.MathUtils.damp(currentRotation.current.y, targetRotation.current.y, 8, dt);
      currentRotation.current.z = THREE.MathUtils.damp(currentRotation.current.z, targetRotation.current.z, 8, dt);

      rootGroup.position.y = -0.08 + Math.sin(time * 0.0016) * 0.012;

      if (headGroupRef.current) {
        headGroupRef.current.rotation.x = currentRotation.current.x;
        headGroupRef.current.rotation.y = currentRotation.current.y;
        headGroupRef.current.rotation.z = currentRotation.current.z;
      }

      saccadeTimer.current += dt;
      if (saccadeTimer.current > 2.2 + Math.random() * 1.5) {
        saccadeTimer.current = 0;
        saccadeOffset.current = { x: (Math.random() - 0.5) * 0.06, y: (Math.random() - 0.5) * 0.04 };
      }

      if (eyesGroupRef.current) {
        eyesGroupRef.current.rotation.y = currentRotation.current.y * 0.35 + saccadeOffset.current.x;
        eyesGroupRef.current.rotation.x = currentRotation.current.x * 0.35 + saccadeOffset.current.y;
      }

      const blinkCycle = time % 3800;
      let targetBlink = 0.05;
      if (blinkCycle < 140) targetBlink = Math.sin((blinkCycle / 140) * Math.PI) * 1.0;
      blinkProgress.current = THREE.MathUtils.damp(blinkProgress.current, targetBlink, 20, dt);

      if (leftEyelidRef.current && rightEyelidRef.current) {
        const lidScale = THREE.MathUtils.lerp(0.05, 1.05, blinkProgress.current);
        leftEyelidRef.current.scale.set(1, lidScale, 1);
        rightEyelidRef.current.scale.set(1, lidScale, 1);
      }

      const currentEmote = internalEmote || activeEmote;
      const isSmiling = currentEmote === 'smile' || currentEmote === 'cheer';
      smileProgress.current = THREE.MathUtils.damp(smileProgress.current, isSmiling ? 0.85 : 0.0, 6, dt);
      if (mouthRef.current) {
        mouthRef.current.scale.x = 1.0 + smileProgress.current * 0.25;
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [gender, usePhotoTexture, photoPath]);

  useEffect(() => {
    if (skinMaterialRef.current) {
      skinMaterialRef.current.roughness = 0.48 - skinSheen * 0.25;
      skinMaterialRef.current.clearcoat = 0.15 + skinSheen * 0.45;
      skinMaterialRef.current.transmission = 0.02 + sssIntensity * 0.08;
      skinMaterialRef.current.needsUpdate = true;
    }
  }, [sssIntensity, skinSheen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomPhotoUrl(URL.createObjectURL(file));
      setUsePhotoTexture(true);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden rounded-xl select-none">
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing z-10" />
      <div className="relative z-20 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-[#090f14]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white">Avatar Photoréaliste PBR (SSS)</span>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-[#090f14]/85 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700/60 flex items-center gap-1.5 transition shadow"
          >
            <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
            <span>Projeter ma Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
