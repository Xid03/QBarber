import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { queueSnapshot } from '../utils/mockData';
import { useAppTheme } from '../utils/theme';

export default function JoinQueueConfirmationScreen({ navigation }) {
  const { theme } = useAppTheme();
  const [previewMode, setPreviewMode] = useState('live');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <ScreenShell
      subtitle="This is the remote queue confirmation screen customers see right after joining."
      title="Queue Pass"
    >
      <StatePreviewSwitcher mode={previewMode} onChange={setPreviewMode} />

      {previewMode === 'loading' ? <PreviewLoadingPanel blocks={[120, 280, 110]} /> : null}

      {previewMode === 'empty' ? (
        <EmptyStateCard
          actionLabel="Join again"
          description="Your queue pass has been released. You can jump back into the line whenever you want."
          icon="x-circle"
          onAction={() => {
            setNotificationsEnabled(true);
            setPreviewMode('live');
          }}
          title="Queue cancelled"
        />
      ) : null}

      {previewMode === 'error' ? (
        <ErrorStateCard
          actionLabel="Reissue pass"
          description="The QR pass could not be generated. This is the fallback visual for a failed ticket assignment."
          onAction={() => setPreviewMode('live')}
          title="Pass generation failed"
        />
      ) : null}

      {previewMode === 'live' ? (
        <>
          <LinearGradient
            colors={theme.primaryGradient}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.hero}
          >
            <StatusBadge icon="check-circle" label="Joined successfully" tone="success" />
            <Text
              style={[
                styles.heroQueue,
                { color: '#FFFFFF', fontFamily: theme.typography.display }
              ]}
            >
              #{queueSnapshot.queueNumber}
            </Text>
            <Text
              style={[
                styles.heroCopy,
                { color: 'rgba(255,255,255,0.82)', fontFamily: theme.typography.body }
              ]}
            >
              You are officially in line for a {queueSnapshot.serviceType}. Estimated wait is about{' '}
              {queueSnapshot.estimatedWait} minutes.
            </Text>
          </LinearGradient>

          <SurfaceCard style={styles.qrCard}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Check-in QR pass
            </Text>
            <View style={[styles.qrFrame, { backgroundColor: theme.surfaceElevated }]}>
              <QRCode
                backgroundColor="transparent"
                color={theme.text}
                size={180}
                value={`QUEUE:${queueSnapshot.queueNumber}:CHECKIN`}
              />
            </View>
            <Text
              style={[
                styles.qrHint,
                { color: theme.textMuted, fontFamily: theme.typography.body }
              ]}
            >
              Show this pass at the front desk when you arrive. Later we can wire it to a real
              booking or queue session ID.
            </Text>
          </SurfaceCard>

          <SurfaceCard tone="accent">
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Queue details
            </Text>
            <View style={styles.detailsRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.textMuted, fontFamily: theme.typography.body }
                ]}
              >
                Joined at
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: theme.text, fontFamily: theme.typography.label }
                ]}
              >
                {queueSnapshot.joinedAt}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.textMuted, fontFamily: theme.typography.body }
                ]}
              >
                Arrival window
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: theme.text, fontFamily: theme.typography.label }
                ]}
              >
                {queueSnapshot.arrivalWindow}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.textMuted, fontFamily: theme.typography.body }
                ]}
              >
                Check-in chair
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: theme.text, fontFamily: theme.typography.label }
                ]}
              >
                {queueSnapshot.expectedChair}
              </Text>
            </View>
          </SurfaceCard>

          <View style={styles.actionStack}>
            <ActionButton
              icon={notificationsEnabled ? 'bell' : 'bell-off'}
              label={notificationsEnabled ? 'Notifications On' : 'Notify Me'}
              onPress={() => setNotificationsEnabled((current) => !current)}
              subtitle="Turn approaching and now serving alerts"
              variant="secondary"
            />
            <ActionButton
              icon="activity"
              label="View Live Position"
              onPress={() => navigation.navigate('Queue')}
              subtitle="Open the detailed queue tracker"
              variant="ghost"
            />
            <ActionButton
              icon="x"
              label="Cancel Queue"
              onPress={() => setPreviewMode('empty')}
              subtitle="Release this spot immediately"
              variant="danger"
            />
          </View>
        </>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 30,
    padding: 22,
    gap: 14
  },
  heroQueue: {
    fontSize: 46,
    lineHeight: 52
  },
  heroCopy: {
    fontSize: 14,
    lineHeight: 22
  },
  qrCard: {
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 23
  },
  qrFrame: {
    width: '100%',
    borderRadius: 26,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qrHint: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center'
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14
  },
  detailLabel: {
    fontSize: 13,
    lineHeight: 20
  },
  detailValue: {
    fontSize: 13,
    lineHeight: 20
  },
  actionStack: {
    gap: 12
  }
});
