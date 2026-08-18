import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ChibiSurface, ChibiButton } from '../components/Chibi';
import { api } from '../api/client';
import { useAppStore } from '../state/useAppStore';
import tokens from '../theme/tokens';

// Matches design/Shop.html. Read-only for now — purchasing (deducting
// coins/gems, adding to an inventory) isn't implemented yet, see todo.md.
export default function ShopScreen() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const profile = useAppStore((s) => s.profile);

  useEffect(() => {
    api.getShopItems().then(setItems);
  }, []);

  // ShopItem rows always have a `category` field (hair | shirt | pants |
  // shoes | pet | accessory) — see apps/server/prisma/schema.prisma.
  const categories = useMemo(() => {
    const set = new Set(items.map((item) => item.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [items]);

  const visibleItems = activeCategory === 'all'
    ? items
    : items.filter((item) => item.category === activeCategory);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-headline text-on-background">Shop</Text>
          <View className="flex-row gap-2">
            <View className="flex-row items-center bg-tertiary-container border-[3px] border-ink rounded-lg px-2 py-1 gap-1">
              <MaterialIcons name="monetization-on" size={16} color={tokens.colors['on-tertiary-container']} />
              <Text className="font-label text-on-tertiary-container">{profile?.coins ?? 0}</Text>
            </View>
            <View className="flex-row items-center bg-primary-container border-[3px] border-ink rounded-lg px-2 py-1 gap-1">
              <MaterialCommunityIcons name="diamond-stone" size={16} color={tokens.colors['on-primary-container']} />
              <Text className="font-label text-on-primary-container">{profile?.gems ?? 0}</Text>
            </View>
          </View>
        </View>

        {categories.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {categories.map((cat) => (
                <ChibiButton
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  className={`px-4 py-2 ${activeCategory === cat ? 'bg-primary-container' : 'bg-surface-container'}`}
                >
                  <Text className="font-label text-on-background uppercase text-xs">{cat}</Text>
                </ChibiButton>
              ))}
            </View>
          </ScrollView>
        )}

        <View className="flex-row flex-wrap gap-x-[3.5%] gap-y-3">
          {visibleItems.map((item) => (
            <ChibiSurface key={item.id} className="w-[31%] p-2 items-center mb-3">
              <View className="w-full h-14 bg-surface-container-low border-[3px] border-ink rounded-lg items-center justify-center mb-1">
                <MaterialIcons
                  name={item.iconKey || 'checkroom'}
                  size={28}
                  color={tokens.colors['on-surface-variant']}
                />
              </View>
              <Text
                className="font-label text-on-background text-center text-xs"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <View
                className={`flex-row items-center justify-center gap-1 w-full mt-1 px-1 py-1 rounded-md border-[3px] border-ink ${
                  item.priceGems ? 'bg-primary-container' : 'bg-tertiary-container'
                }`}
              >
                {item.priceGems ? (
                  <>
                    <MaterialCommunityIcons name="diamond-stone" size={12} color={tokens.colors['on-primary-container']} />
                    <Text className="font-label text-[10px] text-on-primary-container">{item.priceGems}</Text>
                  </>
                ) : item.priceCoins ? (
                  <>
                    <MaterialIcons name="monetization-on" size={12} color={tokens.colors['on-tertiary-container']} />
                    <Text className="font-label text-[10px] text-on-tertiary-container">{item.priceCoins}</Text>
                  </>
                ) : (
                  <Text className="font-label text-[10px] text-on-tertiary-container">Owned</Text>
                )}
              </View>
            </ChibiSurface>
          ))}
        </View>
        {items.length === 0 && (
          <Text className="text-on-surface-variant text-center py-8">Nothing in stock yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
