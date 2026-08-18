import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import tokens from '../theme/tokens';

import HomeScreen from '../screens/HomeScreen';
import QuestHubScreen from '../screens/QuestHubScreen';
import SocialScreen from '../screens/SocialScreen';
import ShopScreen from '../screens/ShopScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Canonical bottom nav from design/design.md's audit: Home / Quest / Social /
// Shop / Profile — the one tab set every top-level screen was normalized to
// (previously 4 different, incompatible tab bars across the mockups).
// Icons prefer MaterialIcons (name-compatible with the mockups' Material
// Symbols) and fall back to MaterialCommunityIcons only where MaterialIcons
// has no equivalent glyph (e.g. "swords").
const TABS = [
  { name: 'Home', component: HomeScreen, icon: 'home', family: MaterialIcons },
  { name: 'Quest', component: QuestHubScreen, icon: 'sword-cross', family: MaterialCommunityIcons },
  { name: 'Social', component: SocialScreen, icon: 'group', family: MaterialIcons },
  { name: 'Shop', component: ShopScreen, icon: 'shopping-bag', family: MaterialIcons },
  { name: 'Profile', component: ProfileScreen, icon: 'person', family: MaterialIcons },
];

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name);
        return {
          headerShown: false,
          tabBarActiveTintColor: tokens.colors['on-primary-container'],
          tabBarInactiveTintColor: tokens.colors['on-surface-variant'],
          tabBarActiveBackgroundColor: tokens.colors['primary-container'],
          tabBarStyle: {
            backgroundColor: tokens.colors.background,
            borderTopWidth: 3,
            borderTopColor: tokens.colors.ink,
            height: 64,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
          tabBarIcon: ({ color, size }) => {
            const Icon = tab.family;
            return <Icon name={tab.icon} color={color} size={size} />;
          },
        };
      }}
    >
      {TABS.map(({ name, component }) => (
        <Tab.Screen key={name} name={name} component={component} />
      ))}
    </Tab.Navigator>
  );
}
