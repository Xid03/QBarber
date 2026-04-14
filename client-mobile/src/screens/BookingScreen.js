import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { barbers, bookingSetup, formatCurrency, getInitials } from '../utils/mockData';
import { useAppTheme } from '../utils/theme';

export default function BookingScreen({ navigation }) {
  const { theme } = useAppTheme();
  const [previewMode, setPreviewMode] = useState('live');
  const [selectedServiceId, setSelectedServiceId] = useState(bookingSetup.serviceTypes[0].id);
  const [selectedDateId, setSelectedDateId] = useState(bookingSetup.dates[1].id);
  const [selectedSlotId, setSelectedSlotId] = useState('11:30');
  const [selectedBarberId, setSelectedBarberId] = useState('nora');
  const [selectedPaymentId, setSelectedPaymentId] = useState(bookingSetup.paymentMethods[0].id);

  const selectedService = useMemo(
    () =>
      bookingSetup.serviceTypes.find((service) => service.id === selectedServiceId) ||
      bookingSetup.serviceTypes[0],
    [selectedServiceId]
  );
  const selectedDate = useMemo(
    () => bookingSetup.dates.find((date) => date.id === selectedDateId) || bookingSetup.dates[0],
    [selectedDateId]
  );
  const selectedSlot = useMemo(
    () => bookingSetup.timeSlots.find((slot) => slot.id === selectedSlotId) || null,
    [selectedSlotId]
  );
  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber.id === selectedBarberId) || barbers[1],
    [selectedBarberId]
  );
  const selectedPayment = useMemo(
    () =>
      bookingSetup.paymentMethods.find((method) => method.id === selectedPaymentId) ||
      bookingSetup.paymentMethods[0],
    [selectedPaymentId]
  );

  const canContinue = Boolean(selectedSlot);

  const footer = (
    <ActionButton
      disabled={!canContinue}
      icon="arrow-right"
      label="Review Premium Booking"
      onPress={() =>
        navigation.navigate('BookingConfirmation', {
          barber: selectedBarber.name,
          bookingId: bookingSetup.confirmation.bookingId,
          date: selectedDate.meta,
          service: selectedService.name,
          time: selectedSlot?.label
        })
      }
      subtitle={selectedSlot ? `${selectedDate.meta} at ${selectedSlot.label}` : 'Choose a time slot'}
    />
  );

  return (
    <ScreenShell
      stickyFooter={previewMode === 'live' ? footer : null}
      subtitle="Premium booking mockup with time grids, barber selection, fee summary, and payment choice."
      title="Book Premium Slot"
    >
      <StatePreviewSwitcher mode={previewMode} onChange={setPreviewMode} />

      {previewMode === 'loading' ? <PreviewLoadingPanel blocks={[130, 180, 160, 110]} /> : null}

      {previewMode === 'empty' ? (
        <EmptyStateCard
          actionLabel="Try another day"
          description="No premium slots are available on the selected day. This is the empty state for fully booked calendars."
          icon="calendar"
          onAction={() => setPreviewMode('live')}
          title="No premium slots left"
        />
      ) : null}

      {previewMode === 'error' ? (
        <ErrorStateCard
          actionLabel="Reload slots"
          description="The booking calendar failed to sync. Later this will map cleanly to slot-fetch errors from the backend."
          onAction={() => setPreviewMode('live')}
          title="Calendar sync issue"
        />
      ) : null}

      {previewMode === 'live' ? (
        <>
          <SurfaceCard>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Choose your service
            </Text>
            <ScrollView
              contentContainerStyle={styles.selectionRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {bookingSetup.serviceTypes.map((service) => {
                const isSelected = service.id === selectedServiceId;

                return (
                  <Pressable
                    key={service.id}
                    accessibilityRole="button"
                    onPress={() => setSelectedServiceId(service.id)}
                    style={[
                      styles.serviceCard,
                      {
                        backgroundColor: isSelected ? theme.surfaceStrong : theme.surfaceElevated,
                        borderColor: isSelected ? theme.primary : theme.border
                      }
                    ]}
                  >
                    <StatusBadge icon="star" label={service.badge} tone="warning" />
                    <Text
                      style={[
                        styles.serviceName,
                        { color: theme.text, fontFamily: theme.typography.title }
                      ]}
                    >
                      {service.name}
                    </Text>
                    <Text
                      style={[
                        styles.serviceMeta,
                        { color: theme.textMuted, fontFamily: theme.typography.body }
                      ]}
                    >
                      {service.duration}
                    </Text>
                    <Text
                      style={[
                        styles.servicePrice,
                        { color: theme.primary, fontFamily: theme.typography.label }
                      ]}
                    >
                      {formatCurrency(service.price)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </SurfaceCard>

          <SurfaceCard tone="accent">
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Pick a date
            </Text>
            <ScrollView
              contentContainerStyle={styles.selectionRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {bookingSetup.dates.map((date) => {
                const isSelected = date.id === selectedDateId;

                return (
                  <Pressable
                    key={date.id}
                    accessibilityRole="button"
                    onPress={() => setSelectedDateId(date.id)}
                    style={[
                      styles.dateCard,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateLabel,
                        {
                          color: isSelected ? '#FFFFFF' : theme.text,
                          fontFamily: theme.typography.label
                        }
                      ]}
                    >
                      {date.label}
                    </Text>
                    <Text
                      style={[
                        styles.dateMeta,
                        {
                          color: isSelected ? 'rgba(255,255,255,0.74)' : theme.textMuted,
                          fontFamily: theme.typography.body
                        }
                      ]}
                    >
                      {date.meta}
                    </Text>
                    <Text
                      style={[
                        styles.dateSlots,
                        {
                          color: isSelected ? '#FFFFFF' : theme.primary,
                          fontFamily: theme.typography.label
                        }
                      ]}
                    >
                      {date.slotsLeft} slots left
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </SurfaceCard>

          <SurfaceCard>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, fontFamily: theme.typography.title }
                ]}
              >
                Available times
              </Text>
              <StatusBadge icon="zap" label="Booking fee applies" tone="primary" />
            </View>
            <View style={styles.slotGrid}>
              {bookingSetup.timeSlots.map((slot) => {
                const isSelected = slot.id === selectedSlotId;

                return (
                  <Pressable
                    key={slot.id}
                    accessibilityRole="button"
                    disabled={!slot.available}
                    onPress={() => setSelectedSlotId(slot.id)}
                    style={[
                      styles.slotChip,
                      {
                        backgroundColor: !slot.available
                          ? theme.surfaceElevated
                          : isSelected
                            ? theme.primary
                            : theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                        opacity: slot.available ? 1 : 0.45
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotLabel,
                        {
                          color: isSelected ? '#FFFFFF' : theme.text,
                          fontFamily: theme.typography.label
                        }
                      ]}
                    >
                      {slot.label}
                    </Text>
                    {slot.featured ? (
                      <Text
                        style={[
                          styles.slotTag,
                          {
                            color: isSelected ? 'rgba(255,255,255,0.74)' : theme.success,
                            fontFamily: theme.typography.body
                          }
                        ]}
                      >
                        best pick
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </SurfaceCard>

          <SurfaceCard tone="accent">
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Choose your barber
            </Text>
            <View style={styles.barberStack}>
              {barbers
                .filter((barber) => barber.status !== 'break')
                .map((barber) => {
                  const isSelected = barber.id === selectedBarberId;

                  return (
                    <Pressable
                      key={barber.id}
                      accessibilityRole="button"
                      onPress={() => setSelectedBarberId(barber.id)}
                      style={[
                        styles.barberCard,
                        {
                          backgroundColor: isSelected ? theme.surfaceStrong : theme.surface,
                          borderColor: isSelected ? theme.primary : theme.border
                        }
                      ]}
                    >
                      <View style={[styles.avatar, { backgroundColor: theme.surfaceElevated }]}>
                        <Text
                          style={[
                            styles.avatarText,
                            { color: theme.primary, fontFamily: theme.typography.title }
                          ]}
                        >
                          {getInitials(barber.name)}
                        </Text>
                      </View>
                      <View style={styles.barberCopy}>
                        <Text
                          style={[
                            styles.barberName,
                            { color: theme.text, fontFamily: theme.typography.label }
                          ]}
                        >
                          {barber.name}
                        </Text>
                        <Text
                          style={[
                            styles.barberMeta,
                            { color: theme.textMuted, fontFamily: theme.typography.body }
                          ]}
                        >
                          {barber.specialty} • {barber.average}
                        </Text>
                      </View>
                      <StatusBadge icon="star" label={barber.rating} tone="success" />
                    </Pressable>
                  );
                })}
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Payment method
            </Text>
            <View style={styles.paymentStack}>
              {bookingSetup.paymentMethods.map((method) => {
                const isSelected = method.id === selectedPaymentId;

                return (
                  <Pressable
                    key={method.id}
                    accessibilityRole="button"
                    onPress={() => setSelectedPaymentId(method.id)}
                    style={[
                      styles.paymentCard,
                      {
                        backgroundColor: isSelected ? theme.surfaceStrong : theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border
                      }
                    ]}
                  >
                    <View style={styles.paymentCopy}>
                      <Text
                        style={[
                          styles.paymentLabel,
                          { color: theme.text, fontFamily: theme.typography.label }
                        ]}
                      >
                        {method.label}
                      </Text>
                      <Text
                        style={[
                          styles.paymentMeta,
                          { color: theme.textMuted, fontFamily: theme.typography.body }
                        ]}
                      >
                        {method.note}
                      </Text>
                    </View>
                    <StatusBadge icon="check" label={isSelected ? 'Selected' : 'Tap to use'} tone="primary" />
                  </Pressable>
                );
              })}
            </View>
          </SurfaceCard>

          <SurfaceCard tone="success" style={styles.summaryCard}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: theme.typography.title }
              ]}
            >
              Booking summary
            </Text>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.textMuted, fontFamily: theme.typography.body }
                ]}
              >
                Service
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.text, fontFamily: theme.typography.label }
                ]}
              >
                {selectedService.name}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.textMuted, fontFamily: theme.typography.body }
                ]}
              >
                Barber
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.text, fontFamily: theme.typography.label }
                ]}
              >
                {selectedBarber.name}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.textMuted, fontFamily: theme.typography.body }
                ]}
              >
                Booking fee
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.text, fontFamily: theme.typography.label }
                ]}
              >
                {formatCurrency(bookingSetup.summary.bookingFee)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.textMuted, fontFamily: theme.typography.body }
                ]}
              >
                Pay with
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.text, fontFamily: theme.typography.label }
                ]}
              >
                {selectedPayment.label}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text
                style={[
                  styles.summaryTotalLabel,
                  { color: theme.text, fontFamily: theme.typography.title }
                ]}
              >
                Total
              </Text>
              <Text
                style={[
                  styles.summaryTotalValue,
                  { color: theme.primary, fontFamily: theme.typography.display }
                ]}
              >
                {formatCurrency(selectedService.price + bookingSetup.summary.bookingFee)}
              </Text>
            </View>
          </SurfaceCard>
        </>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
  selectionRow: {
    gap: 12,
    paddingTop: 4
  },
  serviceCard: {
    width: 220,
    borderRadius: 24,
    padding: 16,
    gap: 8,
    borderWidth: 1
  },
  serviceName: {
    fontSize: 17,
    lineHeight: 22
  },
  serviceMeta: {
    fontSize: 12,
    lineHeight: 18
  },
  servicePrice: {
    fontSize: 15,
    lineHeight: 20
  },
  dateCard: {
    width: 138,
    borderRadius: 24,
    padding: 16,
    gap: 6,
    borderWidth: 1
  },
  dateLabel: {
    fontSize: 14,
    lineHeight: 18
  },
  dateMeta: {
    fontSize: 12,
    lineHeight: 18
  },
  dateSlots: {
    fontSize: 12,
    lineHeight: 18
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  slotChip: {
    width: '30%',
    minHeight: 76,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 10
  },
  slotLabel: {
    fontSize: 14,
    lineHeight: 18
  },
  slotTag: {
    fontSize: 11,
    lineHeight: 15
  },
  barberStack: {
    gap: 12
  },
  barberCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    lineHeight: 18
  },
  paymentStack: {
    gap: 12
  },
  paymentCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  paymentCopy: {
    flex: 1,
    gap: 2
  },
  paymentLabel: {
    fontSize: 14,
    lineHeight: 18
  },
  paymentMeta: {
    fontSize: 12,
    lineHeight: 18
  },
  summaryCard: {
    marginBottom: 10
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  summaryLabel: {
    fontSize: 13,
    lineHeight: 18
  },
  summaryValue: {
    fontSize: 13,
    lineHeight: 18
  },
  summaryTotal: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(37, 99, 235, 0.18)'
  },
  summaryTotalLabel: {
    fontSize: 18,
    lineHeight: 23
  },
  summaryTotalValue: {
    fontSize: 24,
    lineHeight: 28
  }
});
