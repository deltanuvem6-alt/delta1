import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deltanuvem.app',
  appName: 'DeltaNuvem',
  webDir: 'dist',
  server: {
    url: 'https://deltanuvem-5jun.onrender.com/',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
