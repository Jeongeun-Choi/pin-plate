import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRef, useState, useEffect } from 'react';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';

const isLocationRequestMessage = (
  message: unknown,
): message is { type: 'REQ_LOCATION' } => {
  if (typeof message !== 'object' || message === null || !('type' in message)) {
    return false;
  }

  return (message as { type: unknown }).type === 'REQ_LOCATION';
};

const ANDROID_EMULATOR_URL = 'http://10.0.2.2:3000';
const IOS_SIMULATOR_URL = 'http://localhost:3000';
const PRODUCTION_URL = 'https://pinonplate.com';

const getDevelopmentUrl = () =>
  process.env.EXPO_PUBLIC_WEB_URL ??
  (Platform.OS === 'android' ? ANDROID_EMULATOR_URL : IOS_SIMULATOR_URL);

export default function App() {
  const [nativeLocation, setNativeLocation] =
    useState<Location.LocationObject | null>(null);
  const webViewRef = useRef<WebView>(null);
  const targetUrl = __DEV__ ? getDevelopmentUrl() : PRODUCTION_URL;

  const injectLocation = (loc: Location.LocationObject) => {
    webViewRef.current?.postMessage(
      JSON.stringify({ type: 'LOCATION', payload: loc }),
    );
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const message: unknown = JSON.parse(event.nativeEvent.data);
      if (isLocationRequestMessage(message)) {
        if (nativeLocation) {
          injectLocation(nativeLocation);
        } else {
          // 위치가 아직 없으면 다시 가져오기 시도
          Location.getCurrentPositionAsync({}).then((loc) => {
            setNativeLocation(loc);
            injectLocation(loc);
          });
        }
      }
    } catch {
      // JSON 파싱 에러 등은 무시 (일반 로그일 수 있음)
      console.log('WebView Message:', event.nativeEvent.data);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log('Location fetched:', location);
      setNativeLocation(location);
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: targetUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          geolocationEnabled={true}
          onMessage={handleWebViewMessage}
        />
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});
