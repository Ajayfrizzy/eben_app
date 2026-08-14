export type Role =
  | "student"
  | "content_creator"
  | "moderator"
  | "programme_manager"
  | "admin"
  | "super_admin";
export interface Profile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  country?: string;
  city?: string;
  institution?: string;
  programme?: string;
  studyLevel?: string;
  biography?: string;
  interests: string[];
  skills: string[];
  onboardingComplete: boolean;
}
export interface Channel {
  id: string;
  name: string;
  description: string;
  icon: string;
}
export interface Post {
  id: string;
  channelId: string;
  author: Pick<Profile, "id" | "fullName" | "avatarUrl">;
  body: string;
  imageUrl?: string;
  createdAt: string;
  reactionCount: number;
  commentCount: number;
  liked?: boolean;
  bookmarked?: boolean;
  pinned?: boolean;
}
export type ResourceType =
  "article" | "document" | "video" | "audio" | "external_link";
export interface Resource {
  id: string;
  title: string;
  summary: string;
  type: ResourceType;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  url?: string;
  featured?: boolean;
  bookmarked?: boolean;
}
export interface Event {
  id: string;
  title: string;
  summary: string;
  format: "online" | "physical" | "hybrid";
  startsAt: string;
  endsAt: string;
  venue?: string;
  organiser: string;
  capacity?: number;
  attendeeCount: number;
  rsvped?: boolean;
  imageUrl?: string;
}
export type OpportunityType =
  | "scholarship"
  | "internship"
  | "competition"
  | "hackathon"
  | "fellowship"
  | "grant"
  | "conference"
  | "volunteering";
export interface Opportunity {
  id: string;
  title: string;
  summary: string;
  type: OpportunityType;
  organisation: string;
  location: string;
  deadline: string;
  applicationUrl: string;
  verified: boolean;
  saved?: boolean;
}
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  targetUrl?: string;
  readAt?: string;
  createdAt: string;
}
