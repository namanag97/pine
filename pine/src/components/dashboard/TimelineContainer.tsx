import React from 'react';
import { TimeSlot as TimeSlotType } from '../../types';
import { TimelineView } from '../ui/TimelineView';

interface TimelineContainerProps {
  timeSlots: TimeSlotType[];
  onTimeSlotPress: (timeSlot: TimeSlotType) => void;
  currentTimeSlot?: TimeSlotType;
  maxSlots?: number;
}

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  timeSlots,
  onTimeSlotPress,
  currentTimeSlot,
  maxSlots = 48 // Show full day (48 thirty-minute slots)
}) => {
  const displaySlots = timeSlots.slice(0, maxSlots);

  return (
    <TimelineView
      timeSlots={displaySlots}
      onTimeSlotPress={onTimeSlotPress}
      currentTimeSlot={currentTimeSlot}
    />
  );
};