import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
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
import { bookingSetup } from '../utils/mockData';
import { useAppTheme } from '../utils/theme';

export default function BookingConfirmationScreen({ navigation, route }) {
  const { theme } = useAppTheme();
  const [previewMode, setPreviewMode] = useState('live');
  const [calendarSaved, setCalendarSaved] = useState(false);

  const confirmation = useMemo(
    () => ({
      bookingId: route?.params?.bookingId || bookingSetup.confirmation.bookingId,
      barber: route?.params?.barber || bookingSetup.confirmation.barber,
      date: route?.params?.date || bookingSetup.confirmation.date,
      time: route?.params?.time || bookingSetup.confirmation.time,
      service: route?.params?.service || bookingSetup.serviceTypes[0].name
    }),
    [route?.params]
  );

  return (
    <ScreenShell
      subtitle="Premium booking summary with reminders, calendar handoff, and pre-arrival guidance."
      title="Booking Confirmed"
    >
      <StatePreviewSwitcher mode={previewMode} onChange={setPreviewMode} />

      {previewMode === 'loading' ? <PreviewLoadingPanel blocks={[120, 200, 120]} /> : null}

      {previewMode === 'empty' ? (
        <EmptyStateCard
          actionLabel="Book another slot"
          description="There is no active premium booking to show right now. This covers the post-cancellation empty state."
          icon="calendar"
          onAction={() => navigation.navigate('Booking')}
          title="No upcoming premium booking"
        />
      ) : null}

      {previewMode === 'error' ? (
        <ErrorStateCard
          actionLabel="Reload confirmation"
          description="The booking receipt could not load. Once backend wiring exists, this maps directly to booking detail fetch failures."
          onAction={() => setPreviewMode('live')}
          title="Confirmation unavailable"
        />
      ) : null}

      {previewMode === 'live' ? (
        <>
          <LinearGradient
            colors={theme.successGradient}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <View style={styles.checkBadge}>
                <Feather color={theme.success} name="check" size={18} />
              </View>
              <StatusBadge icon="bookmark" label={confirmation.bookingId} tone="success" />
            </View>
            <Text
              style={[
                styles.heroTitle,
                { color: '#FFFFFF', fontFamily: theme.typography.display }
              ]}
            >
              You&apos;re locked in.
            </Text>
            <Text
              style={[
                styles.heroCopy,
                { color: 'rgba(255,255,255,0.84)', fontFamily: theme.typography.body }
              ]}
            >
              {confirmation.service} with {confirmation.barber} at {confirmation.time}. Your reminder
              lands 15 minutes before check-in.
            </Text>
          </LinearGradient>

          <SurfaceCard tone="accent">
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Booking summary
            </Text>
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.textMuted, fontFamily: theme.typography.body }
                ]}
              >
                Date
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: theme.text, fontFamily: theme.typography.label }
                ]}
              >
                {confirmation.date}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.textMuted, fontFamily: theme.typography.body }
                ]}
              >
                Time
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: theme.text, fontFamily: theme.typography.label }
                ]}
              >
                {confirmation.time}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.textMuted, fontFamily: theme.typography.body }
                ]}
              >
                Lane
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: theme.text, fontFamily: theme.typography.label }
                ]}
              >
                {bookingSetup.confirmation.lane}
              </Text>
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Reminder timeline
            </Text>
            <View style={styles.timelineEntry}>
              <View style={[styles.timelineMarker, { backgroundColor: theme.success }]} />
              <View style={styles.timelineCopy}>
                <Text
                  style={[
                    styles.timelineTitle,
                    { color: theme.text, fontFamily: theme.typography.label }
                  ]}
                >
                  15 minutes before
                </Text>
                <Text
                  style={[
                    styles.timelineText,
                    { color: theme.textMuted, fontFamily: theme.typography.body }
                  ]}
                >
                  Push reminder with check-in instructions and your assigned chair lane.
                </Text>
              </View>
            </View>
            <View style={styles.timelineEntry}>
              <View style={[styles.timelineMarker, { backgroundColor: theme.primary }]} />
              <View style={styles.timelineCopy}>
                <Text
                  style={[
                    styles.timelineTitle,
                    { color: theme.text, fontFamily: theme.typography.label }
                  ]}
                >
                  At arrival
                </Text>
                <Text
                  style={[
                    styles.timelineText,
                    { color: theme.textMuted, fontFamily: theme.typography.body }
                  ]}
                >
                  Show your booking reference or scan the shop QR code to check in instantly.
                </Text>
              </View>
            </View>
          </SurfaceCard>

          <SurfaceCard tone="success">
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Calendar handoff
            </Text>
            <Text
              style={[
                styles.timelineText,
                { color: theme.textMuted, fontFamily: theme.typography.body }
              ]}
            >
              Tap the button below to simulate adding this booking into your phone calendar.
            </Text>
            <StatusBadge
              icon={calendarSaved ? 'check-circle' : 'calendar'}
              label={calendarSaved ? 'Added to calendar' : 'Not added yet'}
              tone={calendarSaved ? 'success' : 'warning'}
            />
          </SurfaceCard>

          <View style={styles.actions}>
            <ActionButton
              icon={calendarSaved ? 'check-circle' : 'calendar'}
              label={calendarSaved ? 'Calendar Saved' : 'Add to Calendar'}
              onPress={() => setCalendarSaved(true)}
              subtitle="Creates a reminder placeholder for now"
              variant="secondary"
            />
            <ActionButton
              icon="home"
              label="Back to Home"
              onPress={() => navigation.navigate('Home')}
              subtitle="Return to the live queue dashboard"
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
    alignItems: 'center'
  },
  checkBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 40
  },
  heroCopy: {
    fontSize: 14,
    lineHeight: 22
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 23
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  detailLabel: {
    fontSize: 13,
    lineHeight: 18
  },
  detailValue: {
    fontSize: 13,
    lineHeight: 18
  },
  timelineEntry: {
    flexDirection: 'row',
    gap: 12
  },
  timelineMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 5
  },
  timelineCopy: {
    flex: 1,
    gap: 4
  },
  timelineTitle: {
    fontSize: 14,
    lineHeight: 18
  },
  timelineText: {
    fontSize: 13,
    lineHeight: 20
  },
  actions: {
    gap: 12
  }
});
