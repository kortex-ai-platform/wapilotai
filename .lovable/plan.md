# Wapilot AI — Rebrand + Full License & User System

পুরো app-টা **WaReply Pro → Wapilot AI** rebrand হবে, premium dark-green SaaS UI পাবে, আর license system-টা আপনার স্পেক অনুযায়ী সম্পূর্ণ নতুন করে বানানো হবে (key hash, device limit, status lifecycle, user management)।

## ১. Brand + Design System

- নাম: **Wapilot AI** — subtext "WhatsApp Business Automation", tagline "Automate Conversations. Grow Your Business."
- আপনার দেওয়া palette-টাই design token হিসেবে বসবে (background #06120E, surface #0B1F18, card #0F291F, primary #16C784, bright #22C55E, text #F5F7F6, muted #8EA59D, border #174D39, danger, warning)।
- Dark-first premium look: soft border, subtle green glow, clean card, high contrast, desktop-first admin + responsive public pages।
- Logo/wordmark তৈরি করা হবে; landing, auth, admin sidebar, download page — সব জায়গায় নতুন ব্র্যান্ড।

## ২. License System (নতুন করে)

License আর শুধু text string থাকবে না। Backend-এ প্রতিটি license-এর জন্য থাকবে:

License ID, Key Hash (raw key শুধু তৈরির মুহূর্তে একবার দেখানো হবে), User ID, Plan, Status, Created At, Activated At, Expires At, Max Devices, Current Devices, Last Validation, Revoked At.

- **Status**: Active, Inactive (unused), Expired, Suspended, Revoked, Blocked
- **Plan**: Free, Starter, Pro, Business, Lifetime
- **Duration**: 7 / 30 / 90 / 365 দিন বা Lifetime
- **Max Devices**: 1 / 2 / 5 / 10
- **Key format**: `WAPI-PRO7-X9K2-7M4Q-8LPA` (plan prefix + random blocks)
- আলাদা **devices** টেবিল: প্রতি activation-এ device record, limit ছাড়িয়ে গেলে activation block; admin device remove করতে পারবে।

### Activation flow (Extension)

Install → Wapilot খুলুন → Activation screen → key দিন → backend verify → valid হলে `License: ACTIVE / User / Plan / Expires / Device 1/1` দেখাবে, invalid হলে `Invalid License Key` দেখিয়ে সব feature block থাকবে।

- Key ছাড়া extension-এর কোনো feature চলবে না (broadcast, auto-reply, WooCommerce — সব gated)।
- Extension-এ **কোনো Supabase key থাকবে না** — শুধু আপনার public API endpoint-এর সাথে কথা বলবে; সব verification server-side।
- পর্যায়ক্রমিক re-validation (দিনে একবার) — revoke/suspend করলে ওই device-এ access বন্ধ হয়ে যাবে।

## ৩. User System

- **Users** টেবিল (name, email, phone, plan, license, status, device count, last active, created)
- Admin panel filter: All / Active / Pending / Suspended / Banned
- User detail: license history, device list, usage, status পরিবর্তন (suspend/ban/activate)

## ৪. Admin Panel (নতুন section সহ)

- **Overview** — user, active license, device, revenue, usage chart
- **Users** — উপরের list + filter + detail drawer
- **Licenses** — All / Active / Unused / Expired / Suspended / Revoked ট্যাব; **Create License** ফর্ম (Plan, Duration, Max Devices, user assign) → Generate → key একবার দেখানো ও copy
- License actions: extend, suspend, revoke, block, device reset, user reassign
- **Payments** ও **Settings** আগের মতোই, নতুন theme-এ

## ৫. Extension আপডেট + রি-প্যাক

- `license.js` নতুন activation UI ও API contract অনুযায়ী পুনর্লিখন, branding Wapilot AI
- নতুন `wapilot-ai.zip` তৈরি হয়ে `/download` পেজে থাকবে

## Technical Details

- Migration: `licenses` টেবিল restructure (key_hash, max_devices, current_devices, activated_at, revoked_at, last_validation, status enum, plan enum), নতুন `license_devices`, `app_users` (profiles) টেবিল; সব টেবিলে GRANT + admin-only RLS।
- Key hashing: server-side SHA-256; verify হয় hash lookup দিয়ে, raw key কখনো store হয় না।
- API: `src/routes/api/public/ext.$.ts`-এ `license/activate`, `license/validate`, `license/deactivate`, `device/list` যুক্ত হবে (Zod validation + CORS + rate-safe response)। Service-role client শুধু server handler-এর ভেতরে।
- Admin server functions `src/lib/admin.functions.ts`-এ user/device/license lifecycle অ্যাকশন যোগ হবে।
- Theme tokens `src/styles.css`-এ oklch হিসেবে বসবে; component-এ hardcoded color থাকবে না।
- বর্তমান demo/legacy license row গুলো নতুন schema-তে map করা হবে (plan monthly→Starter, yearly→Pro, lifetime→Lifetime)।
