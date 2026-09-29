# Eben Institute MVP Mobile App — Build Prompt

You are a senior product engineer and solution architect. Build a production-oriented MVP for **Eben Institute**, an African student education and community organisation whose vision is to raise daring students capable of solving real-world problems in Africa.

The application must transform the current community-platform prototype into a real mobile product centred on three value loops:

1. Students connect through moderated communities.
2. Students learn through a curated digital library.
3. Students discover and participate in events and verified opportunities.

Do not build the entire long-term ecosystem in the first release. The MVP must be focused, secure, testable, and extensible.

## 1. Required Technology Stack

### Mobile application

- React Native with Expo
- TypeScript
- Expo Router
- TanStack Query for server state
- Zustand for lightweight application state
- React Hook Form and Zod for forms and validation
- NativeWind or a structured React Native design-token system
- Expo SecureStore for session-related secure local storage
- Expo Notifications for push notifications
- Sentry for crash and error monitoring

### Backend

- Supabase Authentication
- Supabase PostgreSQL
- Supabase Storage
- Supabase Realtime only where it adds clear value
- Supabase Edge Functions for privileged or asynchronous operations
- PostgreSQL Row-Level Security on every protected table
- Database migrations committed to source control

### Supporting services

- Resend or Postmark for transactional email
- Expo Push Service initially
- PostHog or Firebase Analytics
- GitHub Actions for linting, type checking, tests, and controlled deployment
- EAS Build for Android and future iOS builds

## 2. Repository Structure

Use a monorepo:

```text
apps/
  mobile/
packages/
  ui/
  types/
  validation/
  config/
supabase/
  migrations/
  functions/
  seed.sql
docs/
```

Inside the mobile application, use feature-oriented modules:

```text
src/features/
  auth/
  onboarding/
  profiles/
  home/
  community/
  library/
  events/
  opportunities/
  notifications/
  moderation/
```

Do not place direct Supabase calls throughout UI components. Create typed repositories or service modules for each domain.

## 3. Brand and User Experience Direction

Adapt the supplied dark community-platform concept into an Eben Institute identity.

The interface should feel:

- energetic;
- credible;
- youthful without appearing childish;
- African and community-oriented without relying on stereotypes;
- accessible on small Android screens;
- usable on low or unstable bandwidth.

Use a dark navy foundation with a restrained set of vibrant accents such as coral, teal, amber, and violet. Define reusable tokens for colour, spacing, typography, radius, elevation, and interaction states.

Build proper loading, skeleton, empty, validation, success, error, and offline states for all primary screens.

## 4. User Roles

Implement these roles:

- `student`
- `content_creator`
- `moderator`
- `programme_manager`

Permissions must be enforced in the database and server-side boundaries, not only by hiding buttons.

## 5. Authentication and Onboarding

Build:

- Welcome and institutional introduction screens
- Sign up with email and password
- Email verification
- Sign in
- Forgot-password and password-reset flows
- Persistent session handling
- Sign out
- Terms and privacy consent
- Account settings
- Account deletion request

Student onboarding must collect:

- full name;
- profile image;
- country;
- state or city;
- institution;
- faculty or department;
- programme;
- study level;
- interests;
- skills;
- optional biography;
- optional portfolio or professional links.

Allow users to edit their profiles and control visibility for selected fields.

## 6. Mobile Navigation

Use bottom tabs:

1. Home
2. Community
3. Library
4. Opportunities
5. Profile

Events may be accessible from Home and a dedicated stack screen. Notifications should be available from the application header.

## 7. Home Module

Build a personalised home screen containing:

- institutional announcement or campaign banner;
- featured community post;
- featured learning resources;
- upcoming events;
- selected opportunities;
- quick actions;
- pull-to-refresh;
- pagination where relevant.

## 8. Community Module

Implement a moderated, feed-based community rather than full private instant messaging.

Required capabilities:

- Predefined channels
- Channel list
- Channel feed
- Text posts
- Optional image attachment
- Create, edit, and delete own post
- Comments
- Reactions or likes
- Save/bookmark post
- Pinned posts
- Report post or comment
- Moderation status
- Realtime updates for new posts and comments on active screens only

Suggested seeded channels:

