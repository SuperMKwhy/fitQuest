import { Pressable, View } from 'react-native';
import tokens from '../theme/tokens';

/**
 * The app-wide "brutalist" card/button look from design/design.md: a 3px
 * ink border plus a flat, non-blurred drop shadow offset by 4px (no blur —
 * CSS box-shadow can express that directly, but React Native's shadow
 * props are always blurred, so it's built here as a second ink-colored
 * layer sitting behind the content, offset by `hardShadowOffset`).
 *
 * ChibiButton additionally slides the content onto the shadow layer on
 * press (shadow "disappears"), matching every `.chibi-active:active`
 * press state in the mockups.
 */

const OFFSET = tokens.hardShadowOffset;

export function ChibiSurface({ children, className = '', style }) {
  return (
    <View className="relative">
      <View
        className="absolute rounded-lg bg-ink"
        style={{ top: OFFSET, left: OFFSET, right: -OFFSET, bottom: -OFFSET }}
      />
      <View className={`rounded-lg border-[3px] border-ink bg-surface-container-lowest ${className}`} style={style}>
        {children}
      </View>
    </View>
  );
}

export function ChibiButton({ children, onPress, className = '', style, disabled = false }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button">
      {({ pressed }) => (
        <View className="relative">
          <View
            className="absolute rounded-lg bg-ink"
            style={{ top: OFFSET, left: OFFSET, right: -OFFSET, bottom: -OFFSET }}
          />
          <View
            className={`rounded-lg border-[3px] border-ink bg-primary-container items-center justify-center ${className}`}
            style={[
              { transform: [{ translateX: pressed ? OFFSET : 0 }, { translateY: pressed ? OFFSET : 0 }] },
              disabled && { opacity: 0.5 },
              style,
            ]}
          >
            {children}
          </View>
        </View>
      )}
    </Pressable>
  );
}
