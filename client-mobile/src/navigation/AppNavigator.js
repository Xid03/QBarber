import { Feather } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import BookingScreen from '../screens/BookingScreen';
import HomeScreen from '../screens/HomeScreen';
import JoinQueueConfirmationScreen from '../screens/JoinQueueConfirmationScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QueueStatusScreen from '../screens/QueueStatusScreen';
import SplashScreen from '../screens/SplashScreen';
import { useAppTheme } from '../utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'fade',
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.footerSurface,
          borderTopColor: theme.border,
          height: 78,
          paddingBottom: 10,
          paddingTop: 10
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.label,
          fontSize: 11
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Home: 'home',
            Queue: 'clock',
            Notifications: 'bell',
            Profile: 'user'
          };

          return <Feather color={color} name={iconMap[route.name]} size={size} />;
        }
      })}
    >
      <Tab.Screen component={HomeScreen} name="Home" />
      <Tab.Screen component={QueueStatusScreen} name="Queue" />
      <Tab.Screen component={NotificationsScreen} name="Notifications" />
      <Tab.Screen component={ProfileScreen} name="Profile" />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useAppTheme();

  const navigationTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.danger
    }
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: theme.background
          }
        }}
      >
        <Stack.Screen
          component={SplashScreen}
          name="Splash"
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          component={MainTabs}
          name="MainTabs"
          options={{ animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          component={JoinQueueConfirmationScreen}
          name="JoinQueueConfirmation"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          component={BookingScreen}
          name="Booking"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          component={BookingConfirmationScreen}
          name="BookingConfirmation"
          options={{ animation: 'fade_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
