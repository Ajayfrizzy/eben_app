# Analytics event dictionary

Never attach email, biography, exact location, or sensitive profile data.

| Event | Safe properties |
|---|---|
| sign_up, login, onboarding_completed | method, app_version |
| channel_viewed | channel_id |
| post_created, comment_created, reaction_added | channel_id, content_type |
| resource_opened, resource_bookmarked | resource_id, category, type |
| event_viewed, rsvp_created, rsvp_cancelled | event_id, format |
| opportunity_viewed, opportunity_saved, external_application_opened | opportunity_id, type |
| notification_opened | notification_type, target_type |
