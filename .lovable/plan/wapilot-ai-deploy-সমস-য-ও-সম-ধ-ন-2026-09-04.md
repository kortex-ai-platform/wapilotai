# Wapilot AI — Deploy সমস্যা ও সমাধান

## সমস্যা কী

আপনার screenshot-এ Vercel-এ GitHub থেকে import করে Deploy করার চেষ্টা দেখা যাচ্ছে। Deploy আটকে যাওয়ার কারণ:

- এই প্রজেক্টের সার্ভার (login, license API, payment, admin panel) **Cloudflare Workers** runtime-এর জন্য build হয় — Vercel-এর জন্য নয়।
- Vercel-এর "TanStack Start" preset অনেকটা ভিন্ন ধরনের setup আশা করে, তাই build/output মেলে না এবং Deploy ব্যর্থ হয়।
- Environment variables (database সংযোগের চাবি) Vercel-এ আলাদা করে বসাতে হয় — না দিলে site চললেও login/license কাজ করবে না।

## সুপারিশ: Lovable Publish ব্যবহার করুন (সবচেয়ে সহজ)

আপনার app আসলে **এখনই publish করা সম্ভব** — কোনো Vercel দরকার নেই:

1. Lovable-এর Publish বাটনে এক ক্লিকে app live হয়ে যাবে: **wapilotai.lovable.app**
2. Database, login, license system, payment — সব কিছু নিজে থেকেই কাজ করবে (Vercel-এ এগুলো আলাদা configure করতে হতো)
3. ইচ্ছা হলে পরে নিজের domain (যেমন wapilotai.com) যুক্ত করা যাবে — Project Settings → Domains থেকে

## যদি Vercel-তেই deploy করতে চান

সেক্ষেত্রে এই কাজগুলো লাগবে (ঝামেলা বেশি, সময় বেশি):

1. Build output-টা Vercel-এর serverless format-এ ঠিক করা (vite config-এ nitro target পরিবর্তন)
2. Vercel-এ সব environment variables হাতে বসানো (database URL + keys)
3. Build command ও output directory Vercel project settings-এ ঠিক করা
4. তারপরও extension API ও server functions ঠিকমতো চলছে কিনা আলাদা করে test করা

## পরিকল্পনা

**প্রস্তাবিত পথ:** Vercel বাদ দিয়ে Lovable থেকে Publish করি — কারণ আপনার পুরো backend (database, auth, license, payment) Lovable Cloud-এর সাথে ready।

আমি যা করবো:

1. Publish-এর আগে সব page একবার check করে নেবো (landing, download, pay, auth, admin)
2. Website-এর title ও description ঠিক আছে কিনা নিশ্চিত করবো
3. আপনার অনুমতি নিয়ে Publish করবো
4. Publish-এর পর live site-এ login, license activation, payment page test করে দেখবো

> Vercel deploy করাই যদি আপনার জরুরি হয় (যেমন নিজের GitHub workflow), সেটাও করা যায় — তবে সেক্ষেত্রে প্রথম অপশনটাই সবচেয়ে নিরাপদ ও দ্রুত।
