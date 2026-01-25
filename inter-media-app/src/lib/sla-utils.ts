// SLA Configuration untuk Inter Media Service Center
export const SLA_CONFIG = {
  // SLA berdasarkan device type (dalam jam)
  deviceSLA: {
    printer: 48,      // 2 hari
    fotocopy: 72,     // 3 hari  
    komputer: 96,     // 4 hari
    lainnya: 48       // 2 hari
  },
  
  // Priority multiplier
  priorityMultiplier: {
    urgent: 0.5,      // 50% lebih cepat
    high: 0.75,       // 25% lebih cepat
    normal: 1.0,      // Standard
    low: 1.5          // 50% lebih lama
  }
};

export function calculateSLATarget(deviceType: string, priority: string = 'normal', createdAt: Date = new Date()): Date {
  const baseSLA = SLA_CONFIG.deviceSLA[deviceType as keyof typeof SLA_CONFIG.deviceSLA] || 48;
  const multiplier = SLA_CONFIG.priorityMultiplier[priority as keyof typeof SLA_CONFIG.priorityMultiplier] || 1.0;
  
  const slaHours = baseSLA * multiplier;
  const targetDate = new Date(createdAt);
  targetDate.setHours(targetDate.getHours() + slaHours);
  
  return targetDate;
}

export function getSLAStatus(slaTarget: Date, currentDate: Date = new Date()): string {
  const hoursRemaining = (slaTarget.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursRemaining < 0) {
    return 'overdue';
  } else if (hoursRemaining <= 12) { // At risk jika kurang dari 12 jam
    return 'at-risk';
  } else {
    return 'on-time';
  }
}

export function formatSLATime(slaTarget: Date, currentDate: Date = new Date()): string {
  const hoursRemaining = (slaTarget.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursRemaining < 0) {
    const overdue = Math.abs(hoursRemaining);
    if (overdue < 24) {
      return `Terlambat ${Math.floor(overdue)} jam`;
    } else {
      return `Terlambat ${Math.floor(overdue / 24)} hari`;
    }
  } else {
    if (hoursRemaining < 24) {
      return `${Math.floor(hoursRemaining)} jam lagi`;
    } else {
      return `${Math.floor(hoursRemaining / 24)} hari lagi`;
    }
  }
}
