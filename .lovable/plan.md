# Wapilot AI — ডিজাইন পালিশ + Light/Dark Theme Toggle

কোনো নতুন ফিচার বা ব্যাকএন্ড পরিবর্তন নয়। যা কিছু এখন কাজ করছে (লাইসেন্স, পেমেন্ট, অ্যাডমিন, এক্সটেনশন API) হুবহু অপরিবর্তিত থাকবে — শুধু চেহারা আরও premium হবে এবং লাইট/ডার্ক সুইচ যোগ হবে।

## ১. Theme toggle

- এখন পুরো অ্যাপ শুধু ডার্ক। নতুন করে একটি **light palette** যোগ হবে: সাদা/অফ-হোয়াইট ব্যাকগ্রাউন্ড, নরম সবুজ-নীল accent, হালকা বর্ডার ও শ্যাডো — রেফারেন্স স্ক্রিনশটের মতো পরিষ্কার লুক।
- বর্তমান ash-black + blue/green ডার্ক প্যালেট ডার্ক মোড হিসেবে থাকবে (ডিফল্ট ডার্ক)।
- হেডার ও অ্যাডমিন সাইডবারে একটি sun/moon টগল বাটন। পছন্দ ব্রাউজারে মনে থাকবে, রিফ্রেশেও ঠিক থাকবে, পেজ লোডে ফ্ল্যাশ হবে না।

## ২. পাবলিক পেজ পালিশ

- **Landing** — সেকশনগুলোর spacing/typography rhythm ঠিক করা, stat ও pricing কার্ডে আরও পরিষ্কার hierarchy, badge ও আইকন কনসিস্টেন্ট, hover/reveal অ্যানিমেশন আরও মসৃণ, মোবাইলে সাজানো।
- **Download** — রেফারেন্সের মতো একটি পরিষ্কার ডাউনলোড কার্ড: ভার্সন ব্যাজ, ধাপে ধাপে ইনস্টল নির্দেশনা, লাইসেন্স অ্যাক্টিভেশন নোট (ডেটা যা আছে তাই, নতুন কিছু আনা হবে না)।
- **Pay** — ফর্ম ফিল্ড, লেবেল, হেল্প টেক্সট, সফল/ব্যর্থ বার্তা আরও স্পষ্ট ও প্রফেশনাল।
- **Auth** — সেন্টার করা কার্ড, ভালো ইনপুট স্টাইল, লোডিং ও এরর স্টেট স্পষ্ট।

## ৩. Admin panel পালিশ

- সাইডবার: গ্রুপিং, active state, collapse-friendly স্পেসিং, নিচে থিম টগল।
- Overview: মেট্রিক কার্ডগুলো রেফারেন্সের মতো আইকন + লেবেল + বড় সংখ্যা + সাব-টেক্সট ফরম্যাটে।
- Licenses / Users / Payments টেবিল: হেডার, zebra rows, স্ট্যাটাস ব্যাজের সেমান্টিক রঙ, খালি অবস্থার সুন্দর empty state, লোডিং skeleton, মোবাইলে স্ক্রল-সেফ।
- Settings: ফর্ম সেকশনে ভাগ করা, সেভ ফিডব্যাক।

## ৪. কনসিস্টেন্সি

- একই radius, spacing scale, বাটন ও ব্যাজ ভ্যারিয়েন্ট সব পেজে।
- সব রঙ টোকেন থেকে — কোনো hardcoded রঙ নয়, তাই লাইট/ডার্ক দুটোতেই ঠিক দেখাবে।

## Technical Details

- `src/styles.css`: `:root` = light palette (oklch), `.dark` = বর্তমান ash-black/blue/green মান; gradient, glow, shadow টোকেন দুই মোডের জন্য আলাদা মান পাবে। `@theme inline` ম্যাপিং অপরিবর্তিত।
- নতুন `src/components/ThemeToggle.tsx` + ছোট `useTheme` হুক: localStorage (`wapilot-theme`) + `document.documentElement.classList`; `__root.tsx`-এ একটি inline pre-hydration স্ক্রিপ্ট দিয়ে FOUC এড়ানো, SSR-safe।
- টগল বসবে `src/components/landing/SiteChrome.tsx` হেডারে ও `src/routes/admin.tsx` সাইডবার ফুটারে।
- বাকি কাজ কেবল `className`/মার্কআপ স্তরে: `index.tsx`, `download.tsx`, `pay.tsx`, `auth.tsx`, `admin.*.tsx`। কোনো server function, query, route, বা `src/lib/*.ts` লজিক ছোঁয়া হবে না।
- টেবিল/কার্ডে বিদ্যমান shadcn প্রিমিটিভ ব্যবহার; দরকার হলে skeleton/empty-state ছোট presentational কম্পোনেন্ট যোগ।
- শেষে typecheck + প্রতিটি রুট লাইট ও ডার্ক দুই মোডে ব্রাউজারে যাচাই।
