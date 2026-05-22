export interface Publication {
  title: string;
  authors: string;
  venue: string;
  year: number;
  type: 'Journal' | 'Conference' | 'Report';
  /** Best available link (DOI / publisher / repository / Scholar). */
  url: string;
  /** Optional one-line note about the work. */
  note?: string;
}

const SCHOLAR =
  'https://scholar.google.com/citations?user=DEE1RU8AAAAJ&hl=en';

/** Sheida's publications, newest first. Metrics live on Google Scholar. */
export const publications: Publication[] = [
  {
    title:
      'A review of evaporite beds potential for storage caverns: uncovering new opportunities',
    authors: 'Sheikheh, S., et al.',
    venue: 'Applied Sciences',
    year: 2025,
    type: 'Journal',
    url: SCHOLAR,
    note: 'Survey of bedded salt and trona as host rock for engineered storage caverns.',
  },
  {
    title: 'Underground Hydrogen Storage Site Selection in Wyoming',
    authors: 'Sheikheh, S., et al.',
    venue: 'SPE Energy Transition Symposium',
    year: 2024,
    type: 'Conference',
    url: SCHOLAR,
    note: 'Screening framework for candidate storage sites across the state.',
  },
  {
    title:
      'A Mid-Century Net-Zero Scenario for the State of Wyoming and its Economic Impacts',
    authors: 'Sheikheh, S., et al.',
    venue: 'University of Wyoming',
    year: 2024,
    type: 'Report',
    url: SCHOLAR,
    note: 'Pathway analysis for deep decarbonization and its regional economics.',
  },
  {
    title: 'Comparison of Salt and Trona Caverns for Hydrogen Storage',
    authors: 'Sheikheh, S., Rabiei, M., Rasouli, V.',
    venue: 'SMRI Spring 2023 Technical Conference',
    year: 2023,
    type: 'Conference',
    url: 'https://www.researchgate.net/publication/371606410_Comparison_of_Salt_and_Trona_Caverns_for_Hydrogen_Storage',
    note: 'Side-by-side suitability of salt vs. trona host rock for H2 caverns.',
  },
];

export const scholarUrl = SCHOLAR;
