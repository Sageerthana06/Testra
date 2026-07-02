import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, GLASS_PRESETS } from '../constants/theme';

export default function GlassCard({ children, style, isDarkMode = true, intensity = 40 }) {
  const scale = useSharedValue(1);
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(0.98, { damping: 10 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  return (
    <Animated.View
      style={[styles.container, animatedStyle, style]}
      onTouchStart={onPressIn}
      onTouchEnd={onPressOut}
    >
      <BlurView
        intensity={intensity}
        tint={isDarkMode ? 'dark' : 'light'}
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: GLASS_PRESETS.card.borderRadius }
        ]}
      />
      <LinearGradient
        colors={['#FF0000', '#FFD700', '#90EE90']} // சிவப்பு → மஞ்சள் → லைட் கிரீன்
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            borderColor: '#FFD700', // மஞ்சள் நிற பார்டர்
            borderRadius: GLASS_PRESETS.card.borderRadius
          }
        ]}
      >
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...GLASS_PRESETS.card,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
  },
  content: {
    padding: 16,
    flex: 1,
  }
});
