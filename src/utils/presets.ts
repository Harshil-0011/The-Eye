import type { WeatherConfig } from '../components/CloudCanvas';

export const PRESETS: { name: string; icon: string; config: Partial<WeatherConfig> }[] = [
  {
    name: 'Fair Cumulus',
    icon: '🌤️',
    config: {
      cloudCoverage: 0.4,
      cloudDensity: 1.0,
      cloudAltitude: 120,
      windSpeed: 12,
      sunElevation: 45,
      precipitation: 0.0,
      isLightningActive: false,
    },
  },
  {
    name: 'Golden Sunset',
    icon: '🌅',
    config: {
      cloudCoverage: 0.55,
      cloudDensity: 1.2,
      cloudAltitude: 150,
      windSpeed: 8,
      sunElevation: 4,
      sunAzimuth: 240,
      precipitation: 0.0,
      isLightningActive: false,
    },
  },
  {
    name: 'Thunderstorm',
    icon: '⛈️',
    config: {
      cloudCoverage: 0.88,
      cloudDensity: 2.5,
      cloudAltitude: 80,
      windSpeed: 38,
      sunElevation: 10,
      precipitation: 0.85,
      isLightningActive: true,
    },
  },
  {
    name: 'Stratus Sea',
    icon: '🌫️',
    config: {
      cloudCoverage: 0.72,
      cloudDensity: 0.8,
      cloudAltitude: 60,
      windSpeed: 5,
      sunElevation: 25,
      precipitation: 0.1,
      isLightningActive: false,
    },
  },
  {
    name: 'Moonlit Night',
    icon: '🌙',
    config: {
      cloudCoverage: 0.45,
      cloudDensity: 1.1,
      cloudAltitude: 180,
      windSpeed: 15,
      sunElevation: -12,
      precipitation: 0.0,
      isLightningActive: false,
    },
  },
];
