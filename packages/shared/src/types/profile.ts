export interface SocialLink {
  platform: 'github' | 'linkedin' | 'x' | 'email' | 'website';
  url: string;
  label: string;
}

export interface Profile {
  id: string;
  fullName: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  cvPdfUrl?: string;
  location: string;
  email: string;
  socialLinks: SocialLink[];
  skills: {
    category: string;
    items: string[];
  }[];
  updatedAt: string;
}

export type UpdateProfileInput = Partial<Omit<Profile, 'id' | 'updatedAt'>>;
