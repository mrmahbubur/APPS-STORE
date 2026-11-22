import React from 'react';
import {
  Tv,
  Monitor,
  Smartphone,
  Lock,
  Cast,
  Cpu,
  Cloud,
  Gamepad2,
  Server,
  ShieldCheck,
} from 'lucide-react';
import type { SponsorAdLink, SponsorIconKey, StorePlatformFilter } from '../types';
import { getSponsorIconKey } from '../data/catalog';

const SPONSOR_ICON_COMPONENTS: Record<SponsorIconKey, React.FC<{ className?: string }>> = {
  tv: Tv,
  monitor: Monitor,
  smartphone: Smartphone,
  lock: Lock,
  cast: Cast,
  cpu: Cpu,
  cloud: Cloud,
  gamepad: Gamepad2,
  server: Server,
  shield: ShieldCheck,
};

export function getSponsorIconComponent(
  sponsor: Pick<SponsorAdLink, 'zoneId' | 'platformHint' | 'category'>,
  devicePlatform?: StorePlatformFilter | string
): React.FC<{ className?: string }> {
  const iconKey = getSponsorIconKey(sponsor, devicePlatform);
  return SPONSOR_ICON_COMPONENTS[iconKey] || ShieldCheck;
}

interface SponsorIconProps {
  sponsor: Pick<SponsorAdLink, 'zoneId' | 'platformHint' | 'category'>;
  devicePlatform?: StorePlatformFilter | string;
  className?: string;
}

export const SponsorIcon: React.FC<SponsorIconProps> = ({
  sponsor,
  devicePlatform,
  className = 'w-4 h-4',
}) => {
  const Icon = getSponsorIconComponent(sponsor, devicePlatform);
  return <Icon className={className} aria-hidden="true" />;
};
