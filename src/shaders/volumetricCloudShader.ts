export const cloudVertexShader = `
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const cloudFragmentShader = `
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uGroundColor;
uniform float uTime;

uniform float uCloudCoverage;   // 0.0 to 1.0
uniform float uCloudDensity;    // multiplier
uniform float uCloudScale;      // noise frequency
uniform float uCloudAbsorption; // Beer's law factor
uniform vec3 uWindVector;       // movement offset
uniform float uDetailScale;     // fine detail noise
uniform float uStepSize;        // raymarch step size
uniform vec3 uCloudBoxMin;      // bounding box min
uniform vec3 uCloudBoxMax;      // bounding box max
uniform float uSilverLining;    // Henyey-Greenstein eccentricity
uniform float uMultiScattering; // indirect ambient bounce
uniform float uPrecipitation;   // storm darkness factor

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

float hash13(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

vec3 hash33(vec3 p) {
    p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
              dot(p,vec3(269.5,183.3,246.1)),
              dot(p,vec3(113.5,271.9,124.6)));
    return fract(sin(p)*43758.5453123);
}

float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(mix(hash13(i + vec3(0.0,0.0,0.0)), hash13(i + vec3(1.0,0.0,0.0)), u.x),
                   mix(hash13(i + vec3(0.0,1.0,0.0)), hash13(i + vec3(1.0,1.0,0.0)), u.x), u.y),
               mix(mix(hash13(i + vec3(0.0,0.0,1.0)), hash13(i + vec3(1.0,0.0,1.0)), u.x),
                   mix(hash13(i + vec3(0.0,1.0,1.0)), hash13(i + vec3(1.0,1.0,1.0)), u.x), u.y), u.z);
}

float worleyNoise(vec3 p) {
    vec3 id = floor(p);
    vec3 fd = fract(p);
    float minDist = 1.0;

    for (int z = -1; z <= 1; z++) {
        for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
                vec3 offset = vec3(float(x), float(y), float(z));
                vec3 cellPoint = hash33(id + offset);
                vec3 diff = offset + cellPoint - fd;
                float dist = length(diff);
                minDist = min(minDist, dist);
            }
        }
    }
    return 1.0 - clamp(minDist, 0.0, 1.0);
}

float cloudFbm(vec3 p) {
    vec3 q = p + uWindVector * uTime * 0.05;

    float baseNoise = valueNoise(q * uCloudScale);
    float worley1 = worleyNoise(q * uCloudScale * 2.0);
    float worley2 = worleyNoise(q * uCloudScale * 4.0);
    float worley3 = worleyNoise(q * uCloudScale * 8.0);

    float fbm = baseNoise * 0.5 + worley1 * 0.25 + worley2 * 0.15 + worley3 * 0.1;
    return clamp(fbm, 0.0, 1.0);
}

float getHeightGradients(float normY) {
    float baseFade = smoothstep(0.0, 0.15, normY);
    float topFade = 1.0 - smoothstep(0.7, 1.0, normY);
    return baseFade * topFade;
}

float sampleCloudDensity(vec3 p) {
    if (p.x < uCloudBoxMin.x || p.x > uCloudBoxMax.x ||
        p.y < uCloudBoxMin.y || p.y > uCloudBoxMax.y ||
        p.z < uCloudBoxMin.z || p.z > uCloudBoxMax.z) {
        return 0.0;
    }

    float normY = (p.y - uCloudBoxMin.y) / (uCloudBoxMax.y - uCloudBoxMin.y);
    float heightGradient = getHeightGradients(normY);

    if (heightGradient <= 0.001) return 0.0;

    float fbm = cloudFbm(p);

    float coverageThreshold = 1.0 - uCloudCoverage;
    float density = smoothstep(coverageThreshold, 1.0, fbm) * heightGradient;

    if (density > 0.0) {
        float detail = worleyNoise(p * uDetailScale + uWindVector * uTime * 0.1);
        density = clamp(density - (1.0 - detail) * 0.2, 0.0, 1.0);
    }

    return density * uCloudDensity;
}

float hgPhase(float cosTheta, float g) {
    float g2 = g * g;
    return (1.0 - g2) / (4.0 * 3.14159265 * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
}

vec2 rayBoxIntersection(vec3 rayOrigin, vec3 rayDir, vec3 boxMin, vec3 boxMax) {
    vec3 invDir = 1.0 / rayDir;
    vec3 tbot = invDir * (boxMin - rayOrigin);
    vec3 ttop = invDir * (boxMax - rayOrigin);

    vec3 tmin = min(tbot, ttop);
    vec3 tmax = max(tbot, ttop);

    float t0 = max(tmin.x, max(tmin.y, tmin.z));
    float t1 = min(tmax.x, min(tmax.y, tmax.z));

    return vec2(t0, t1);
}

void main() {
    vec3 rayOrigin = cameraPosition;
    vec3 rayDir = normalize(vWorldPosition - cameraPosition);

    vec2 boxHit = rayBoxIntersection(rayOrigin, rayDir, uCloudBoxMin, uCloudBoxMax);

    if (boxHit.x > boxHit.y || boxHit.y < 0.0) {
        discard;
    }

    float tStart = max(boxHit.x, 0.0);
    float tEnd = boxHit.y;

    float rayLength = tEnd - tStart;
    int maxSteps = 64;
    float stepSize = rayLength / float(maxSteps);

    vec3 currentPos = rayOrigin + rayDir * tStart;

    float transmittance = 1.0;
    vec3 accumulatedLight = vec3(0.0);

    float cosTheta = dot(rayDir, normalize(uSunDirection));
    float phase = hgPhase(cosTheta, uSilverLining);

    float phase2 = hgPhase(cosTheta, -0.3);
    float totalPhase = mix(phase, phase2, 0.3);

    for (int i = 0; i < 64; i++) {
        if (transmittance < 0.01) break;

        float density = sampleCloudDensity(currentPos);

        if (density > 0.001) {
            vec3 lightPos = currentPos;
            float lightRayDensity = 0.0;
            float lightStepSize = 1.5;

            for (int j = 0; j < 5; j++) {
                lightPos += normalize(uSunDirection) * lightStepSize;
                lightRayDensity += sampleCloudDensity(lightPos) * lightStepSize;
            }

            float sunTransmittance = exp(-lightRayDensity * uCloudAbsorption);
            float powderSugar = 1.0 - exp(-density * 2.0);

            float heightNorm = (currentPos.y - uCloudBoxMin.y) / (uCloudBoxMax.y - uCloudBoxMin.y);
            vec3 ambientLight = mix(uGroundColor, uSkyColor, heightNorm) * uMultiScattering;

            vec3 directLight = uSunColor * sunTransmittance * totalPhase * powderSugar;
            vec3 sampleColor = (directLight + ambientLight) * (1.0 - uPrecipitation * 0.5);

            float stepTransmittance = exp(-density * stepSize * uCloudAbsorption);
            accumulatedLight += sampleColor * density * stepSize * transmittance;
            transmittance *= stepTransmittance;
        }

        currentPos += rayDir * stepSize;
    }

    float alpha = 1.0 - transmittance;

    if (alpha <= 0.001) {
        discard;
    }

    gl_FragColor = vec4(accumulatedLight, alpha);
}
`;
