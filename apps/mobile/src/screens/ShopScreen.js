import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiSurface } from '../components/Chibi';
import { api } from '../api/client';

// Matches design/Shop.html. Read-only for now — purchasing (deducting
// coins/gems, adding to an inventory) isn't implemented yet, see todo.md.
export default function ShopScreen() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getShopItems().then(setItems);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-2xl font-bold text-on-background mb-4">Shop</Text>
        <View className="flex-row flex-wrap gap-3">
          {items.map((item) => (
            <ChibiSurface key={item.id} className="w-[47%] p-3 items-center">
              <Text className="text-3xl mb-1">🧥</Text>
              <Text className="font-bold text-on-background text-center">{item.name}</Text>
              <Text className="text-xs text-on-surface-variant">
                {item.priceGems ? `${item.priceGems} 💎` : item.priceCoins ? `${item.priceCoins} 🪙` : 'Owned'}
              </Text>
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
