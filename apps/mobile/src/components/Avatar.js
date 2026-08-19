import { Image, View } from 'react-native';

// `apps/mobile/assets/character/<part>/` holds one flat-transparent PNG per
// option, all painted on the same 260x505 canvas so any combination lines up
// without per-part offsets. Shared between AvatarCreatorScreen (the editor)
// and anywhere else (HomeScreen's hero, ProfileScreen, ...) that just needs
// to render whatever the player picked.
export const PARTS = [
  {
    key: 'body',
    label: 'Body',
    icon: 'person',
    options: [
      { id: 'slim', label: 'Slim', asset: require('../../assets/character/body/slim.png') },
      { id: 'athletic', label: 'Athletic', asset: require('../../assets/character/body/athletic.png') },
      { id: 'muscular', label: 'Muscular', asset: require('../../assets/character/body/muscular.png') },
      { id: 'shredded', label: 'Shredded', asset: require('../../assets/character/body/shredded.png') },
    ],
  },
  {
    key: 'hair',
    label: 'Hair',
    icon: 'content-cut',
    options: [
      { id: 'short', label: 'Short', asset: require('../../assets/character/hair/short.png') },
      { id: 'twintails', label: 'Twintails', asset: require('../../assets/character/hair/twintails.png') },
    ],
  },
  {
    key: 'shirt',
    label: 'Top',
    icon: 'checkroom',
    options: [
      { id: 'tank', label: 'Tank', asset: require('../../assets/character/shirt/tank.png') },
      { id: 'henley', label: 'Henley', asset: require('../../assets/character/shirt/henley.png') },
      { id: 'jacket', label: 'Jacket', asset: require('../../assets/character/shirt/jacket.png') },
    ],
  },
  {
    key: 'pant',
    label: 'Bottom',
    icon: 'dry-cleaning',
    options: [
      { id: 'shorts', label: 'Shorts', asset: require('../../assets/character/pant/shorts.png') },
      { id: 'joggers', label: 'Joggers', asset: require('../../assets/character/pant/joggers.png') },
    ],
  },
  {
    key: 'shoe',
    label: 'Shoes',
    icon: 'directions-run',
    options: [{ id: 'sneakers', label: 'Sneakers', asset: require('../../assets/character/shoe/sneakers.png') }],
  },
];

export const PARTS_BY_KEY = Object.fromEntries(PARTS.map((p) => [p.key, p]));

// Back-to-front paint order — matches the physical stacking the assets were
// authored for: body at the bottom, shirt topmost.
export const RENDER_ORDER = ['body', 'shoe', 'hair', 'pant', 'shirt'];

export const DEFAULT_SELECTION = {
  body: 'muscular',
  hair: 'short',
  shirt: 'jacket',
  pant: 'joggers',
  shoe: 'sneakers',
};

// The server only persists hairStyle/skinTone today (see apps/server's
// EDITABLE_FIELDS) — shirt/pant/shoe fall back to the defaults until that
// lands, and any id it doesn't recognize (renamed/removed option) also falls
// back instead of rendering a blank layer.
export function selectionFromProfile(profile) {
  const selection = { ...DEFAULT_SELECTION };
  if (profile?.skinTone && PARTS_BY_KEY.body.options.some((o) => o.id === profile.skinTone)) {
    selection.body = profile.skinTone;
  }
  if (profile?.hairStyle && PARTS_BY_KEY.hair.options.some((o) => o.id === profile.hairStyle)) {
    selection.hair = profile.hairStyle;
  }
  return selection;
}

// Every option for every part stays mounted the whole time — switching
// selection is just an opacity flip instead of a mount/decode, so it's
// instant after the one-time decode cost when this first mounts.
export function AvatarCanvas({ selection, className = '' }) {
  return (
    <View className={`relative ${className}`}>
      {RENDER_ORDER.map((key) =>
        PARTS_BY_KEY[key].options.map((option) => (
          <Image
            key={option.id}
            source={option.asset}
            resizeMode="contain"
            fadeDuration={0}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: selection[key] === option.id ? 1 : 0 }}
          />
        ))
      )}
    </View>
  );
}
