import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.46daafe34aeb49ad83601def4e9a31ef',
  appName: 'mind-mate-vibes',
  webDir: 'dist',
  server: {
    url: 'https://46daafe3-4aeb-49ad-8360-1def4e9a31ef.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'calm_notification.wav',
    },
  },
};

export default config;
