import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { cloudVertexShader, cloudFragmentShader } from '../shaders/volumetricCloudShader';
import { createAtmosphereMesh } from '../utils/skyMesh';

export interface WeatherConfig {
  cloudCoverage: number;    // 0.0 to 1.0
  cloudDensity: number;     // 0.2 to 3.0
  cloudAltitude: number;    // 50 to 500
  windSpeed: number;        // 0 to 50
  windDirectionDeg: number; // 0 to 360
  sunElevation: number;     // -10 to 90
  sunAzimuth: number;       // 0 to 360
  isLightningActive: boolean;
  precipitation: number;     // 0 to 1
  cameraMode: 'orbit' | 'fly';
}

interface CloudCanvasProps {
  config: WeatherConfig;
  onFPSUpdate?: (fps: number) => void;
  onCameraAltitudeChange?: (alt: number) => void;
  screenshotTrigger?: number;
}

export const CloudCanvas: React.FC<CloudCanvasProps> = ({
  config,
  onFPSUpdate,
  onCameraAltitudeChange,
  screenshotTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
  const updateSunRef = useRef<((elevation: number, azimuth: number, lightning: boolean) => THREE.Vector3) | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const configRef = useRef<WeatherConfig>(config);
  const callbacksRef = useRef({ onFPSUpdate, onCameraAltitudeChange });

  useEffect(() => {
    configRef.current = config;
    callbacksRef.current = { onFPSUpdate, onCameraAltitudeChange };
  }, [config, onFPSUpdate, onCameraAltitudeChange]);

  const keysPressed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a101d, 0.0003);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
    camera.position.set(0, 150, 400);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;
    controls.minDistance = 10;
    controls.maxDistance = 2500;
    controlsRef.current = controls;

    const hemiLight = new THREE.HemisphereLight(0x7095c9, 0x1c2430, 0.8);
    scene.add(hemiLight);

    const { skyMesh, starfieldMesh, sunLight, updateSun } = createAtmosphereMesh();
    scene.add(skyMesh);
    scene.add(starfieldMesh);
    scene.add(sunLight);
    updateSunRef.current = updateSun;

    const boxWidth = 2400;
    const boxHeight = 160;
    const boxDepth = 2400;

    const cloudBoxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const cloudUniforms = {
      uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color(0xfffaed) },
      uSkyColor: { value: new THREE.Color(0x3882f6) },
      uGroundColor: { value: new THREE.Color(0x18202d) },
      uTime: { value: 0 },

      uCloudCoverage: { value: configRef.current.cloudCoverage },
      uCloudDensity: { value: configRef.current.cloudDensity },
      uCloudScale: { value: 0.003 },
      uCloudAbsorption: { value: 0.015 },
      uWindVector: { value: new THREE.Vector3(1, 0, 0) },
      uDetailScale: { value: 0.012 },
      uStepSize: { value: 2.5 },
      uCloudBoxMin: { value: new THREE.Vector3(-boxWidth / 2, configRef.current.cloudAltitude, -boxDepth / 2) },
      uCloudBoxMax: { value: new THREE.Vector3(boxWidth / 2, configRef.current.cloudAltitude + boxHeight, boxDepth / 2) },
      uSilverLining: { value: 0.65 },
      uMultiScattering: { value: 0.5 },
      uPrecipitation: { value: configRef.current.precipitation },
    };

    uniformsRef.current = cloudUniforms;

    const cloudMaterial = new THREE.ShaderMaterial({
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      uniforms: cloudUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
    });

    const cloudMesh = new THREE.Mesh(cloudBoxGeometry, cloudMaterial);
    cloudMesh.position.y = configRef.current.cloudAltitude + boxHeight / 2;
    scene.add(cloudMesh);

    const groundGeo = new THREE.PlaneGeometry(8000, 8000, 64, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -1;
    scene.add(groundMesh);

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsCheck = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      frameCount++;
      if (now - lastFpsCheck >= 500) {
        if (callbacksRef.current.onFPSUpdate) {
          callbacksRef.current.onFPSUpdate(Math.round((frameCount * 1000) / (now - lastFpsCheck)));
        }
        frameCount = 0;
        lastFpsCheck = now;
      }

      if (updateSunRef.current) {
        const sunNorm = updateSunRef.current(
          configRef.current.sunElevation,
          configRef.current.sunAzimuth,
          configRef.current.isLightningActive
        );
        if (uniformsRef.current) {
          uniformsRef.current.uSunDirection.value.copy(sunNorm);
        }
      }

      if (uniformsRef.current) {
        uniformsRef.current.uTime.value += delta;

        const minY = configRef.current.cloudAltitude;
        const maxY = configRef.current.cloudAltitude + boxHeight;
        (uniformsRef.current.uCloudBoxMin.value as THREE.Vector3).set(-boxWidth / 2, minY, -boxDepth / 2);
        (uniformsRef.current.uCloudBoxMax.value as THREE.Vector3).set(boxWidth / 2, maxY, boxDepth / 2);

        cloudMesh.position.y = minY + boxHeight / 2;
      }

      if (configRef.current.cameraMode === 'fly' && cameraRef.current) {
        const moveSpeed = 120 * delta;
        const flyCam = cameraRef.current;
        const dir = new THREE.Vector3();
        flyCam.getWorldDirection(dir);

        const side = new THREE.Vector3().crossVectors(flyCam.up, dir).normalize();

        if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) flyCam.position.addScaledVector(dir, moveSpeed);
        if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) flyCam.position.addScaledVector(dir, -moveSpeed);
        if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) flyCam.position.addScaledVector(side, moveSpeed);
        if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) flyCam.position.addScaledVector(side, -moveSpeed);
        if (keysPressed.current['Space'] || keysPressed.current['KeyE']) flyCam.position.y += moveSpeed;
        if (keysPressed.current['ShiftLeft'] || keysPressed.current['KeyQ']) flyCam.position.y -= moveSpeed;

        controls.target.copy(flyCam.position).add(dir);
      } else {
        controls.update();
      }

      if (callbacksRef.current.onCameraAltitudeChange && cameraRef.current) {
        callbacksRef.current.onCameraAltitudeChange(Math.round(cameraRef.current.position.y));
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!uniformsRef.current) return;

    uniformsRef.current.uCloudCoverage.value = config.cloudCoverage;
    uniformsRef.current.uCloudDensity.value = config.cloudDensity;
    uniformsRef.current.uPrecipitation.value = config.precipitation;

    const windRad = THREE.MathUtils.degToRad(config.windDirectionDeg);
    const speed = config.windSpeed * 0.1;
    (uniformsRef.current.uWindVector.value as THREE.Vector3).set(
      Math.cos(windRad) * speed,
      0,
      Math.sin(windRad) * speed
    );
  }, [config]);

  useEffect(() => {
    if (screenshotTrigger && rendererRef.current) {
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `cloud-sim-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  }, [screenshotTrigger]);

  return <div ref={containerRef} className="w-full h-screen relative bg-slate-950 overflow-hidden" />;
};
