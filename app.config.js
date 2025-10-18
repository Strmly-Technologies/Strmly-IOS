import 'dotenv/config';

export default {
  expo: {
    name: "strmly",
    slug: "strmly",
    scheme: "strmly",
    owner: "strmly-technologies",
    version: "1.0.8", // purely for JS metadata, not native
    newArchEnabled: true,
    plugins: [
      "expo-router",
      "expo-secure-store",
      ["expo-video", { supportsBackgroundPlayback: false, supportsPictureInPicture: false }],
      ["react-native-iap", { googlePlayPackageName: "com.anonymous.strmly" }],
      "expo-web-browser",
    ],
    extra: {
      BACKEND_API_URL: process.env.BACKEND_API_URL,
      EXPO_PUBLIC_BACKEND_API_URL: process.env.EXPO_PUBLIC_BACKEND_API_URL,
      googleClientIdAndroid: process.env.GOOGLE_CLIENT_ID_ANDROID,
      googleClientIdIOS: process.env.GOOGLE_CLIENT_ID_IOS,
      googleClientIdWeb: process.env.GOOGLE_CLIENT_ID_WEB,
      eas: {
        projectId: "d455cc31-c9ac-409d-92de-b847919939d4",
      },
    },
  },
};
