# Wapilot AI — Reference-Inspired Homepage Redesign

রেফারেন্স PDF-এর layout, depth, section rhythm ও premium SaaS অনুভূতি অনুসরণ করে শুধু Wapilot AI হোমপেজ নতুনভাবে সাজানো হবে। সরাসরি brand/text নকল হবে না; Wapilot AI-এর নিজস্ব blue-green identity, বাংলা-ইংরেজি কনটেন্ট এবং বিদ্যমান কাজগুলো থাকবে।

## নির্বাচিত ডিজাইন

- **Direction:** Premium glassmorphic hero
- Ash-black/dark surface-এর সঙ্গে blue primary এবং green automation accent
- Light ও dark—দুই theme-এই polished contrast; বর্তমান theme toggle অপরিবর্তিত
- শক্তিশালী centered hero, soft edge-lighting, restrained glass surfaces ও পরিষ্কার corporate typography
- Reference-এর section flow থাকবে, তবে visual treatment আরও modern ও Wapilot AI-specific হবে

## হোমপেজের পরিবর্তন

1. **Header** — compact navigation, পরিষ্কার brand lockup, theme toggle, Admin এবং Get Started action; mobile navigation-ও ব্যবহারযোগ্য থাকবে।
2. **Hero** — নতুন Bengali-first headline, Wapilot AI নামটি প্রথম viewport-এ prominent, supporting copy, download/license CTA, ছোট trust points এবং integrated stats strip।
3. **Command Center Preview** — বর্তমান UI mockup-কে আরও realistic dashboard framing, metric hierarchy, chart ও activity/license rows দিয়ে polished করা।
4. **How It Works** — Install → Activate → Automate flow-কে reference-এর মতো সহজ three-step presentation, কিন্তু Wapilot-এর real license flow অনুযায়ী।
5. **Capabilities** — existing Broadcast, Auto-Reply, WooCommerce, Telegram, License Control ও Analytics-কে আরও engaging grid/feature showcase-এ সাজানো।
6. **Pricing** — backend থেকে আসা বর্তমান দাম ও plan logic অপরিবর্তিত রেখে আরও পরিষ্কার comparison cards এবং popular-plan emphasis।
7. **FAQ + Final CTA** — compact accordion, stronger closing panel, download/payment actions এবং complete footer navigation।
8. **Animation** — ambient glow, scroll reveal, subtle card lift ও border illumination; reduced-motion preference সম্মান করা হবে।

## যা অপরিবর্তিত থাকবে

- Download, Pay, Auth ও Admin পেজের বর্তমান ডিজাইন ও কার্যকারিতা
- Backend, database, authentication, licensing, payments ও extension API
- Real pricing/settings data এবং বিদ্যমান `/download`, `/pay`, `/auth` navigation
- Light/dark theme preference ও persistence
- Reference-এর API claims, fake user counts বা অপ্রমাণিত feature সরাসরি কপি করা হবে না

## Technical Details

- `src/routes/index.tsx`-এর landing markup ও visual hierarchy refine করা হবে; public settings query ও route metadata বজায় থাকবে।
- `src/components/landing/DashboardPreview.tsx` ও প্রয়োজনে ছোট homepage-only presentational components update করা হবে।
- `src/components/landing/SiteChrome.tsx`-এ homepage navigation polish হবে, shared footer links যেন অন্য route থেকে broken hash navigation না করে তা ঠিক রাখা হবে।
- `src/styles.css`-এ শুধু semantic homepage effects/tokens/utilities যোগ বা refine করা হবে; component code-এ raw color ব্যবহার হবে না।
- Existing `Button`, `Accordion`, `Reveal`, `CountUp` primitives reuse করা হবে।
- Desktop ও mobile viewport, উভয় theme, CTA links, accordion, reveal animation এবং console errors browser-এ যাচাই করা হবে।
