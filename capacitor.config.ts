import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dreadmarch.blackmeridian',
  appName: 'Dreadmarch',
  webDir: 'dist',
  android: { backgroundColor: '#070606' },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#070606',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
