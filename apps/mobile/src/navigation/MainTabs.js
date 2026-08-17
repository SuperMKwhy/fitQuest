import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
const TABS = [
  { name: 'Home', component: HomeScreen, icon: 'home' },
  { name: 'Quest', component: QuestHubScreen, icon: 'sword-cross' },
  { name: 'Social', component: SocialScreen, icon: 'account-group' },
  { name: 'Shop', component: ShopScreen, icon: 'shopping' },
  { name: 'Profile', component: ProfileScreen, icon: 'account' },
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
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name={tab.icon} color={color} size={size} />
          ),
        };
      }}
    >
      {TABS.map(({ name, component }) => (
        <Tab.Screen key={name} name={name} component={component} />
      ))}
    </Tab.Navigator>
  );
}
