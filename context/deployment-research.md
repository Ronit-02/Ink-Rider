# Ink Rider deployment provider research

Checked 2026-09-03. This note researches providers for the existing React/Vite frontend, Node/Express API, separate notification worker, MongoDB Atlas, and Cloudinary. The final section records a source-level deployment audit. No deployment or application change was performed. Prices are USD before tax. Capacity suggestions are estimates to validate with load tests, not provider guarantees.

## Provider facts and prices

Cloudflare Pages Free includes unlimited static requests and bandwidth, with 500 builds per month and one concurrent build. A Vite build can stay on this static tier as traffic grows; application API traffic and media delivery have their own costs. [Pages pricing](https://pages.cloudflare.com/), [Pages limits](https://developers.cloudflare.com/pages/platform/limits/). Pages Functions are billed under Workers, so the static allowance does not imply unlimited backend execution. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).

Render's official comparison material lists a 512 MB, 0.5 CPU Starter service at $7/month and a 2 GB, 1 CPU Standard service at $25/month. [Official compute price comparison](https://render.com/articles/top-heroku-alternatives-agencies). In August 2026, Render renamed those compute plans to `0.5c-512mb` and `1c-2g`, respectively; specs and prices stayed unchanged. Web services and background workers have matching compute plan specifications. [Compute plans](https://render.com/docs/compute-plans). The live pricing page's compute table was not available to the text extraction tool, so check the displayed checkout quote before purchase. [Pricing](https://render.com/pricing).

Render workspace charges are separate from instance charges. Hobby is $0 with 5 GB outbound bandwidth included; Pro is $25/month flat with 25 GB included. Additional bandwidth costs $0.15/GB. Pro includes unlimited team members. The new workspace plans were rolled out to all customers by August 1, 2026. Older comparisons quoting 100 GB on Hobby or 500 GB on Professional are outdated. [Workspace pricing changes](https://render.com/blog/better-pricing-for-fast-growing-teams).

Render supports multiple web, private-service, and worker instances, up to 100 per service. It balances incoming requests across web instances. Manual scaling is available on all workspace plans, while CPU/memory autoscaling requires Pro or higher. Each running instance is billed separately. A service with an attached persistent disk cannot run multiple instances. [Scaling](https://render.com/docs/scaling).

Render Free web services sleep after 15 minutes without traffic and may take about a minute to restart. Render explicitly advises against Free instances for production. Background workers have no free instance option. [Free service limitations](https://render.com/docs/free).

Render currently offers Oregon, Ohio, Virginia, Frankfurt, and Singapore regions. It has no listed India region. Singapore is therefore the practical initial candidate for India-focused users, subject to measured latency. Keep API, worker, and database close together. A service's region cannot be changed in place; a move needs a new service. [Regions](https://render.com/docs/regions).

Atlas Flex costs $8-30 for a month of usage, with 5 GB storage and up to 500 operations per second. Its base price includes 100 operations per second and unlimited data transfer. [Flex costs](https://www.mongodb.com/docs/atlas/billing/atlas-flex-costs/). Flex has a 500-connection cap, fixed storage limit, no private endpoints, and no continuous point-in-time recovery. [Flex limitations](https://www.mongodb.com/docs/atlas/reference/flex-limitations/). It does have automatic daily snapshots and retains the latest eight. It lacks custom schedules and on-demand snapshots. [Flex backups](https://www.mongodb.com/docs/atlas/backup/cloud-backup/flex-cluster-backup/).

MongoDB advertises Dedicated clusters from $56.94/month; exact prices depend on provider, region, configuration, transfer, and backups. This is a starting price, not a verified Singapore M10 quote. [Atlas pricing](https://www.mongodb.com/pricing). MongoDB allows M10 and M20 for low-traffic production and recommends M30 or above for production workloads with sustained performance requirements. [Cluster sizing](https://www.mongodb.com/docs/atlas/sizing-tier-selection/). Do not map user count directly to a database tier.

Cloudinary Free provides 25 monthly credits. Plus costs $99/month when paid monthly or $89/month on annual billing and provides 225 credits. Advanced costs $249/month when paid monthly or $224/month on annual billing and provides 600 credits. A credit can represent 1 GB of image bandwidth, 1 GB of managed storage, or 1,000 standard transformations. These consume a shared allowance, so 25 credits do not provide 25 GB in every category simultaneously. [Cloudinary pricing](https://cloudinary.com/pricing).

## Suggested stages to validate

Assume the numbers mean monthly active users. Registered accounts, daily active users, and simultaneous users imply different loads. These suggested stages are engineering judgments, not benchmarks of Ink Rider.

| Monthly active users | Initial deployment to test | Why this stage makes sense |
| --- | --- | --- |
| 100 | Pages Free; one paid 512 MB API; one paid 512 MB worker; Atlas Flex for a beta, or Dedicated M10+ with appropriate backups for valuable production data | Keeps operations simple. Flex recovery limits should be an explicit choice. |
| 1,000 | Same providers; one 2 GB API if measurements justify it; small separate worker; Dedicated M10/M20 if load remains light | Usually a sizing and database-quality problem before a need for multiple API instances. |
| 10,000 | Same static frontend; two API instances when uptime or peak traffic warrants them; Pro workspace for autoscaling; size worker from queue delay; evaluate M20/M30 | Requires stateless API behavior and safe job ownership before replication. The user count alone does not mandate M30. |
| 100,000 | Same providers can remain viable; multiple API instances with measured autoscaling bounds; worker capacity set from job throughput; dedicated Atlas sized from working set and query metrics, often M30+ for sustained load | Consider AWS/GCP only when region, availability, cost, or operational requirements justify migration. No automatic Kubernetes or sharding requirement. |

## Cost calculations and limits

Illustrative entry costs, using the official prices above, before bandwidth, media, notification-provider charges, extra backups, domain, monitoring, staging, or tax:

- Small beta with two $7 services and Atlas Flex: about $22-44/month on Hobby.
- Small production deployment with a $25 API, $7 worker, and Atlas Dedicated at the advertised starting price: about $89/month on Hobby, or about $114/month with Pro. The selected Atlas region and backup configuration can raise this.
- Two $25 APIs, one $7 worker, and Pro: $82/month before the database and other usage. This is arithmetic, not a claim that the configuration supports 10,000 users.

For larger stages, use a budget range only after defining API requests per active user, peak-to-average traffic, database operations per request, average response size, media consumption, job volume, and availability target. As a rough planning reserve, hundreds of dollars monthly for 10,000 MAU and high hundreds to several thousand for 100,000 MAU can be plausible for a text-first application, but these are estimates with wide uncertainty.

An image-heavy feed can change the bill more than the API servers. For example, 100,000 users consuming 10 MB of image data each creates roughly 1 TB of media delivery. This is a workload illustration, not a measured Ink Rider usage forecast. Cloudinary credits must also cover stored assets and transformations.

Before increasing instance count, confirm shared rate limits where required, absence of process-local durable state, database connection-pool budgets, bounded queries, and safe multi-worker job claims. Measure p95 API latency, errors, CPU/RAM, Atlas query latency and saturation, outbound GB, and oldest pending job age. Define the acceptable thresholds from the application's latency and notification-delivery requirements.

## Ink Rider deployment audit

All existing context files, root and frontend READMEs, manifests, and the root agent contract were read. Some summary tables retain older component statuses and test totals than later verification entries. This assessment uses current source for deployment findings and does not certify historical checks as a current production pass.

The existing UI uses the AppLayout shell, Navbar, Sidebar, BottomBar, shared discovery cards, filters, dialogs, skeletons, and toasts. Libre Baskerville and DM Sans, light/dark semantic tokens, URL-backed filters, and query-backed interactions remain intact. No redesign, route replacement, schema replacement, or framework migration is needed for this hosting recommendation.

React calls Express through the configured API client. Express owns authentication, domain routes, Mongoose persistence, Cloudinary uploads, and optional provider adapters. Session records live in MongoDB; notification delivery records are consumed by the separate worker. The existing modular monolith remains the recommended architecture at all four tiers. Public APIs include legacy `/api/...` families and newer `/api/v1/...` routes; retain both.

### Findings to address before launch

- The root [dockerfile](../dockerfile) now uses Node 22, lockfile-based installs, production-only backend dependencies, and a non-root runtime. It copies built frontend files into `/app/public`, but static serving is commented out in [app.js](../Backend/src/app.js) and no SPA fallback exists. That image still does not serve the full frontend; prefer independent static hosting plus an API service.
- [vite.config.js](../Frontend/vite.config.js) proxies `/robots.txt` and `/sitemap.xml` only during development. Production needs these routes on the frontend origin, plus direct navigation to `/post/:id` and other client routes. On Pages, an external backend proxy needs a Function/Worker or another routing solution; `_redirects` cannot proxy an external domain. Keep this proxy limited to the intended public SEO routes. [Pages proxy rules](https://developers.cloudflare.com/pages/configuration/redirects/).
- [config.js](../Backend/config/config.js) supports secure cookies and SameSite configuration. Use HTTPS custom domains under the same parent, such as `www.example.com` and `api.example.com`, exact `FRONTEND_URL`, the production build-time `VITE_API_URL`, `NODE_ENV=production`, and `COOKIE_SECURE=true`. Verify refresh, logout, OTP, Google origins, and enabled provider callbacks on the deployed domains. Never copy development cookie settings blindly.
- [app.js](../Backend/src/app.js) now applies only an explicitly configured proxy-hop count or supported trusted subnet name. Validate the actual hosting proxy chain before setting `TRUST_PROXY`; leaving it blank is safer than broadly trusting arbitrary forwarded headers. [Express proxy configuration](https://expressjs.com/en/guide/behind-proxies/).
- [health.controller.js](../Backend/controllers/health.controller.js) returns 503 from `/readiness` whenever delivery health reports any pending/failed job or dead letter. Ordinary queued work could remove otherwise functional API instances from service. Separate delivery alerts from traffic readiness before using that endpoint as the platform health check. Existing `/health` checks process liveness; `/database-status` checks database connection state.
- [notification-delivery.service.js](../Backend/services/notification-delivery.service.js) claims jobs atomically, but only selects pending/failed records. There is no expired-lock recovery for jobs stranded in `processing` after a crash. Add lease recovery and test retry/idempotency behavior before depending on delivery during restarts. Review worker shutdown and overlapping interval runs in [process-notification-deliveries.js](../Backend/scripts/process-notification-deliveries.js).
- Production should exercise the replica-set transaction path. Current CI provisions standalone MongoDB, so its existing integration command alone does not prove production transaction behavior. Verify against an isolated replica set or Atlas staging database and rehearse a restore. Activate monitoring and only the providers included in launch scope.

### Findings relevant to growth

[rate-limit.middleware.js](../Backend/middlewares/rate-limit.middleware.js) uses bounded process-local buckets for development and atomic MongoDB TTL buckets in production. Production rejects an in-memory override, preserving IP and account-level rules across API instances without adding a separate datastore.

[search.controller.js](../Backend/controllers/search.controller.js) uses case-insensitive regex matching over article bodies and profile fields. Profile those queries with representative content volumes; evaluate indexed search if scans dominate. Public response caching must exclude private drafts, personalized feeds, member content, and user-specific like/save state unless explicitly partitioned by identity and authorization. Cache invalidation must respect unpublication and access changes.

Interaction-event volume and image delivery can outgrow account storage. Define event retention and aggregation before large-scale growth. The sitemap currently allows up to 50,000 posts plus 10,000 profiles in one response; review sitemap splitting and query cost as published content grows.

For an illustrative workload, 20 sessions per MAU per month, five pages per session, and four API requests per page imply 400 API requests per MAU per month. At 100,000 MAU this is 40 million monthly requests, about 15.4 requests/second averaged over 30 days, or 154 requests/second at an assumed 10x peak. This excludes anonymous readers, bots, polling, retries, and unusual event traffic. A database operation is not an HTTP request, and one request may perform several operations. Load tests must measure the actual mix, including authentication, discovery, search, autosave, and voting bursts.

### Scope and verification

Only this research note and a research entry in [progress-tracker.md](progress-tracker.md) were changed. All hosting and code changes above are proposals. Source inspection and official-document checks were performed; no application tests, load tests, provider activation, purchases, or deployment were performed. A deployment implementation should first agree on provider, region, domain, budget, and recovery expectations, then present the bounded file changes required by the repository contract.

## Free alternatives follow-up

Checked 2026-09-03. Counts still mean monthly active users. A free allowance is conditional on usage; a paid service with included usage can bill overages. Temporary trial credits are not a permanent zero-cost deployment.

| Component | Free option and limit | Fit for Ink Rider |
| --- | --- | --- |
| Frontend | Cloudflare Pages static hosting, described above | Keep at all four user counts; dynamic Functions have separate pricing. |
| API preview | Render Free sleeps after 15 minutes, offers 750 shared instance hours/month, blocks outbound SMTP ports 25/465/587, and has no free dedicated worker. [Limits](https://render.com/docs/free) | Useful for a preview; existing SMTP delivery needs an HTTP adapter or a verified supported transport. |
| API preview alternative | Koyeb provides one 512 MB/0.1 vCPU free web instance, sleeps after one idle hour, is restricted to Frankfurt/Washington, and cannot run a Worker Service. [Instances](https://www.koyeb.com/docs/reference/instances) | Another small beta option, not a complete API-plus-worker replacement. |
| API and worker | Oracle Always Free currently documents an A1 allowance equivalent to 2 OCPUs/12 GB RAM for a free tenancy and 200 GB combined boot/block storage. Capacity shortages and idle-instance reclamation apply. [Current limits](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) | Candidate for both existing Node processes on one self-managed VM. Validate ARM dependencies, maintain security updates and backups, and accept the single-server failure boundary. |
| Database | Atlas Free: 0.5 GB including documents/indexes, 100 operations/second, 500 connections, no managed backups. [Limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/) | Least migration work. Arrange exports/restores. Content revisions and interaction events can exhaust storage before user records do. |
| Images | Keep Cloudinary Free's 25 shared monthly credits | Existing integration; no migration just to use the free plan. |
| Image-provider alternative | ImageKit Free: 20 GB monthly delivery and 3 GB storage; delivery/uploads stop when the respective limits are reached. [Plans](https://imagekit.io/plans) | Requires media-provider integration changes. |
| Object storage | R2 Standard: 10 GB-month storage, 1 million Class A and 10 million Class B operations/month; internet egress has no charge. Subscription setup required and overages bill. [Pricing](https://developers.cloudflare.com/r2/pricing/), [setup](https://developers.cloudflare.com/r2/get-started/) | A possible growth option; image transforms, upload authorization, metadata, and deletion need implementation. |
| Transactional email | Brevo: 300 emails/day with no rollover. [Free plan](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan) Resend: 3,000/month and 100/day. [Pricing](https://resend.com/pricing) | Both support SMTP and HTTP APIs. Confirm sender-domain verification and host transport restrictions. |

The email integration is not a configuration-only swap in every case. [email.service.js](../Backend/services/email.service.js) currently uses `EMAIL` for both SMTP login and From address and prioritizes Google OAuth when those credentials are present. Brevo and Resend can require a distinct SMTP username, so plan an explicit transport/auth selection and separate sender/login settings before switching. [Brevo SMTP](https://developers.brevo.com/docs/smtp-integration), [Resend SMTP](https://resend.com/docs/send-with-smtp).

Google Cloud Run is another usage-priced option with recurring free allowances: request-based billing includes 2 million monthly requests plus bounded CPU and memory credits. Networking and related services may still cost money. It is not a guaranteed zero-dollar host. The existing continuously polling worker needs separate execution and lifecycle planning. [Pricing](https://cloud.google.com/run/pricing), [billing behavior](https://docs.cloud.google.com/run/docs/configuring/billing-settings).

### Choice by activity level

- At 100 MAU, a zero-cost beta is plausible. For the full background-delivery feature set, Pages plus an available Oracle VM for API/worker, Atlas Free, Cloudinary Free, and a free email provider is the strongest candidate identified here. It trades managed operations for server administration. Render/Koyeb simplify API previews but do not supply a free dedicated worker.
- At 1,000 MAU, the same setup may still fit. Measure database size, peak operations, image transfer, and daily email volume; do not infer capacity from accounts alone.
- At 10,000 MAU, retain free frontend hosting and any media/email allowances that still fit, but budget for database and compute. A measured low-activity workload could remain within free limits, but no dependable all-free production capacity claim is supported.
- At 100,000 MAU, free frontend hosting can still be useful. Plan paid backend/database capacity and recovery; free media/email allowances are partial savings rather than a complete operating budget.

No application changes or deployment were performed for this follow-up. Optional AI remains outside the zero-cost core deployment; existing extractive summaries and browser read-aloud do not require activating the paid writing-assistant provider. Provider migrations remain proposals.
