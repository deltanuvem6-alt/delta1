import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deltanuvem.app',
  appName: 'DeltaNuvem',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  }
};

export default config;
