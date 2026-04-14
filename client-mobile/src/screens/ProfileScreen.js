import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import {
  ActionButton,
  EmptyStateCard,
  ErrorStateCard,
  PreviewLoadingPanel,
  ScreenShell,
  StatePreviewSwitcher,
  StatusBadge,
  SurfaceCard
} from '../components/AppUI';
import QueueSmartLogo from '../components/QueueSmartLogo';
import { profile } from '../utils/mockData';
import { useClientSession } from '../utils/session';
import { useAppTheme } from '../utils/theme';

export default function ProfileScreen({ navigation }) {
  const { mode, theme, toggleTheme } = useAppTheme();
  const { logout } = useClientSession();
  const [previewMode, setPreviewMode] = useState('live');
  const [preferences, setPreferences] = useState(profile.preferences);

  const progress = Math.min(profile.loyaltyPoints / profile.nextRewardAt, 1);

  return (
    <ScreenShell
      subtitle="Profile preview includes loyalty points, notification preferences, booking history, and dark mode."
      title="Profile & Settings"
    >
      <StatePreviewSwitcher mode={previewMode} onChange={setPreviewMode} />

      {previewMode === 'loading' ? <PreviewLoadingPanel blocks={[180, 130, 160]} /> : null}

      {previewMode === 'empty' ? (
        <EmptyStateCard
          actionLabel="Book your first visit"
          description="No visits or loyalty progress yet. This is the empty state for brand-new users."
          icon="user"
          onAction={() => navigation.navigate('Booking')}
          title="Fresh account"
        />
      ) : null}

      {previewMode === 'error' ? (
        <ErrorStateCard
          actionLabel="Refresh profile"
          description="We could not sync the customer profile. Later this state can cover auth or settings fetch issues."
          onAction={() => setPreviewMode('live')}
          title="Profile unavailable"
        />
      ) : null}

      {previewMode === 'live' ? (
        <>
          <SurfaceCard tone="accent">
            <View style={styles.profileHeader}>
              <QueueSmartLogo size={74} />
              <View style={styles.profileCopy}>
                <Text
                  style={[
                    styles.name,
                    { color: theme.text, fontFamily: theme.typography.display }
                  ]}
                >
                  {profile.name}
                </Text>
                <Text
                  style={[
                    styles.meta,
                    { color: theme.textMuted, fontFamily: theme.typography.body }
                  ]}
                >
                  {profile.email}
                </Text>
                <Text
                  style={[
                    styles.meta,
                    { color: theme.textMuted, fontFamily: theme.typography.body }
                  ]}
                >
                  {profile.phone}
                </Text>
              </View>
            </View>
            <View style={styles.badgeRow}>
              <StatusBadge icon="award" label={profile.tier} tone="warning" />
              <StatusBadge icon="clock" label={`${profile.visits} visits`} tone="primary" />
            </View>
          </SurfaceCard>

          <SurfaceCard tone="success">
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, fontFamily: theme.typography.title }
                ]}
              >
                Loyalty progress
              </Text>
              <Text
                style={[
                  styles.pointsValue,
                  { color: theme.primary, fontFamily: theme.typography.display }
                ]}
              >
                {profile.loyaltyPoints}
              </Text>
            </View>
            <Text
              style={[
                styles.meta,
                { color: theme.textMuted, fontFamily: theme.typography.body }
              ]}
            >
              26 more points until your next free standard haircut reward.
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: theme.surfaceStrong }]}> 
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${progress * 100}%`
                  }
                ]}
              />
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Preferences
            </Text>

            <PreferenceRow
              description="Receive your turn approaching alerts"
              label="Push notifications"
              onValueChange={(value) => setPreferences((current) => ({ ...current, push: value }))}
              theme={theme}
              value={preferences.push}
            />
            <PreferenceRow
              description="Fallback for booking reminders"
              label="SMS updates"
              onValueChange={(value) => setPreferences((current) => ({ ...current, sms: value }))}
              theme={theme}
              value={preferences.sms}
            />
            <PreferenceRow
              description="Deals, points boosts, and branch promos"
              label="Promo alerts"
              onValueChange={(value) => setPreferences((current) => ({ ...current, promo: value }))}
              theme={theme}
              value={preferences.promo}
            />
            <PreferenceRow
              description="Switch the full mock UI color mode"
              label="Dark mode"
              onValueChange={toggleTheme}
              theme={theme}
              value={mode === 'dark'}
            />
          </SurfaceCard>

          <SurfaceCard tone="accent">
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Booking history
            </Text>
            <View style={styles.historyStack}>
              {profile.history.map((entry) => (
                <Pressable
                  key={entry.id}
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('Booking')}
                  style={[
                    styles.historyCard,
                    { backgroundColor: theme.surface, borderColor: theme.border }
                  ]}
                >
                  <View style={styles.historyCopy}>
                    <Text
                      style={[
                        styles.historyTitle,
                        { color: theme.text, fontFamily: theme.typography.label }
                      ]}
                    >
                      {entry.title}
                    </Text>
                    <Text
                      style={[
                        styles.meta,
                        { color: theme.textMuted, fontFamily: theme.typography.body }
                      ]}
                    >
                      {`${entry.date} | ${entry.barber}`}
                    </Text>
                  </View>
                  <StatusBadge icon="plus-circle" label={entry.points} tone="success" />
                </Pressable>
              ))}
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              This month's wins
            </Text>
            <View style={styles.badgeRow}>
              {profile.achievements.map((achievement) => (
                <StatusBadge key={achievement} icon="check-circle" label={achievement} tone="success" />
              ))}
            </View>
          </SurfaceCard>

          <ActionButton
            icon="calendar"
            label="Book Premium Again"
            onPress={() => navigation.navigate('Booking')}
            subtitle="Reserve another priority slot"
            variant="secondary"
          />
          <ActionButton
            icon="log-out"
            label="Log Out"
            onPress={() =>
              Alert.alert(
                'Log out of QBarber?',
                'You will return to the welcome gate for the demo app.',
                [
                  {
                    style: 'cancel',
                    text: 'Stay signed in'
                  },
                  {
                    style: 'destructive',
                    text: 'Log out',
                    onPress: () => {
                      logout();
                      navigation.getParent()?.reset({
                        index: 0,
                        routes: [{ name: 'Splash' }]
                      });
                    }
                  }
                ]
              )
            }
            subtitle="Return to the QBarber welcome gate"
            variant="danger"
          />
        </>
      ) : null}
    </ScreenShell>
  );
}

function PreferenceRow({ label, description, value, onValueChange, theme }) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceCopy}>
        <Text
          style={[
            styles.preferenceTitle,
            { color: theme.text, fontFamily: theme.typography.label }
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.preferenceText,
            { color: theme.textMuted, fontFamily: theme.typography.body }
          ]}
        >
          {description}
        </Text>
      </View>
      <Switch
        onValueChange={onValueChange}
        thumbColor={value ? '#FFFFFF' : '#E2E8F0'}
        trackColor={{ false: theme.surfaceStrong, true: theme.primary }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center'
  },
  profileCopy: {
    flex: 1,
    gap: 2
  },
  name: {
    fontSize: 24,
    lineHeight: 28
  },
  meta: {
    fontSize: 12,
    lineHeight: 18
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 23
  },
  pointsValue: {
    fontSize: 28,
    lineHeight: 32
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 999
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'space-between'
  },
  preferenceCopy: {
    flex: 1,
    gap: 2
  },
  preferenceTitle: {
    fontSize: 14,
    lineHeight: 18
  },
  preferenceText: {
    fontSize: 12,
    lineHeight: 18
  },
  historyStack: {
    gap: 12
  },
  historyCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  historyCopy: {
    flex: 1,
    gap: 2
  },
  historyTitle: {
    fontSize: 14,
    lineHeight: 18
  }
});
