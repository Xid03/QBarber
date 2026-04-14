import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ActionButton,
  EmptyStateCard,
  ErrorStateCard,
  IconButton,
  PreviewLoadingPanel,
  ScreenShell,
  StatePreviewSwitcher,
  StatusBadge,
  SurfaceCard
} from '../components/AppUI';
import QueueSmartLogo from '../components/QueueSmartLogo';
import { getInitials } from '../utils/mockData';
import { useClientSession } from '../utils/session';
import { useAppTheme } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const { theme, toggleTheme } = useAppTheme();
  const {
    branches,
    selectedBranchId,
    selectedBranch,
    selectBranch,
    barbers,
    queueSnapshot,
    currentQueueEntry,
    error,
    isRefreshing,
    joinQueueRemote,
    refreshHomeData
  } = useClientSession();
  const [previewMode, setPreviewMode] = useState('live');

  useEffect(() => {
    refreshHomeData().catch(() => {});
  }, []);

  const headerAction = (
    <IconButton icon={theme.isDark ? 'sun' : 'moon'} onPress={toggleTheme} tone="default" />
  );

  const handleJoinQueue = async () => {
    try {
      await joinQueueRemote({ serviceType: 'haircut', type: 'walk-in' });
      navigation.navigate('JoinQueueConfirmation');
    } catch (nextError) {
      Alert.alert('Unable to join queue', nextError.message);
    }
  };

  const liveModeUnavailable = !selectedBranch || !queueSnapshot;

  return (
    <ScreenShell
      rightAction={headerAction}
      subtitle="Beat the wait before you leave home with a live branch view."
      title="Good morning"
    >
      <StatePreviewSwitcher mode={previewMode} onChange={setPreviewMode} />

      {previewMode === 'loading' || (previewMode === 'live' && isRefreshing && liveModeUnavailable) ? (
        <PreviewLoadingPanel />
      ) : null}

      {previewMode === 'empty' ? (
        <EmptyStateCard
          actionLabel="Refresh nearby branches"
          description="No active branches are broadcasting queue data right now. You can still browse premium slots later."
          icon="map-pin"
          onAction={() => {
            setPreviewMode('live');
            refreshHomeData().catch(() => {});
          }}
          title="No live branches nearby"
        />
      ) : null}

      {previewMode === 'error' || (previewMode === 'live' && error && liveModeUnavailable) ? (
        <ErrorStateCard
          actionLabel="Retry preview"
          description={error || 'The queue feed is offline right now. Check your API URL and server status, then try again.'}
          onAction={() => {
            setPreviewMode('live');
            refreshHomeData().catch(() => {});
          }}
          title="Queue feed offline"
        />
      ) : null}

      {previewMode === 'live' && !liveModeUnavailable ? (
        <>
          <LinearGradient
            colors={theme.primaryGradient}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <View style={styles.heroBrandWrap}>
                <QueueSmartLogo size={42} />
                <View style={styles.heroBrandCopy}>
                  <Text style={[styles.heroBrand, { color: '#FFFFFF', fontFamily: theme.typography.title }]}>
                    QBarber
                  </Text>
                  <Text
                    style={[
                      styles.heroBranch,
                      { color: 'rgba(255,255,255,0.78)', fontFamily: theme.typography.body }
                    ]}
                  >
                    {selectedBranch.name}
                  </Text>
                </View>
              </View>
              <StatusBadge
                icon={isRefreshing ? 'refresh-cw' : 'radio'}
                label={queueSnapshot.queuePaused ? 'Queue paused' : 'Live queue pulse'}
                tone={queueSnapshot.queuePaused ? 'warning' : 'primary'}
              />
            </View>

            <Text style={[styles.heroTitle, { color: '#FFFFFF', fontFamily: theme.typography.display }]}>
              Now serving #{queueSnapshot.nowServing}
            </Text>
            <Text
              style={[
                styles.heroSubtitle,
                { color: 'rgba(255,255,255,0.82)', fontFamily: theme.typography.body }
              ]}
            >
              {selectedBranch.highlight} in {selectedBranch.district}
            </Text>

            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { color: '#FFFFFF', fontFamily: theme.typography.title }]}>
                  {queueSnapshot.waitingCount}
                </Text>
                <Text style={[styles.heroStatLabel, { color: 'rgba(255,255,255,0.74)', fontFamily: theme.typography.body }]}>
                  Customers waiting
                </Text>
              </View>

              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { color: '#FFFFFF', fontFamily: theme.typography.title }]}>
                  {queueSnapshot.activeBarbers}/{queueSnapshot.totalBarbers}
                </Text>
                <Text style={[styles.heroStatLabel, { color: 'rgba(255,255,255,0.74)', fontFamily: theme.typography.body }]}>
                  Barbers active
                </Text>
              </View>

              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { color: '#FFFFFF', fontFamily: theme.typography.title }]}>
                  ~{selectedBranch.waitMinutes || queueSnapshot.estimatedWait}m
                </Text>
                <Text style={[styles.heroStatLabel, { color: 'rgba(255,255,255,0.74)', fontFamily: theme.typography.body }]}>
                  Estimated wait
                </Text>
              </View>
            </View>
          </LinearGradient>

          <SurfaceCard>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.typography.title }]}>
              Choose a branch
            </Text>
            <ScrollView contentContainerStyle={styles.branchRow} horizontal showsHorizontalScrollIndicator={false}>
              {branches.map((branch) => {
                const isSelected = branch.id === selectedBranchId;

                return (
                  <Pressable
                    key={branch.id}
                    accessibilityRole="button"
                    onPress={() => selectBranch(branch.id)}
                    style={[
                      styles.branchCard,
                      {
                        backgroundColor: isSelected ? theme.surfaceStrong : theme.surfaceElevated,
                        borderColor: isSelected ? theme.primary : theme.border
                      }
                    ]}
                  >
                    <Text style={[styles.branchName, { color: theme.text, fontFamily: theme.typography.label }]}>
                      {branch.name}
                    </Text>
                    <Text style={[styles.branchMeta, { color: theme.textMuted, fontFamily: theme.typography.body }]}>
                      {branch.distance}
                    </Text>
                    <StatusBadge
                      icon="navigation"
                      label={`${branch.waitMinutes || queueSnapshot.estimatedWait} min`}
                      tone={isSelected ? 'primary' : 'success'}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </SurfaceCard>

          <View style={styles.actionStack}>
            <ActionButton
              icon="user-plus"
              label={currentQueueEntry ? 'View Queue Pass' : 'Join Queue'}
              onPress={currentQueueEntry ? () => navigation.navigate('JoinQueueConfirmation') : handleJoinQueue}
              subtitle={
                currentQueueEntry
                  ? `Queue #${currentQueueEntry.queueNumber} is already active`
                  : `Secure queue #${queueSnapshot.queueNumber} remotely`
              }
            />
            <ActionButton
              icon="calendar"
              label="Book Premium Slot"
              onPress={() => navigation.navigate('Booking')}
              subtitle="Guaranteed timing with a booking fee"
              variant="secondary"
            />
          </View>

          <SurfaceCard tone="accent">
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.typography.title }]}>
                Today&apos;s floor lineup
              </Text>
              <StatusBadge icon="scissors" label={`${queueSnapshot.activeBarbers} chairs moving`} tone="success" />
            </View>
            <View style={styles.barberGrid}>
              {barbers.map((barber) => (
                <View
                  key={barber.id}
                  style={[
                    styles.barberCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border
                    }
                  ]}
                >
                  <View style={[styles.avatar, { backgroundColor: theme.surfaceStrong }]}>
                    <Text style={[styles.avatarText, { color: theme.primary, fontFamily: theme.typography.title }]}>
                      {getInitials(barber.name)}
                    </Text>
                  </View>
                  <View style={styles.barberCopy}>
                    <Text style={[styles.barberName, { color: theme.text, fontFamily: theme.typography.label }]}>
                      {barber.name}
                    </Text>
                    <Text style={[styles.barberMeta, { color: theme.textMuted, fontFamily: theme.typography.body }]}>
                      {barber.specialty}
                    </Text>
                    <Text style={[styles.barberMeta, { color: theme.textMuted, fontFamily: theme.typography.body }]}>
                      {barber.average}
                    </Text>
                  </View>
                  <StatusBadge
                    icon={barber.status === 'break' ? 'pause-circle' : 'check-circle'}
                    label={barber.status}
                    tone={barber.status === 'break' ? 'warning' : 'success'}
                  />
                </View>
              ))}
            </View>
          </SurfaceCard>

          <SurfaceCard tone="success">
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.typography.title }]}>
                Queue intelligence
              </Text>
              <Feather color={theme.success} name="trending-up" size={18} />
            </View>
            <Text style={[styles.intelligenceText, { color: theme.textMuted, fontFamily: theme.typography.body }]}>
              Smart estimates combine active chairs, real service pacing, and booking priority to help you leave at the right moment.
            </Text>
          </SurfaceCard>
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
    gap: 12
  },
  heroBrandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  heroBrandCopy: {
    gap: 2
  },
  heroBrand: {
    fontSize: 16,
    lineHeight: 20
  },
  heroBranch: {
    fontSize: 12,
    lineHeight: 16
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4
  },
  heroStatItem: {
    minWidth: '30%',
    gap: 4
  },
  heroStatValue: {
    fontSize: 20,
    lineHeight: 24
  },
  heroStatLabel: {
    fontSize: 11,
    lineHeight: 15
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22
  },
  branchRow: {
    gap: 12,
    paddingTop: 6
  },
  branchCard: {
    width: 190,
    borderRadius: 24,
    padding: 16,
    gap: 8,
    borderWidth: 1
  },
  branchName: {
    fontSize: 14,
    lineHeight: 19
  },
  branchMeta: {
    fontSize: 12,
    lineHeight: 18
  },
  actionStack: {
    gap: 12
  },
  barberGrid: {
    gap: 12
  },
  barberCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 15
  },
  barberCopy: {
    flex: 1,
    gap: 2
  },
  barberName: {
    fontSize: 14,
    lineHeight: 18
  },
  barberMeta: {
    fontSize: 12,
    lineHeight: 17
  },
  intelligenceText: {
    fontSize: 14,
    lineHeight: 22
  }
});
