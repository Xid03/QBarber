import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
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
import { formatCountdown } from '../utils/mockData';
import { useClientSession } from '../utils/session';
import { useAppTheme } from '../utils/theme';

export default function QueueStatusScreen({ navigation }) {
  const { theme } = useAppTheme();
  const { currentQueueEntry, myPosition, queueSnapshot, refreshQueueState } = useClientSession();
  const [previewMode, setPreviewMode] = useState('live');
  const [countdown, setCountdown] = useState(queueSnapshot?.countdownSeconds || 0);

  useEffect(() => {
    refreshQueueState().catch(() => {});
  }, []);

  useEffect(() => {
    setCountdown(queueSnapshot?.countdownSeconds || 0);
  }, [queueSnapshot?.countdownSeconds]);

  useEffect(() => {
    if (previewMode !== 'live' || !currentQueueEntry) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [previewMode]);

  const hasActiveQueue = Boolean(currentQueueEntry && queueSnapshot);

  return (
    <ScreenShell
      subtitle="Track your exact place in line with a countdown, arrival window, and queue pass actions."
      title="Queue Tracker"
    >
      <StatePreviewSwitcher mode={previewMode} onChange={setPreviewMode} />

      {previewMode === 'loading' ? <PreviewLoadingPanel blocks={[180, 220, 90]} /> : null}

      {previewMode === 'empty' || (previewMode === 'live' && !hasActiveQueue) ? (
        <EmptyStateCard
          actionLabel="Join a queue"
          description="You are not holding an active queue pass right now. Browse live branches and jump in when you are ready."
          icon="user-plus"
          onAction={() => navigation.navigate('Home')}
          title="No active queue"
        />
      ) : null}

      {previewMode === 'error' ? (
        <ErrorStateCard
          actionLabel="Reconnect preview"
          description="We could not sync the sample queue. This is how the failure state will look once real sockets are wired in."
          onAction={() => setPreviewMode('live')}
          title="Live queue unavailable"
        />
      ) : null}

      {previewMode === 'live' && hasActiveQueue ? (
        <>
          <LinearGradient
            colors={theme.primaryGradient}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <StatusBadge icon="hash" label={`Queue #${queueSnapshot.queueNumber}`} tone="primary" />
              <StatusBadge icon="clock" label={`${queueSnapshot.peopleAhead} ahead`} tone="success" />
            </View>
            <Text
              style={[
                styles.countdown,
                { color: '#FFFFFF', fontFamily: theme.typography.display }
              ]}
            >
              {formatCountdown(countdown)}
            </Text>
            <Text
              style={[
                styles.countdownLabel,
                { color: 'rgba(255,255,255,0.82)', fontFamily: theme.typography.body }
              ]}
            >
              Estimated countdown until your chair opens
            </Text>

            <View style={styles.heroMetaRow}>
              <View style={styles.metaBlock}>
                <Text
                  style={[
                    styles.metaValue,
                    { color: '#FFFFFF', fontFamily: theme.typography.title }
                  ]}
                >
                  {queueSnapshot.arrivalWindow}
                </Text>
                <Text
                  style={[
                    styles.metaLabel,
                    { color: 'rgba(255,255,255,0.72)', fontFamily: theme.typography.body }
                  ]}
                >
                  Arrival window
                </Text>
              </View>
              <View style={styles.metaBlock}>
                <Text
                  style={[
                    styles.metaValue,
                    { color: '#FFFFFF', fontFamily: theme.typography.title }
                  ]}
                >
                  {queueSnapshot.expectedChair}
                </Text>
                <Text
                  style={[
                    styles.metaLabel,
                    { color: 'rgba(255,255,255,0.72)', fontFamily: theme.typography.body }
                  ]}
                >
                  Expected chair
                </Text>
              </View>
            </View>
          </LinearGradient>

          <SurfaceCard tone="accent">
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, fontFamily: theme.typography.title }
                ]}
              >
                Queue positions ahead
              </Text>
              <StatusBadge icon="activity" label={`Now serving #${queueSnapshot.nowServing}`} tone="warning" />
            </View>
            <View style={styles.timeline}>
              {queueSnapshot.ahead.map((entry, index) => (
                <View key={entry.id} style={styles.timelineItem}>
                  <View style={styles.timelineRail}>
                    <View style={[styles.timelineDot, { backgroundColor: theme.primary }]} />
                    {index < queueSnapshot.ahead.length - 1 ? (
                      <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.timelineCard,
                      { backgroundColor: theme.surface, borderColor: theme.border }
                    ]}
                  >
                    <View style={styles.timelineTop}>
                      <Text
                        style={[
                          styles.timelineQueue,
                          { color: theme.text, fontFamily: theme.typography.label }
                        ]}
                      >
                        #{entry.queueNumber}
                      </Text>
                      <Text
                        style={[
                          styles.timelineEta,
                          { color: theme.textMuted, fontFamily: theme.typography.body }
                        ]}
                      >
                        {entry.eta}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.timelineService,
                        { color: theme.text, fontFamily: theme.typography.title }
                      ]}
                    >
                      {entry.service}
                    </Text>
                    <Text
                      style={[
                        styles.timelineStage,
                        { color: theme.textMuted, fontFamily: theme.typography.body }
                      ]}
                    >
                      {entry.stage}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </SurfaceCard>

          <SurfaceCard tone="success">
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Arrival advice
            </Text>
            <Text
              style={[
                styles.helperText,
                { color: theme.textMuted, fontFamily: theme.typography.body }
              ]}
            >
              Head out in about 10 minutes and keep your QR pass ready. This screen is designed to
              receive live Socket.io updates while your position changes, including turn-soon and now-serving events.
            </Text>
          </SurfaceCard>

          <View style={styles.actionStack}>
            <ActionButton
              icon="maximize-2"
              label="Open QR Pass"
              onPress={() => navigation.navigate('JoinQueueConfirmation')}
              subtitle="Show check-in code at the counter"
              variant="secondary"
            />
            <ActionButton
              icon="calendar"
              label="Book a Premium Rescue Slot"
              onPress={() => navigation.navigate('Booking')}
              subtitle="Jump to a guaranteed chair time"
              variant="ghost"
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
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10
  },
  countdown: {
    fontSize: 42,
    lineHeight: 48
  },
  countdownLabel: {
    fontSize: 14,
    lineHeight: 22
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  metaBlock: {
    minWidth: '45%',
    gap: 4
  },
  metaValue: {
    fontSize: 18,
    lineHeight: 23
  },
  metaLabel: {
    fontSize: 11,
    lineHeight: 15
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
  timeline: {
    gap: 14
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12
  },
  timelineRail: {
    alignItems: 'center',
    width: 18
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 12
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
    marginBottom: -8
  },
  timelineCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    gap: 4
  },
  timelineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  timelineQueue: {
    fontSize: 13,
    lineHeight: 18
  },
  timelineEta: {
    fontSize: 12,
    lineHeight: 17
  },
  timelineService: {
    fontSize: 16,
    lineHeight: 20
  },
  timelineStage: {
    fontSize: 12,
    lineHeight: 18
  },
  helperText: {
    fontSize: 14,
    lineHeight: 22
  },
  actionStack: {
    gap: 12
  }
});
