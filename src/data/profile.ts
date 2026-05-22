export interface SocialLink {
  label: string;
  href: string;
  /** astro-icon name, e.g. "simple-icons:linkedin" */
  icon: string;
  handle?: string;
}

export interface Profile {
  name: string;
  title: string;
  affiliation: string;
  affiliationUrl: string;
  /** one-line summary used in the hero + meta description */
  tagline: string;
  /** longer bio, one entry per paragraph */
  bio: string[];
  interests: string[];
  /** leave empty to hide the email link */
  email: string;
  socials: SocialLink[];
}

export const profile: Profile = {
  name: 'Sheida Sheikheh',
  title: 'PhD Candidate · Energy & Petroleum Engineering',
  affiliation: 'University of Wyoming',
  affiliationUrl: 'https://www.uwyo.edu/',
  tagline:
    'PhD candidate studying how the subsurface can safely store hydrogen — from trona and salt caverns to the geomechanics that keep them stable.',
  bio: [
    'Sheida Sheikheh is a PhD candidate in the Department of Energy and Petroleum Engineering at the University of Wyoming. Her research asks a deceptively simple question: where, and how, can we safely store hydrogen underground at the scale a clean-energy economy will demand?',
    "Working at the intersection of reservoir engineering, geomechanics, and numerical simulation, she studies engineered caverns in evaporite formations — the bedded salt and trona of Wyoming's Green River Basin — alongside depleted reservoirs and aquifers. Recent work compares salt and trona caverns for hydrogen storage, screens candidate sites across Wyoming, and reviews the broader potential of evaporite beds for storage caverns.",
    'She is also drawn to the bigger picture: how subsurface storage fits into a mid-century net-zero pathway for Wyoming and the wider region, and what it takes — technically and economically — to turn deep geology into reliable, large-scale energy storage.',
  ],
  interests: [
    'Hydrogen Storage',
    'Reservoir Geomechanics',
    'Reservoir Engineering',
    'Reservoir Simulation',
  ],
  // No public email confirmed; leave blank to hide the link (verified domain is uwyo.edu).
  email: '',
  socials: [
    {
      label: 'Google Scholar',
      href: 'https://scholar.google.com/citations?user=DEE1RU8AAAAJ&hl=en',
      icon: 'simple-icons:googlescholar',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/sheida-sheikheh',
      icon: 'simple-icons:linkedin',
    },
    {
      label: 'ResearchGate',
      href: 'https://www.researchgate.net/profile/Sheida-Sheikheh',
      icon: 'simple-icons:researchgate',
    },
  ],
};

/** Socials plus an optional email link, ready to iterate over. */
export const socialLinks: SocialLink[] = [
  ...profile.socials,
  ...(profile.email
    ? [{ label: 'Email', href: `mailto:${profile.email}`, icon: 'lucide:mail' }]
    : []),
];
