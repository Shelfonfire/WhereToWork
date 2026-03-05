# WhereToWork - Future Features

**Summary:** Priority features are Google Places enrichment, advanced filters, business self-service, and user accounts. Medium-term: reviews, real-time busyness, PWA. Long-term: monetization, heatmaps, API.

---

## Data & Content

- **Google Places API integration** - auto-pull hours, photos, ratings, address verification. High impact, reduces manual data entry
- **LLM enrichment** - GPT/Claude to generate venue descriptions, summarize reviews, extract amenity info from unstructured text
- **Web scraping pipeline** - scrape laptopfriendlycafe.com, Yelp, Foursquare for new venues and cross-reference data
- **Google Sheet sync** - automated import from source spreadsheet on schedule, diff detection for changes
- **User-submitted venues** - form to suggest new locations w/ moderation queue
- **Photo pipeline** - auto-fetch Street View / Google Places photos per venue
- **Opening hours normalization** - parse varied hour formats into structured data, flag outdated hours

## User Experience

- **User accounts** - email/Google OAuth login via Supabase Auth
- **Favorites/bookmarks** - save venues to personal lists, sync across devices
- **Check-ins** - "I'm here now" feature, shows how many remote workers currently at venue
- **Real-time busyness** - Google Popular Times data or check-in derived occupancy indicator
- **Personalized recommendations** - "for you" suggestions based on past visits/favorites
- **Dark mode** - theme toggle, respect system preference
- **Mobile-responsive redesign** - bottom sheet map UX like Google Maps on mobile
- **Offline support** - cache recently viewed venues for tube/underground use
- **Share venue** - deep links, copy-to-clipboard, WhatsApp/Twitter share buttons

## Business Features

- **Self-service portal** - businesses claim listing, update hours/amenities/photos
- **Business verification** - email domain or Google My Business verification flow
- **Analytics dashboard** - show businesses their listing views, clicks, favorites count
- **Promoted listings** - pay to appear higher in search or with highlighted pin
- **Event posting** - businesses post coworking events, happy hours, community meetups
- **Amenity self-reporting** - businesses update WiFi speed, plug count, menu changes
- **Response to reviews** - business owners reply to user feedback

## Map & Search

- **Advanced filters** - filter by WiFi quality, plug availability, noise level, coffee price range, food options
- **Text search** - search by venue name, area, or postcode
- **Nearby transit overlay** - show tube/bus stops near venues
- **Route planning** - "work spots near my commute" using origin/destination
- **Heatmap layer** - density of work-friendly spots by area
- **Cluster markers** - group nearby pins at low zoom levels (Leaflet.markercluster)
- **Area guides** - curated lists per neighborhood (Shoreditch, Soho, etc.)
- **"Near me" button** - GPS-based closest venues sorting
- **Multi-stop planner** - plan a day across multiple venues

## Community

- **Reviews & ratings** - star ratings + text reviews per venue
- **WiFi speed reports** - users submit Speedtest results, show averages
- **Photo uploads** - user-contributed workspace photos
- **Tips/notes** - short tips ("best seat by window", "ask for WiFi password at counter")
- **Upvote/downvote** - community validation of amenity claims
- **"Regulars" badges** - frequent visitors get recognition
- **Report issues** - flag closed venues, incorrect info, unsafe locations

## Monetization

- **Premium listings** - businesses pay for enhanced profiles (photos, description, links)
- **Featured placement** - rotating sponsored pins on map homepage
- **Affiliate links** - link to venue booking/ordering platforms with referral codes
- **Pro user subscription** - ad-free, advanced filters, WiFi speed history, export lists
- **API access tier** - paid API for third-party apps wanting venue data
- **Coworking partnerships** - referral deals with coworking spaces for overflow

## Technical

- **PWA** - installable app, service worker caching, app-like experience
- **Push notifications** - alerts for new venues nearby, favorite venue updates
- **Public API** - REST/GraphQL endpoints for venue data, rate-limited
- **Performance** - lazy load markers, viewport-based queries, edge caching via Vercel
- **SEO pages** - server-rendered venue pages for Google indexing (`/venue/[slug]`)
- **Monitoring** - error tracking (Sentry), uptime checks, API latency dashboards
- **CI/CD** - automated tests, preview deploys, staging environment
- **Data backup** - scheduled Supabase exports, Google Sheet as backup source of truth

---

## Priority Tiers

| Tier | Features |
|------|----------|
| **P0 - Now** | Google Sheet sync, advanced filters, cluster markers, mobile responsive |
| **P1 - Soon** | User accounts, favorites, Google Places API, text search, near me |
| **P2 - Next** | Reviews, check-ins, business self-service, PWA, SEO pages |
| **P3 - Later** | Heatmaps, monetization, push notifications, API, LLM enrichment |
