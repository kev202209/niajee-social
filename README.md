# Niajee Social

Modern social platform built with Next.js App Router, TypeScript, and Tailwind CSS. Includes blogs, shorts, channels, real-time features, and a security‑hardened authentication flow with CSRF protection, email OTP verification, and device OTP for new logins.

## Key Features

- Authentication and security
	- Email + password with CSRF protection on every mutating request
	- Email verification via OTP (auto-detects 6 digits, resend with cooldown)
	- New device verification (device OTP via email)
	- Google OAuth entry point
- Content
	- Blogs with Editor.js block editor and rich components
	- Shorts/videos with HLS playback
	- Channels and saved/history views
- UI/UX
	- App Router layout, dark mode, animated blob backgrounds
	- Tailwind CSS + Radix primitives and custom components
- Limits and roles
	- Blog creation limited to 10 per user; admins have unlimited creation

## Tech Stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS, Framer Motion
- Editor.js (multiple tools), React Hook Form
- Socket.IO client
- Date-fns, React Day Picker

## Prerequisites

- Node.js 18.18+ (LTS recommended)
- A package manager: pnpm (preferred) / npm / yarn / bun
- Backend API reachable at an HTTPS domain (required for credential cookies in cross‑site mode)

## Quick Start

```bash
# install dependencies (pnpm preferred)
pnpm install

# run dev server
pnpm dev

# build & start
pnpm build
pnpm start

# lint
pnpm lint
```

App runs at http://localhost:3000 by default.

## Environment Variables

Create a `.env.local` at the project root:

```bash
# URL of the backend API (must include protocol)
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Optional: main marketing/site URL used in links
NEXT_PUBLIC_MAIN_URL=https://your-domain.com

# Optional: allow-list of redirect origins used for safe redirects
NEXT_PUBLIC_FRONTEND_A_URL=https://app.your-domain.com
NEXT_PUBLIC_FRONTEND_B_URL=https://your-domain.com
```

Notes:
- When API and frontend are on different domains, the API must set CORS with `Access-Control-Allow-Credentials: true` and a specific `Access-Control-Allow-Origin` to your frontend (not `*`).
- CSRF cookie should be `SameSite=None; Secure` for cross-site usage.

## Authentication Flow (Frontend)

- Registration
	- Multi-step form collects user data.
	- On success, user is redirected to `/auth/verify-email?email=...&redirect=...`.

- Email Verification (OTP)
	- Page receives the `email` via query string, renders a 6-digit OTP field, auto-submits when complete.
	- Endpoints used:
		- `POST /auth/verify-email` with `{ email, otp }`
		- `POST /auth/resend-verification` with `{ email, redirect }`
	- Both requests include `credentials: 'include'` and `x-csrf-token` from `AuthContext.ensureCsrf()`.

- Login
	- Email/username + password.
	- If backend flags a new device, user is prompted for device OTP (`/auth/devices/verify-otp`) and can request resend (`/auth/devices/request-otp`).
	- All requests go through `AuthContext` to attach CSRF and credentials.

- Session/Refresh
	- `AuthContext` periodically refreshes the access token and retries verification on 401.

## Blog Creation Limits

- Endpoint: `GET api/blogs/me/limit`
- Sample response

```json
{
	"success": true,
	"message": "Blog limit status retrieved successfully",
	"data": {
		"role": "admin",
		"unlimited": true,
		"limit": null,
		"used": 1,
		"remaining": null,
		"canCreate": true
	}
}
```

- UI behavior
	- The Blogs page only shows the “Write a Blog” button when `canCreate` is true.
	- The Create Blog page checks the limit on load; if `canCreate` is false, it redirects back to `/blogs`.
	- Admins have `unlimited: true` and always see the create action.

## Project Structure (partial)

