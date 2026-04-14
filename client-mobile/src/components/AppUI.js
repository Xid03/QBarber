import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { previewModes } from '../utils/mockData';
import { useAppTheme } from '../utils/theme';

export function MotionView({
  children,
  delay = 0,
  distance = 18,
  duration = 420,
  style
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true
      })
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, distance, duration, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function ScreenShell({
  title,
  subtitle,
  rightAction,
  children,
  stickyFooter,
  contentContainerStyle,
  scrollable = true
}) {
  const { theme } = useAppTheme();
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <LinearGradient
          colors={theme.backgroundGlow}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.glowTop}
        />
        <LinearGradient
          colors={theme.backgroundGlowSoft}
          end={{ x: 1, y: 1 }}
          start={{ x: 0.5, y: 0 }}
          style={styles.glowBottom}
        />
        <View style={[styles.orb, styles.primaryOrb, { backgroundColor: theme.orbPrimary }]} />
        <View style={[styles.orb, styles.secondaryOrb, { backgroundColor: theme.orbSecondary }]} />
      </View>

      <Container
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: stickyFooter ? 28 : 52
          },
          contentContainerStyle
        ]}
        showsVerticalScrollIndicator={false}
        style={styles.flex}
        scrollEventThrottle={16}
      >
        <MotionView delay={40} style={styles.screenFlow}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text
                style={[
                  styles.screenTitle,
                  { color: theme.text, fontFamily: theme.typography.display }
                ]}
              >
                {title}
              </Text>
              {subtitle ? (
                <Text
                  style={[
                    styles.screenSubtitle,
                    { color: theme.textMuted, fontFamily: theme.typography.body }
                  ]}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {rightAction ? <View>{rightAction}</View> : null}
          </View>

          <MotionView delay={140} distance={22} style={styles.screenBody}>
            {children}
          </MotionView>
        </MotionView>
      </Container>

      {stickyFooter ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.footerSurface,
              borderTopColor: theme.border
            }
          ]}
        >
          {stickyFooter}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function SurfaceCard({ children, style, tone = 'default' }) {
  const { theme } = useAppTheme();

  const toneMap = {
    default: {
      backgroundColor: theme.surface,
      borderColor: theme.border
    },
    accent: {
      backgroundColor: theme.surfaceElevated,
      borderColor: theme.border
    },
    success: {
      backgroundColor: theme.isDark ? '#12332B' : '#ECFDF5',
      borderColor: theme.isDark ? '#1B5E4B' : '#A7F3D0'
    },
    warning: {
      backgroundColor: theme.isDark ? '#3B2712' : '#FFFBEB',
      borderColor: theme.isDark ? '#7C4A0F' : '#FCD34D'
    },
    danger: {
      backgroundColor: theme.isDark ? '#35171D' : '#FEF2F2',
      borderColor: theme.isDark ? '#7F1D1D' : '#FECACA'
    }
  };

  const colors = toneMap[tone] || toneMap.default;
  const translateY = useRef(new Animated.Value(10)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 16,
        mass: 0.7,
        stiffness: 150,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true
      })
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          shadowColor: theme.shadow,
          opacity,
          transform: [{ translateY }]
        },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function ActionButton({
  label,
  subtitle,
  icon = 'arrow-right',
  onPress,
  variant = 'primary',
  disabled = false
}) {
  const { theme } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = (toValue) => {
    Animated.spring(scale, {
      toValue,
      damping: 18,
      mass: 0.7,
      stiffness: 220,
      useNativeDriver: true
    }).start();
  };

  if (variant === 'primary') {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => animateScale(disabled ? 1 : 0.97)}
        onPressOut={() => animateScale(1)}
        style={({ pressed }) => [
          {
            opacity: disabled ? 0.45 : pressed ? 0.9 : 1
          }
        ]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <LinearGradient
            colors={theme.primaryGradient}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.primaryButton}
          >
            <View style={styles.buttonCopy}>
              <Text
                style={[
                  styles.buttonLabel,
                  { color: '#FFFFFF', fontFamily: theme.typography.title }
                ]}
              >
                {label}
              </Text>
              {subtitle ? (
                <Text
                  style={[
                    styles.buttonSubtitle,
                    { color: 'rgba(255,255,255,0.82)', fontFamily: theme.typography.body }
                  ]}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <View style={styles.buttonIcon}>
              <Feather color="#FFFFFF" name={icon} size={18} />
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  const variantMap = {
    secondary: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      textColor: theme.text
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: theme.border,
      textColor: theme.text
    },
    danger: {
      backgroundColor: theme.isDark ? '#35171D' : '#FEF2F2',
      borderColor: theme.isDark ? '#7F1D1D' : '#FECACA',
      textColor: theme.danger
    }
  };

  const styleConfig = variantMap[variant] || variantMap.secondary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animateScale(disabled ? 1 : 0.97)}
      onPressOut={() => animateScale(1)}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1
        }
      ]}
    >
      <Animated.View
        style={[
          styles.secondaryButton,
          {
            backgroundColor: styleConfig.backgroundColor,
            borderColor: styleConfig.borderColor,
            transform: [{ scale }]
          }
        ]}
      >
        <View style={styles.buttonCopy}>
          <Text
            style={[
              styles.buttonLabel,
              { color: styleConfig.textColor, fontFamily: theme.typography.label }
            ]}
          >
            {label}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.buttonSubtitle,
                { color: theme.textMuted, fontFamily: theme.typography.body }
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={[styles.buttonIcon, { backgroundColor: theme.surfaceElevated }]}>
          <Feather color={styleConfig.textColor} name={icon} size={18} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, tone = 'default' }) {
  const { theme } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const palette =
    tone === 'primary'
      ? {
          backgroundColor: theme.primary,
          color: '#FFFFFF'
        }
      : {
          backgroundColor: theme.surface,
          color: theme.icon
        };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scale, {
          toValue: 0.94,
          damping: 18,
          mass: 0.7,
          stiffness: 220,
          useNativeDriver: true
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scale, {
          toValue: 1,
          damping: 18,
          mass: 0.7,
          stiffness: 220,
          useNativeDriver: true
        }).start();
      }}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.82 : 1
        }
      ]}
    >
      <Animated.View
        style={[
          styles.iconButton,
          {
            backgroundColor: palette.backgroundColor,
            borderColor: theme.border,
            transform: [{ scale }]
          }
        ]}
      >
        <Feather color={palette.color} name={icon} size={18} />
      </Animated.View>
    </Pressable>
  );
}

