import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { useClientSession } from '../utils/session';
import { useAppTheme } from '../utils/theme';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'queue', label: 'Queue' },
  { key: 'booking', label: 'Booking' },
  { key: 'alerts', label: 'Alerts' }
];

export default function NotificationsScreen({ navigation }) {
  const { theme } = useAppTheme();
  const { notifications: initialNotifications, markNotificationRead, refreshNotifications } = useClientSession();
  const [previewMode, setPreviewMode] = useState('live');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [items, setItems] = useState(initialNotifications);

  useEffect(() => {
    setItems(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    refreshNotifications().catch(() => {});
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedFilter === 'all') {
      return items;
    }

    return items.filter((item) => item.category === selectedFilter);
  }, [items, selectedFilter]);

  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <ScreenShell
      subtitle="Notification history previews turn-approaching, now-serving, and booking reminder events."
      title="Notifications"
    >
      <StatePreviewSwitcher mode={previewMode} onChange={setPreviewMode} />

      {previewMode === 'loading' ? <PreviewLoadingPanel blocks={[110, 70, 140, 140]} /> : null}

      {previewMode === 'error' ? (
        <ErrorStateCard
          actionLabel="Reconnect inbox"
          description="The notification feed could not be loaded. This is the admin-safe error state for message history."
          onAction={() => setPreviewMode('live')}
          title="Notification sync failed"
        />
      ) : null}

      {previewMode === 'empty' ? (
        <EmptyStateCard
          actionLabel="Book a premium slot"
          description="No notifications yet. Once the user joins a queue or books an appointment, updates will appear here."
          icon="bell-off"
          onAction={() => navigation.navigate('Booking')}
          title="Your inbox is quiet"
        />
      ) : null}

      {previewMode === 'live' ? (
        <>
          <SurfaceCard tone="accent">
            <View style={styles.summaryHeader}>
              <View>
                <Text
                  style={[
                    styles.unreadValue,
                    { color: theme.text, fontFamily: theme.typography.display }
                  ]}
                >
                  {unreadCount}
                </Text>
                <Text
                  style={[
                    styles.unreadLabel,
                    { color: theme.textMuted, fontFamily: theme.typography.body }
                  ]}
                >
                  unread updates waiting for you
                </Text>
              </View>
              <StatusBadge icon="bell" label="Live preview" tone="primary" />
            </View>

            <View style={styles.filterRow}>
              {filters.map((filter) => {
                const isActive = filter.key === selectedFilter;

                return (
                  <Pressable
                    key={filter.key}
                    accessibilityRole="button"
                    onPress={() => setSelectedFilter(filter.key)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isActive ? theme.primary : theme.surface,
                        borderColor: isActive ? theme.primary : theme.border
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterLabel,
                        {
                          color: isActive ? '#FFFFFF' : theme.text,
                          fontFamily: theme.typography.label
                        }
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </SurfaceCard>

          {filteredItems.length === 0 ? (
            <EmptyStateCard
              actionLabel="Show all notifications"
              description="This filter does not have any matching items right now."
              icon="filter"
              onAction={() => setSelectedFilter('all')}
              title="No items in this filter"
            />
          ) : (
            filteredItems.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => {
                  if (!item.read) {
                    markNotificationRead(item.id).catch(() => {});
                  }
                  setItems((currentItems) =>
                    currentItems.map((currentItem) =>
                      currentItem.id === item.id ? { ...currentItem, read: true } : currentItem
                    )
                  );
                }}
              >
                <SurfaceCard style={styles.notificationCard}>
                  <View style={[styles.notificationIcon, { backgroundColor: theme.surfaceElevated }]}>
                    <Feather color={theme.primary} name={item.icon} size={18} />
                  </View>
                  <View style={styles.notificationCopy}>
                    <View style={styles.notificationTop}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          { color: theme.text, fontFamily: theme.typography.label }
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.notificationTime,
                          { color: theme.textMuted, fontFamily: theme.typography.body }
                        ]}
                      >
                        {item.time}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.notificationText,
                        { color: theme.textMuted, fontFamily: theme.typography.body }
                      ]}
                    >
                      {item.message}
                    </Text>
                    <StatusBadge
                      icon={item.read ? 'check-circle' : 'mail'}
                      label={item.read ? 'Read' : 'Unread'}
                      tone={item.read ? 'warning' : 'success'}
                    />
                  </View>
                </SurfaceCard>
              </Pressable>
            ))
          )}

          <ActionButton
            icon="settings"
            label="Open Preferences"
            onPress={() => navigation.navigate('Profile')}
            subtitle="Tune push, SMS, promo, and dark mode settings"
            variant="secondary"
          />
        </>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14
  },
  unreadValue: {
    fontSize: 32,
    lineHeight: 38
  },
  unreadLabel: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1
  },
  filterLabel: {
    fontSize: 12,
    lineHeight: 16
  },
  notificationCard: {
    flexDirection: 'row',
    gap: 12
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationCopy: {
    flex: 1,
    gap: 8
  },
  notificationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20
  },
  notificationTime: {
    fontSize: 11,
    lineHeight: 16
  },
  notificationText: {
    fontSize: 13,
    lineHeight: 20
  }
});
