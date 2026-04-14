import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QueueSmartLogo from '../components/QueueSmartLogo';
import { useClientSession } from '../utils/session';
import { useAppTheme } from '../utils/theme';

export default function SplashScreen({ navigation }) {
  const { theme } = useAppTheme();
  const { isLoggedIn, isAuthenticating, loginDemo } = useClientSession();
  const pulse = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 900,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0.92,
          duration: 900,
          useNativeDriver: true
        })
      ])
    );

    animation.start();

    const timeout = isLoggedIn
      ? setTimeout(() => {
          navigation.replace('MainTabs');
        }, 1700)
      : null;

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      animation.stop();
    };
  }, [isLoggedIn, navigation, pulse]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.primaryGradient}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.gradient}
      />
      <Animated.View style={[styles.logoOrb, { transform: [{ scale: pulse }] }]}>
        <QueueSmartLogo size={108} />
      </Animated.View>
      <View style={styles.copy}>
        <Text
          style={[
            styles.brand,
            { color: '#FFFFFF', fontFamily: theme.typography.display }
          ]}
        >
          QBarber
        </Text>
        <Text
          style={[
            styles.tagline,
            { color: 'rgba(255,255,255,0.8)', fontFamily: theme.typography.body }
          ]}
        >
          Live chairs. Smarter timing. A smoother barbershop experience from anywhere.
        </Text>
        {!isLoggedIn ? (
          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              const result = await loginDemo();

              if (result?.ok) {
                navigation.replace('MainTabs');
              }
            }}
            style={({ pressed }) => [
              styles.continueButton,
              { opacity: pressed ? 0.9 : 1 }
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#E0EAFF']}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.continueGradient}
            >
                <Text
                  style={[
                    styles.continueLabel,
                    { color: theme.primary, fontFamily: theme.typography.title }
                  ]}
                >
                  {isAuthenticating ? 'Connecting to Live Queue...' : 'Continue to QBarber'}
                </Text>
                <Text
                  style={[
                  styles.continueHint,
                  { color: '#475569', fontFamily: theme.typography.body }
                ]}
              >
                Re-enter the customer preview after logout
              </Text>
            </LinearGradient>
          </Pressable>
        ) : null}
      </View>
      <Text
        style={[
          styles.footer,
          { color: 'rgba(255,255,255,0.72)', fontFamily: theme.typography.label }
        ]}
      >
        {isLoggedIn
          ? "Syncing today's queue rhythm..."
          : isAuthenticating
            ? 'Signing in with the demo customer account'
            : 'Signed out of the preview session'}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 28
  },
  gradient: {
    ...StyleSheet.absoluteFillObject
  },
  logoOrb: {
    marginTop: 80
  },
  copy: {
    alignItems: 'center',
    gap: 14
  },
  brand: {
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center'
  },
  tagline: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 300
  },
  continueButton: {
    marginTop: 10,
    width: '100%',
    maxWidth: 300
  },
  continueGradient: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 4
  },
  continueLabel: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center'
  },
  continueHint: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center'
  },
  footer: {
    fontSize: 12,
    letterSpacing: 0.6
  }
});
