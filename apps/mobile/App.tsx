import { StatusBar } from "expo-status-bar";
import { StyleSheet, Platform } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useRef, useState, useEffect } from "react";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

export default function App() {
  // Use 10.0.2.2 for Android Emulator to access localhost
  // const LOCAL_URL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.1.4:3000";
  const LOCAL_URL = "http://192.168.1.4:3000";

  // TODO: Replace with production URL when deploying
  const TARGET_URL = __DEV__ ? LOCAL_URL : "https://pin-plate.com";

  const [nativeLocation, setNativeLocation] = useState<Location.LocationObject | null>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log("Location fetched:", location);
      setNativeLocation(location);
    })();
  }, []);

  const injectLocation = (loc: Location.LocationObject) => {
    webViewRef.current?.postMessage(JSON.stringify({ type: "LOCATION", payload: loc }));
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === "REQ_LOCATION") {
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
    } catch (e) {
      // JSON 파싱 에러 등은 무시 (일반 로그일 수 있음)
      console.log("WebView Message:", event.nativeEvent.data);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: TARGET_URL }}
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
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
  },
});
