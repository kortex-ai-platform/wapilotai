# Wapilot AI — Corporate Redesign (Ash Black + Blue/Green)

রেফারেন্স সাইটের impression নিয়ে, কপি না করে, আরও modern ও corporate একটা লুক দেওয়া হবে। পুরো অ্যাপ (landing, download, pay, auth, admin) একই নতুন থিম পাবে।

## রঙ ও থিম

- Background `#0D1117`, Surface `#151B23`, Card একটু হালকা ash-black
- Primary: Blue `#2563EB` (প্রধান বাটন, লিংক, হাইলাইট)
- Secondary accent: Green `#16C784` (success, active license, ছোট highlight)
- Text `#F5F7F6`, muted `#8B98A5`, soft border, subtle glow
- সব রঙ design token হিসেবে বসবে; কোনো hardcoded রঙ থাকবে না, তাই সব পেজে একসাথে বদলাবে

## Landing page (নতুন করে)

1. **Hero + stats** — বড় হেডলাইন, দুই রঙের gradient শব্দ, উপরে soft blue glow, দুটি CTA, নিচে স্ট্যাট বার (users, messages, uptime, rating)
2. **Dashboard preview** — অ্যাডমিন প্যানেলের একটি বড় mock preview কার্ড, চারপাশে glow ও border
3. **How it works** — ৩ ধাপের কার্ড (Install → Activate → Automate)
4. **Use cases** — ৬টি কার্ডের গ্রিড (support, broadcast, WooCommerce, Telegram alert, auto-reply, analytics)
5. **Pricing** — বর্তমান দাম রেখেই নতুন কার্ড ডিজাইন, popular প্ল্যান হাইলাইট
6. **FAQ** — accordion
7. **Final CTA + footer** — বড় ব্যান্ড, ডাউনলোড/কেনার বাটন, multi-column footer

## Animation (impression, কপি নয়)

- Scroll করলে সেকশনগুলো নরমভাবে fade + slide-up হয়ে আসবে
- কার্ডে hover-এ হালকা lift, border glow
- Hero-তে ধীর gradient glow, স্ট্যাট নাম্বার count-up
- বাটনে subtle shine; সব animation দ্রুত ও প্রফেশনাল, reduced-motion respect করবে

## অন্য পেজ

- **Download / Pay / Auth** — একই কার্ড স্টাইল, glow, নতুন হেডার-ফুটার
- **Admin** — sidebar, টেবিল, badge, chart সবই নতুন ash-black + blue টোনে; status badge-এ green/amber/red সেমান্টিক রঙ
- ফাংশনালিটি অপরিবর্তিত — শুধু চেহারা বদলাবে

## Technical Details

- `src/styles.css`-এ token রিরাইট (oklch): background/surface/card/primary(blue)/accent(green)/border/muted, `--gradient-primary`, `--gradient-hero`, `--glow-primary`, `--shadow-card`, `--shadow-elevated`
- নতুন `@utility` ক্লাস: `card-glow`, `section-fade`, `hover-lift`; keyframes fade-up / glow-pulse
- `useInView`-ভিত্তিক ছোট `Reveal` কম্পোনেন্ট (IntersectionObserver, SSR-safe) + `CountUp` — `src/components/`-এ
- Landing sections আলাদা কম্পোনেন্টে ভাগ (`src/components/landing/*`), `src/routes/index.tsx` কেবল সেগুলো compose করবে
- FAQ-তে shadcn `accordion` ব্যবহার
- Dashboard preview: জেনারেট করা একটি ইমেজ নয়, বরং সত্যিকারের UI দিয়ে বানানো mock কার্ড (হালকা ও ফাস্ট)
- Admin/pay/download/auth-এ শুধু className/layout বদল, server function ও data flow অপরিবর্তিত
- প্রতিটি রুটের `head()` মেটাডেটা আগের মতো থাকবে, দরকারে টাইটেল/ডেসক্রিপশন refresh