- General
- Introductions
- Announcements
- Academics
- Entrepreneurship
- Financial Literacy
- STEM and Innovation
- African Heritage
- Resources
- Opportunities

Do not implement direct messages or group chat in the MVP.

## 9. Digital Library Module

Support these resource types:

- article;
- PDF/document;
- video;
- audio/podcast;
- external link.

Build:

- library landing page;
- featured resources;
- latest resources;
- categories and tags;
- search;
- filter and sort;
- resource detail screen;
- document or media viewer where practical;
- bookmark resource;
- view tracking;
- author attribution;
- publish date;
- related resources.

Suggested categories:

- Academic Development
- Entrepreneurship
- Financial Literacy
- Digital Skills
- STEM
- Career Development
- Leadership
- African Heritage

For restricted files, use private Supabase Storage buckets and short-lived signed URLs. Add visible ownership and attribution information. Do not claim that screenshots or copying can be completely prevented.

## 10. Events Module

Build:

- upcoming and past event lists;
- event details;
- categories;
- online, physical, and hybrid formats;
- date and time;
- venue or online link;
- organiser;
- banner;
- capacity;
- RSVP;
- cancel RSVP;
- attendance count;
- add-to-calendar action;
- reminder notifications.

## 11. Opportunities Module

Support:

- scholarships;
- internships;
- competitions;
- hackathons;
- fellowships;
- grants;
- conferences;
- volunteering.

Build:

- opportunity list;
- search and filters;
- opportunity details;
- eligibility;
- host organisation;
- location or remote status;
- deadline;
- external application link;
- verified/reviewed indicator;
- save opportunity;
- deadline reminder.

The MVP must link users to external application websites. Do not build native scholarship or opportunity application workflows yet.

## 12. Notifications

Build:

- in-app notification inbox;
- read/unread status;
- push notifications;
- deep links to relevant screens;
- user preferences for non-essential categories.

Trigger notifications for:

- important announcements;
- comments or replies;
- selected reactions if enabled;
- event reminders;
- opportunity deadline reminders;
- new featured resources;
- moderation outcomes.

Store the notification record before attempting push delivery.

## 13. Database Design

Create migrations for at least:

```text
profiles
institutions
interests
user_interests
roles
user_roles
channels
posts
post_media
comments
reactions
bookmarks
content_reports
moderation_actions
resources
resource_categories
resource_tags
resource_tag_links
resource_views
events
event_rsvps
opportunities
opportunity_categories
opportunity_bookmarks
notifications
notification_preferences
push_tokens
audit_logs
app_settings
```

Requirements:

- UUID primary keys
- UTC timestamps
- `created_at` and `updated_at`
- appropriate foreign keys and uniqueness constraints
- soft deletion where moderation or recovery requires it
- indexes for feed order, deadlines, published state, categories, and search
- cursor pagination for large feeds and lists
- full-text or trigram search for resources and opportunities

Generate shared TypeScript database types.

## 14. Row-Level Security

Create and test explicit RLS policies.

Minimum policy expectations:

- Users may read only published or otherwise permitted content.
- Users may update only their own profiles.
- Users may create posts only in channels available to them.
- Users may update or remove only their own contributions, subject to moderation rules.
- Users may create and manage only their own bookmarks, reactions, RSVPs, and notification preferences.
- Moderators may perform only authorised moderation actions.
- Programme managers may manage event-related data only where authorised.
- Role assignment and privileged actions must not be performed directly from an untrusted client.
- Service-role credentials must never appear in the mobile bundle.

Create automated policy tests that attempt unauthorised reads and writes.

## 15. Edge Functions

Use Edge Functions for:

- notification fan-out;
- transactional email;
- scheduled event reminders;
- scheduled opportunity reminders;
- account deletion orchestration;
- moderation outcomes;
- future third-party webhooks.

Every function must validate authentication, role, payload schema, rate limits, and idempotency where appropriate.

## 16. Low-Bandwidth and Offline Behaviour

Implement:

- cached recent content;
- pull-to-refresh;
- connection-state awareness;
- safe retry controls;
- optimistic updates only for reactions, saves, and RSVP toggles;
- image compression before upload;
- responsive image sizes;
- lazy-loading;
- no media autoplay;
- paginated lists;
- clear offline and stale-data indicators.

