import { StatusBar } from "expo-status-bar";
import { StyleSheet, Platform } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function App() {
  // Use 10.0.2.2 for Android Emulator to access localhost
  const LOCAL_URL =
    Platform.OS === "android" ? "http://192.168.0.13:3000" : "http://localhost:3000";

  // TODO: Replace with production URL when deploying
  const TARGET_URL = __DEV__ ? LOCAL_URL : "https://pin-plate.com";

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <WebView
          source={{ uri: TARGET_URL }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
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
