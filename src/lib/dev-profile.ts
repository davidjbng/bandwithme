export type DevBand = {
  name: string;
  role?: string;
};

export type DevProfile = {
  name: string;
  pictureUrl: string;
  instruments: string[];
  bands: DevBand[];
};

const defaultProfile: DevProfile = {
  name: 'Mina Muster',
  pictureUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=faces',
  instruments: ['Vocals', 'Guitar'],
  bands: [
    { name: 'The Local Jams', role: 'Vocals' },
    { name: 'Basement Session', role: 'Guitar' },
  ],
};

function parseList(value: string | undefined, fallback: string[]) {
  if (!value?.trim()) {
    return fallback;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBands(value: string | undefined, fallback: DevBand[]) {
  if (!value?.trim()) {
    return fallback;
  }

  const bands = value
    .split(',')
    .reduce<DevBand[]>((currentBands, entry) => {
      const [name, role] = entry.split(':').map((part) => part.trim());

      if (!name) {
        return currentBands;
      }

      currentBands.push(role ? { name, role } : { name });
      return currentBands;
    }, []);

  return bands.length > 0 ? bands : fallback;
}

// Temporary dev-only profile seed. Values are public and bundled into the client.
export const isDevProfileEnabled = process.env.EXPO_PUBLIC_ENABLE_DEV_PROFILE === 'true';

export const devProfile: DevProfile = {
  name: process.env.EXPO_PUBLIC_DEV_PROFILE_NAME?.trim() || defaultProfile.name,
  pictureUrl: process.env.EXPO_PUBLIC_DEV_PROFILE_PICTURE_URL?.trim() || defaultProfile.pictureUrl,
  instruments: parseList(process.env.EXPO_PUBLIC_DEV_PROFILE_INSTRUMENTS, defaultProfile.instruments),
  bands: parseBands(process.env.EXPO_PUBLIC_DEV_PROFILE_BANDS, defaultProfile.bands),
};
