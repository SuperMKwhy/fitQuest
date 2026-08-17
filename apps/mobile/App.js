import './global.css';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

// Bare import (no .web/.native suffix) so Metro's platform resolution picks
// ArmSwingGame.web.js when this bundle is served to a browser/WebView, and
// the WebView-wrapping ArmSwingGame.js when bundled for a native build —
// see the comment on shouldOpenGameOnLoad below for why that matters.
import ArmSwingGame from './src/game/ArmSwingGame';
import RootNavigator from './src/navigation/RootNavigator';

// When this app is loaded as a plain web page inside the native app's WebView
// (see src/game/ArmSwingGame.js), `?screen=game` tells it to boot straight
// into the game instead of the normal navigation stack.
function shouldOpenGameOnLoad() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('screen') === 'game';
}

export default function App() {
  if (shouldOpenGameOnLoad()) {
    return <ArmSwingGame onExit={() => {}} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