```
app/
	layout.tsx
	globals.css
	page.tsx
	not-found.tsx
	robots.ts
	sitemap.ts

	auth/
		layout.tsx
		login/
			page.tsx            # Credentials login + new-device OTP step
		register/
			page.tsx            # Multi-step registration; redirects to verify email
		verify-email/
			page.tsx            # Email OTP verify + resend with cooldown
		forget-password/
			page.tsx
		reset-password/
			page.tsx
		verify-device/
			page.tsx
		redirect/
			page.tsx

	blogs/
		page.tsx              # Listing: latest/trending/featured, create button (limit-aware)
		create/
			page.tsx            # Create blog page (checks api/blogs/me/limit)
		[slug]/
			page.tsx            # Blog detail

	channels/
		[handle]/
			page.tsx

	create/
		layout.tsx
		page.tsx
		channels/
			page.tsx
			new/
				page.tsx
			[channelId]/
				ChannelOverviewSkeleton.tsx
				layout.tsx
				page.tsx
				analytics/
					page.tsx
				live/
					page.tsx
				manage-uploads/
					page.tsx
				settings/
					page.tsx
				upload/
					page.tsx
					types.ts
					utils.ts

	history/
		page.tsx
	home/
		page.tsx
	legals/
		layout.tsx
		contact-us/
			page.tsx
		cookie-policy/
			page.tsx
		privacy-policy/
			page.tsx
		terms/
			page.tsx
	mango/
		page.tsx
	pricing/
		page.tsx
	providers/
		PHprovider.tsx
	saved/
		page.tsx
	search/
		page.tsx
	shorts/
		page.tsx
		[v]/
			page.tsx
			ShortSkeleton.tsx
			ShortsProgressBar.tsx
			shortVideoPlayer.tsx
			VideoActions.tsx
			CommentsSection.tsx
			ReportModal.tsx
		sounds/
			[id]/
				page.tsx
	watch/
		[v]/
			page.tsx
			loading.tsx
			error.tsx
			CommentSection.tsx
			SuggestedVideos.tsx
	why/
		page.tsx

components/
	Blob.tsx
	CookieConsent.tsx
	DarkModeToggle.tsx
	Header.tsx
	Image.tsx
	LikeButton.tsx
	LoadingDots.tsx
	Logo.tsx
	Providers.tsx
	admin/ ...
	blog/ ...
	editor/ ...
	home/ ...
	video/ ...

contexts/
	AuthContext.tsx         # CSRF, login/refresh, OTP helpers

hooks/
	useOutsideClick.ts
	useVideoPlayer.ts
	upload/

lib/
	api/
	socket.ts
	utils.ts

types/
	blog.types.ts
	post.types.ts
	shorts.ts
	editorjs-stubs/

utils/
	deviceInfo.ts
	formatCount.ts
	imageUtils.ts
	ShareService.ts
	timeAgo.ts
	toastMessages.ts
	videourl.ts
	ViewTrackingService.ts
```

## Development Notes

- CSRF
	- Before any POST/PUT/PATCH/DELETE, the app calls `ensureCsrf()` and sends the token in `x-csrf-token` with `credentials: 'include'`.
	- If a request gets `403`, most flows fetch a fresh CSRF token and retry once.

- Behind Cloudflare / Proxies (backend)
	- Backend should set `trust proxy` (e.g., Express/Nest) and prefer `cf-connecting-ip`/`true-client-ip` headers when resolving the real client IP.
	- If using Nginx between Cloudflare and the app, forward those headers upstream.

- Device fingerprinting
	- The app collects non-invasive device info (browser/OS, screen, connection type) and may include server-derived IP/geo if exposed via a secured endpoint.

## Scripts

- `pnpm dev` – run the development server (Turbopack)
- `pnpm build` – production build
- `pnpm start` – start the production server
- `pnpm lint` – lint with ESLint/Next

You can substitute `pnpm` with `npm`, `yarn`, or `bun` if preferred.

## Troubleshooting

- CSRF errors (403)
	- Ensure the API exposes a CSRF endpoint and sets cookies with `SameSite=None; Secure` when cross-site.
	- Verify requests include `credentials: 'include'` and the `x-csrf-token` header.

- CORS/Cookies not sent
	- API must use a specific `Access-Control-Allow-Origin` (your frontend URL) and `Access-Control-Allow-Credentials: true`.

- OTP email not arriving
	- The backend enforces throttling (resend/verify). Check server logs and email provider.

- Cloudflare shows proxy IPs
	- Set `trust proxy` on the backend and read `cf-connecting-ip`/`true-client-ip` headers.

## License

This project is licensed. See the `LICENSE` file for details.

## Contributing

Pull requests are welcome. For major changes, please open an issue to discuss what you would like to change.
