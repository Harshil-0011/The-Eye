import { useState, useEffect } from 'react';
import { CloudCanvas, type WeatherConfig } from './components/CloudCanvas';
import { MeteorologicalHUD } from './components/MeteorologicalHUD';
import { PRESETS } from './utils/presets';
import { soundscape } from './utils/audio';

export function App() {
  const [config, setConfig] = useState<WeatherConfig>({
    cloudCoverage: PRESETS[0].config.cloudCoverage!,
    cloudDensity: PRESETS[0].config.cloudDensity!,
    cloudAltitude: PRESETS[0].config.cloudAltitude!,
    windSpeed: PRESETS[0].config.windSpeed!,
    windDirectionDeg: 45,
    sunElevation: PRESETS[0].config.sunElevation!,
    sunAzimuth: 180,
    isLightningActive: false,
    precipitation: 0.0,
    cameraMode: 'orbit',
  });

  const [fps, setFps] = useState<number>(60);
  const [cameraAltitude, setCameraAltitude] = useState<number>(150);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [screenshotTrigger, setScreenshotTrigger] = useState<number>(0);

  const handleToggleMute = () => {
    soundscape.init();
    setIsMuted((prev) => !prev);
  };

  useEffect(() => {
    soundscape.updateParameters(config.windSpeed, config.precipitation, isMuted);
  }, [config.windSpeed, config.precipitation, isMuted]);

  useEffect(() => {
    if (!config.isLightningActive || isMuted) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        soundscape.playThunder();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [config.isLightningActive, isMuted]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <CloudCanvas
        config={config}
        onFPSUpdate={setFps}
        onCameraAltitudeChange={setCameraAltitude}
        screenshotTrigger={screenshotTrigger}
      />
      <MeteorologicalHUD
        config={config}
        onChangeConfig={setConfig}
        fps={fps}
        cameraAltitude={cameraAltitude}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onTakeScreenshot={() => setScreenshotTrigger((prev) => prev + 1)}
      />
    </div>
  );
}

export default App;
