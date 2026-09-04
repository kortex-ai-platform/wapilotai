# WaReply Pro — Extension + Web Dashboard (App-in-App)

আপনার দেওয়া Chrome Extension (WaReply Pro — WhatsApp automation) কে ঘিরে একটা সম্পূর্ণ **web dashboard + backend** বানানো হবে। Extension-টা সরাসরি এই নতুন backend-এর সাথে কথা বলবে — আলাদা Vercel/Supabase সেটআপের দরকার হবে না, সব Lovable Cloud-এই হবে।

## কী কী বানানো হবে

### ১. Backend (Lovable Cloud — database + API)
Extension-এর SETUP_GUIDE অনুযায়ী সব table ও API:
- **licenses** — trial, license key, plan, expiry
- **payments** — bKash/Nagad payment request (pending/approved/rejected)
- **app_settings** — bKash/Nagad নম্বর, দাম, সাপোর্ট লিংক ইত্যাদি
- **Public API endpoints** (`/api/public/*`) যেগুলো extension সরাসরি call করবে:
  - trial/start, trial/check
  - license/verify, license/bind, license/fetch
  - payment/submit, payment/pending
  - settings/public
- প্রতিটা endpoint-এ input validation + CORS (extension থেকে call আসবে বলে)

### ২. Admin Panel (login-protected)
- **Admin login** (email/password)
- **License ব্যবস্থাপনা**: নতুন license তৈরি, plan বদলানো, extend/disable, trial list
- **Payment review**: pending bKash/Nagad payment approve/reject → approve করলে license activate
- **Settings editor**: দাম, নম্বর, লিংক — web থেকেই বদলানো যাবে

### ৩. Analytics ও রিপোর্ট
- Extension থেকে event log (activation, broadcast count, auto-reply count)
- Dashboard-এ চার্ট: দৈনিক active user, broadcast, revenue summary
- কাস্টমার list ও তাদের usage history

### ৪. Public Website
- Landing page: WaReply Pro-এর feature, pricing (Monthly 950 / Yearly 4500 / Lifetime 14500)
- **Extension download page**: বান্ডিল করা ZIP + ধাপে ধাপে install guide (Load unpacked)
- Payment instructions page (bKash/Nagad নম্বর, TrxID submit form — extension ছাড়াও)

### ৫. Extension আপডেট
- আপনার আপলোড করা extension-এর source-এ শুধু backend URL বদলে নতুন Lovable backend-এ point করা হবে
- নতুন ভার্সন ZIP হিসেবে app-এর ভেতর থেকে download করা যাবে

## Technical Details
- Lovable Cloud enable (database + auth) — Supabase Vercel-এর বিকল্প হিসেবে
- Admin role: আলাদা `user_roles` table + `has_role()` function (secure)
- API routes: `src/routes/api/public/*.ts` — Zod validation, CORS headers
- Dashboard: `_authenticated` route group, server functions (`createServerFn` + requireSupabaseAuth)
- Extension zip: `public/` ফোল্ডারে বান্ডিল, fetch+blob দিয়ে download
- প্রথম admin account আপনার জন্য তৈরি করে দেওয়া হবে

## কাজের ধাপ
1. Lovable Cloud enable + database schema (migration)
2. Public API endpoints (extension-এর জন্য)
3. Admin auth + admin panel (licenses, payments, settings)
4. Analytics events + dashboard charts
5. Landing page + download page + extension re-bundle
6. End-to-end test