Do not implement full offline document downloads in the MVP.

## 17. Security and Privacy

Implement:

- secure session handling;
- email verification before contribution;
- strict RLS;
- server-side validation;
- file type and size validation;
- rate limits for authentication, posts, comments, and reports;
- private storage for restricted content;
- expiring signed URLs;
- content reporting;
- privacy controls;
- account deletion workflow;
- environment separation;
- secret scanning;
- logs that avoid sensitive personal data.

Prepare the architecture for block and mute capabilities, even if they are not all included in the first sprint.

## 18. Analytics

Track documented events for:

- sign-up;
- onboarding completion;
- login;
- channel viewed;
- post created;
- comment created;
- reaction added;
- resource opened;
- resource bookmarked;
- event viewed;
- RSVP created or cancelled;
- opportunity viewed;
- opportunity saved;
- external application link opened;
- notification opened.

Create an analytics event dictionary. Do not send sensitive profile data as analytics properties.

## 19. Testing

Create:

- unit tests for validation, helpers, permission logic, and repositories;
- component tests for primary forms and states;
- integration tests for authentication, storage, posts, reporting, RSVP, and notifications;
- RLS policy tests;
- end-to-end tests for the principal user journeys;
- manual test checklist for low-end Android devices and slow networks.

Critical end-to-end journeys:

1. Register, verify, complete profile, and reach Home.
2. Open a channel, publish a post, comment, react, and report content.
3. Search the library, open a resource, and bookmark it.
4. Open an event, RSVP, cancel, and receive a reminder record.
5. Find an opportunity, save it, and open its external application link.
6. Moderator reviews and resolves a report.

## 20. CI/CD and Environments

Create separate configuration for:

- local development;
- shared development;
- staging/UAT;
- production.

Configure:

- linting;
- formatting;
- TypeScript checks;
- tests;
- migration validation;
- preview builds;
- EAS development, preview, and production profiles;
- production error monitoring;
- staged Android rollout.

Do not commit secrets.

## 21. Seed Data

Provide realistic seed data for:

- institutions;
- interests;
- channels;
- posts and comments;
- library categories and resources;
- events;
- opportunities;
- notifications.

Seed data must be clearly separated from production data.

## 22. MVP Exclusions

Do not build these features now:

- direct messages;
- group chat;
- live video classes;
- mentor matching and booking;
- native scholarship applications;
- quizzes and games;
- points, badges, and leaderboards;
- payments, subscriptions, donations, or refunds;
- automated certificates;
- full offline file downloads;
- advanced plagiarism detection;
- guaranteed screenshot prevention;
- blockchain wallets, tokens, smart contracts, or provenance;
- partner self-service portals;
- multilingual application UI;
- AI tutoring or recommendation engines.

Design boundaries and interfaces so these can be added later without distorting the MVP.

## 23. Required Output Sequence

Work in this order:

1. Explain the proposed architecture and key product decisions.
2. Produce the monorepo folder structure.
3. Produce the database schema and migrations.
4. Produce RLS policies and policy tests.
5. Build authentication and onboarding.
6. Build the mobile design system and navigation shell.
7. Build Home, Community, Library, Events, Opportunities, Notifications, and Profile.
8. Add Edge Functions and scheduled jobs.
9. Add analytics, monitoring, tests, seed data, and documentation.
10. Run lint, type checks, tests, and a final security review.

For each implementation phase:

- state the files created or changed;
- provide complete code rather than pseudocode;
- explain setup commands;
- include environment-variable examples without real secrets;
- include database migration steps;
- report known limitations;
- do not silently omit error, loading, empty, or permission states.

## 24. Definition of Done

The MVP is complete only when:

- a verified student can register and complete a profile;
- a student can publish, comment, react, save, and report in permitted channels;
- published resources can be searched, opened, and bookmarked;
- events can be viewed and RSVP status managed;
- opportunities can be searched, saved, and opened externally;
- notifications are stored, displayed, and deep-linked;
- all protected tables have tested RLS policies;
- primary flows handle loading, empty, error, and offline states;
- the app can produce a release-ready Android build;
- setup, migration, deployment, and handover documentation are complete.
