export type Channel = {
  id: string;
  name: string;
  description?: string;
  type?: 'public' | 'private';
  isPrivate?: boolean;
  isMember?: boolean;
  memberCount?: number;
  creatorId?: string;
  createdBy?: {
    id: string;
    fullName: string;
  };
  createdAt?: string;
  updatedAt?: string;
};
