export interface Course {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  price: number;
  duration: string;
  location: string;
  maxSeats: number;
  occupiedSeats: number;
  isActive: boolean;
}

export interface RegistrationFormData {
  name: string;
  phone: string;
  email: string;
}

export interface ServiceSection {
  title?: string;
  content: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  icon: 'globe' | 'compass' | 'map' | 'heart';
  details: ServiceSection[];
}

// New Types for Member Hub
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: 'live' | 'academy' | 'course' | 'general';
  link?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  date: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  date: string;
  status: 'pending' | 'approved';
  comments?: Comment[];
}

export type HubView = 'dashboard' | 'vault' | 'academy' | 'square' | 'live' | 'open-chat';
