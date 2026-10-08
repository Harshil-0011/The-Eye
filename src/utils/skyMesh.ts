import * as THREE from 'three';

const skyVertexShader = `
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const skyFragmentShader = `
uniform vec3 uSunPosition;
uniform float uRayleigh;
uniform float uTurbidity;
uniform float uMieCoefficient;
uniform float uMieDirectionalG;
uniform float uLightningIntensity;
varying vec3 vWorldPosition;

float rayleighPhase(float cosTheta) {
  return 3.0 / (16.0 * 3.14159265) * (1.0 + cosTheta * cosTheta);
}

float miePhase(float cosTheta, float g) {
  float g2 = g * g;
  return (1.0 - g2) / (4.0 * 3.14159265 * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
}

void main() {
  vec3 viewDir = normalize(vWorldPosition - cameraPosition);
  vec3 sunDir = normalize(uSunPosition);

  float cosTheta = dot(viewDir, sunDir);
  float sunElevation = sunDir.y;

  vec3 zenithColor;
  vec3 horizonColor;

  if (sunElevation > 0.1) {
    zenithColor = vec3(0.12, 0.45, 0.92) * uRayleigh;
    horizonColor = mix(vec3(0.7, 0.85, 1.0), vec3(0.95, 0.7, 0.4), clamp(1.0 - sunElevation * 2.0, 0.0, 1.0));
  } else if (sunElevation > -0.15) {
    float t = smoothstep(-0.15, 0.1, sunElevation);
    zenithColor = mix(vec3(0.02, 0.05, 0.2), vec3(0.12, 0.45, 0.92), t);
    horizonColor = mix(vec3(0.9, 0.3, 0.1), vec3(0.8, 0.6, 0.4), t);
  } else {
    zenithColor = vec3(0.002, 0.005, 0.02);
    horizonColor = vec3(0.01, 0.02, 0.05);
  }

  float heightFactor = max(0.0, viewDir.y);
  vec3 skyColor = mix(horizonColor, zenithColor, pow(heightFactor, 0.5));

  float sunDisk = smoothstep(0.998, 0.9995, cosTheta);
  vec3 sunColor = vec3(1.0, 0.92, 0.75) * 5.0;

  float rPhase = rayleighPhase(cosTheta);
  float mPhase = miePhase(cosTheta, uMieDirectionalG);
  vec3 sunHalo = sunColor * (rPhase + mPhase * uMieCoefficient * uTurbidity);

  if (sunElevation > -0.05) {
    skyColor += sunHalo * 0.15 + sunColor * sunDisk;
  }

  skyColor += vec3(0.75, 0.85, 1.0) * uLightningIntensity;

  gl_FragColor = vec4(skyColor, 1.0);
}
`;

export function createAtmosphereMesh(): {
  skyMesh: THREE.Mesh;
  starfieldMesh: THREE.Points;
  sunLight: THREE.DirectionalLight;
  skyUniforms: Record<string, THREE.IUniform>;
  updateSun: (elevation: number, azimuth: number, lightning: boolean) => THREE.Vector3;
} {
  const skyGeometry = new THREE.SphereGeometry(4000, 32, 32);

  const skyUniforms = {
    uSunPosition: { value: new THREE.Vector3(0, 1000, 0) },
    uRayleigh: { value: 1.2 },
    uTurbidity: { value: 3.0 },
    uMieCoefficient: { value: 0.005 },
    uMieDirectionalG: { value: 0.8 },
    uLightningIntensity: { value: 0.0 },
  };

  const skyMaterial = new THREE.ShaderMaterial({
    vertexShader: skyVertexShader,
    fragmentShader: skyFragmentShader,
    uniforms: skyUniforms,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);

  const starsCount = 2000;
  const starPositions = new Float32Array(starsCount * 3);
  const starSizes = new Float32Array(starsCount);

  for (let i = 0; i < starsCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const radius = 3800;

    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = Math.abs(radius * Math.cos(phi));
    starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    starSizes[i] = Math.random() * 2.5 + 0.5;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2.0,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
  });

  const starfieldMesh = new THREE.Points(starGeometry, starMaterial);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 2.5);
  sunLight.castShadow = false;

  const updateSun = (elevationDeg: number, azimuthDeg: number, lightning: boolean): THREE.Vector3 => {
    const phi = THREE.MathUtils.degToRad(90 - elevationDeg);
    const theta = THREE.MathUtils.degToRad(azimuthDeg);

    const sunPos = new THREE.Vector3();
    sunPos.setFromSphericalCoords(2000, phi, theta);

    skyUniforms.uSunPosition.value.copy(sunPos);
    sunLight.position.copy(sunPos);

    if (elevationDeg < 5) {
      sunLight.color.setHex(0xff5500);
      sunLight.intensity = Math.max(0.1, (elevationDeg + 10) / 15);
    } else if (elevationDeg < 20) {
      sunLight.color.setHex(0xffaa44);
      sunLight.intensity = 1.8;
    } else {
      sunLight.color.setHex(0xffffff);
      sunLight.intensity = 2.8;
    }

    starMaterial.opacity = elevationDeg < 0 ? Math.min(1.0, -elevationDeg / 10) : 0.0;
    skyUniforms.uLightningIntensity.value = lightning ? Math.random() * 2.0 + 0.5 : 0.0;

    return sunPos.clone().normalize();
  };

  return { skyMesh, starfieldMesh, sunLight, skyUniforms, updateSun };
}
