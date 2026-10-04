import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dreadmarch.blackmeridian',
  appName: 'Dreadmarch RPG',
  webDir: 'dist',
  backgroundColor: '#070606',
  android: {
    backgroundColor: '#070606',
    // Android 15 (targetSdk 35) forces edge-to-edge. Without this the WebView is drawn under the
    // status bar and the gesture bar, which hides the top HUD and the bottom navigation.
    adjustMarginsForEdgeToEdge: 'force',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#070606',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: { style: 'DARK', backgroundColor: '#070606', overlaysWebView: false },
  },
};

export default config;
