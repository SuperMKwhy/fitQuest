import './global.css';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
} from '@expo-google-fonts/hanken-grotesk';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

// Bare import (no .web/.native suffix) so Metro's platform resolution picks
// ArmSwingGame.web.js when this bundle is served to a browser/WebView, and
// the WebView-wrapping ArmSwingGame.js when bundled for a native build —
// see the comment on shouldOpenGameOnLoad below for why that matters.
import ArmSwingGame from './src/game/ArmSwingGame';
import RootNavigator from './src/navigation/RootNavigator';

// Keys here must match tailwind.config.js's fontFamily values exactly —
// NativeWind resolves e.g. `font-headline` to the literal family name
// registered with expo-font, not to the @expo-google-fonts export name.
const FONTS = {
  'SpaceGrotesk-Medium': SpaceGrotesk_500Medium,
  'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
  'HankenGrotesk-Regular': HankenGrotesk_400Regular,
  'HankenGrotesk-Medium': HankenGrotesk_500Medium,
  'JetBrainsMono-Bold': JetBrainsMono_700Bold,
  PressStart2P: PressStart2P_400Regular,
};

// When this app is loaded as a plain web page inside the native app's WebView
// (see src/game/ArmSwingGame.js), `?screen=game` tells it to boot straight
// into the game instead of the normal navigation stack.
function shouldOpenGameOnLoad() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('screen') === 'game';
}

export default function App() {
  const [fontsLoaded] = useFonts(FONTS);

  if (shouldOpenGameOnLoad()) {
    return <ArmSwingGame onExit={() => {}} />;
  }

  if (!fontsLoaded) {
    return null;
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