export function StatusBadge({ label, tone = 'primary', icon }) {
  const { theme } = useAppTheme();

  const toneMap = {
    primary: {
      backgroundColor: theme.isDark ? '#1B325C' : '#DBEAFE',
      borderColor: theme.isDark ? '#28477D' : '#93C5FD',
      color: theme.primary
    },
    success: {
      backgroundColor: theme.isDark ? '#113B2E' : '#D1FAE5',
      borderColor: theme.isDark ? '#1D5E49' : '#6EE7B7',
      color: theme.success
    },
    warning: {
      backgroundColor: theme.isDark ? '#3D2B12' : '#FEF3C7',
      borderColor: theme.isDark ? '#845015' : '#FCD34D',
      color: theme.warning
    },
    danger: {
      backgroundColor: theme.isDark ? '#38181D' : '#FEE2E2',
      borderColor: theme.isDark ? '#7F1D1D' : '#FCA5A5',
      color: theme.danger
    }
  };

  const styleConfig = toneMap[tone] || toneMap.primary;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: styleConfig.backgroundColor,
          borderColor: styleConfig.borderColor
        }
      ]}
    >
      {icon ? <Feather color={styleConfig.color} name={icon} size={13} /> : null}
      <Text
        style={[
          styles.badgeLabel,
          { color: styleConfig.color, fontFamily: theme.typography.label }
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function StatePreviewSwitcher({ mode, onChange }) {
  const { theme } = useAppTheme();

  return (
    <SurfaceCard style={styles.switcherCard}>
      <Text
        style={[
          styles.switcherTitle,
          { color: theme.text, fontFamily: theme.typography.label }
        ]}
      >
        Preview state
      </Text>
      <Text
        style={[
          styles.switcherDescription,
          { color: theme.textMuted, fontFamily: theme.typography.body }
        ]}
      >
        Flip through live, loading, empty, and error variants before real API wiring.
      </Text>
      <View style={styles.switcherRow}>
        {previewModes.map((option) => {
          const isActive = option === mode;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => onChange(option)}
              style={[
                styles.switcherChip,
                {
                  backgroundColor: isActive ? theme.primary : theme.surfaceElevated,
                  borderColor: isActive ? theme.primary : theme.border
                }
              ]}
            >
              <Text
                style={[
                  styles.switcherChipLabel,
                  {
                    color: isActive ? '#FFFFFF' : theme.text,
                    fontFamily: theme.typography.label
                  }
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SurfaceCard>
  );
}

export function PreviewLoadingPanel({ blocks = [160, 24, 120, 220] }) {
  const { theme } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.38)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.88,
          duration: 850,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.38,
          duration: 850,
          useNativeDriver: true
        })
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <SurfaceCard>
      {blocks.map((height, index) => (
        <Animated.View
          key={`${height}-${index}`}
          style={[
            styles.loadingBlock,
            {
              height,
              opacity,
              backgroundColor: theme.skeleton,
              marginBottom: index === blocks.length - 1 ? 0 : 14
            }
          ]}
        />
      ))}
    </SurfaceCard>
  );
}

export function EmptyStateCard({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction
}) {
  const { theme } = useAppTheme();

  return (
    <SurfaceCard style={styles.feedbackCard} tone="accent">
      <View style={[styles.feedbackIcon, { backgroundColor: theme.surfaceStrong }]}>
        <Feather color={theme.primary} name={icon} size={24} />
      </View>
      <Text
        style={[
          styles.feedbackTitle,
          { color: theme.text, fontFamily: theme.typography.title }
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.feedbackDescription,
          { color: theme.textMuted, fontFamily: theme.typography.body }
        ]}
      >
        {description}
      </Text>
      {actionLabel ? (
        <ActionButton icon="refresh-cw" label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </SurfaceCard>
  );
}

export function ErrorStateCard({
  title,
  description,
  actionLabel = 'Try again',
  onAction
}) {
  const { theme } = useAppTheme();

  return (
    <SurfaceCard style={styles.feedbackCard} tone="danger">
      <View style={[styles.feedbackIcon, { backgroundColor: theme.isDark ? '#4B1D24' : '#FEE2E2' }]}>
        <Feather color={theme.danger} name="alert-triangle" size={24} />
      </View>
      <Text
        style={[
          styles.feedbackTitle,
          { color: theme.text, fontFamily: theme.typography.title }
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.feedbackDescription,
          { color: theme.textMuted, fontFamily: theme.typography.body }
        ]}
      >
        {description}
      </Text>
      <ActionButton icon="rotate-ccw" label={actionLabel} onPress={onAction} variant="danger" />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  flex: {
    flex: 1
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject
  },
  glowTop: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: 60,
    height: 260
  },
  glowBottom: {
    position: 'absolute',
    bottom: 40,
    right: -20,
    width: 220,
    height: 220
  },
  orb: {
    position: 'absolute',
    borderRadius: 999
  },
  primaryOrb: {
    top: 110,
    right: -36,
    width: 180,
    height: 180
  },
  secondaryOrb: {
    bottom: 120,
    left: -30,
    width: 120,
    height: 120
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16
  },
  screenFlow: {
    gap: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4
  },
  headerCopy: {
    flex: 1,
    gap: 8
  },
  screenTitle: {
    fontSize: 28,
    lineHeight: 34
  },
  screenSubtitle: {
    fontSize: 14,
    lineHeight: 22
  },
  screenBody: {
    gap: 16
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 1
  },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    gap: 14,
    shadowOffset: {
      width: 0,
      height: 18
    },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 5
  },
  primaryButton: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14
  },
  secondaryButton: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14
  },
  buttonCopy: {
    flex: 1,
    gap: 4
  },
  buttonLabel: {
    fontSize: 15,
    lineHeight: 20
  },
  buttonSubtitle: {
    fontSize: 12,
    lineHeight: 18
  },
  buttonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)'
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  badgeLabel: {
    fontSize: 11,
    lineHeight: 14
  },
  switcherCard: {
    gap: 10
  },
  switcherTitle: {
    fontSize: 13,
    lineHeight: 18
  },
  switcherDescription: {
    fontSize: 12,
    lineHeight: 18
  },
  switcherRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  switcherChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1
  },
  switcherChipLabel: {
    fontSize: 12,
    lineHeight: 16
  },
  loadingBlock: {
    borderRadius: 18
  },
  feedbackCard: {
    alignItems: 'center',
    textAlign: 'center'
  },
  feedbackIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedbackTitle: {
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center'
  },
  feedbackDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 4
  }
});
