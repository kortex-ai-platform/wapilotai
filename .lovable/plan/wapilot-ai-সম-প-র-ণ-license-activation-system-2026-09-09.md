# Wapilot AI — সম্পূর্ণ License Activation System

বর্তমান সিস্টেম নতুন করে বানানো হবে না। বিদ্যমান database, admin login, payment, extension download এবং API রেখে production-ready license flow সম্পূর্ণ ও শক্ত করা হবে।

## বর্তমানে যা নিশ্চিতভাবে আছে

- Admin panel থেকে hashed, আলাদা license key তৈরি হয়; পুরো key database-এ রাখা হয় না।
- Plan, মেয়াদ, সর্বোচ্চ device, status, customer name/business এবং device binding ইতিমধ্যে আছে।
- প্রথম activation-এর সময় expiry গণনা, expired/suspended/revoked/blocked status, device reset ও removal backend-এ আছে।
- Extension secure backend API দিয়ে activate/validate/deactivate করে এবং কোনো privileged database key extension-এ নেই।
- গুরুত্বপূর্ণ সমস্যা: বর্তমান downloadable ZIP-এর `background.js` ও `popup.js`-এ license bypass আছে। ফলে backend ঠিক থাকলেও extension বর্তমানে license ছাড়া চালানো সম্ভব।

## চূড়ান্ত ব্যবহার-পদ্ধতি

```text
Admin তৈরি করবে আলাদা key
        ↓
Customer ZIP download ও install করবে
        ↓
৩ দিনের trial অথবা license activation screen
        ↓
Key + স্থায়ী device ID backend-এ যাচাই
        ↓
Valid → extension unlock, প্রথম activation থেকে সময় শুরু
Invalid / expired / revoked / offline → protected features সঙ্গে সঙ্গে lock
```

## ১. Admin license management

- Generate form-এ ১ দিন, ৭ দিন, ৩০ দিন, ৯০ দিন, ৩৬৫ দিন, custom days এবং Lifetime যোগ করা হবে।
- Plan, device limit, customer account, নাম, ফোন/WhatsApp, business name এবং internal note দিয়ে key তৈরি করা যাবে।
- Customer account থাকলে সেটির সঙ্গে license যুক্ত হবে; account না থাকলে নাম ও ফোন দিয়েও তৈরি হবে।
- Key তৈরির পরে একবারই পুরো key দেখাবে ও copy করা যাবে; পরে শুধু নিরাপদ prefix দেখা যাবে।
- List-এ activation date, expiry, remaining days, last validation, customer, device usage ও status পরিষ্কারভাবে দেখাবে।
- Admin suspend, revoke, block, reactivate, মেয়াদ বাড়ানো, device reset/removal এবং customer reassignment করতে পারবে।
- Delete-এর বদলে production-safe revoke প্রাধান্য পাবে, যাতে history হারিয়ে না যায়।

## ২. Extension activation ও কঠোর lock

- ZIP-এর hardcoded `isLicenseValid() => true` এবং activation screen লুকানোর bypass সম্পূর্ণ সরানো হবে।
- প্রথম install/open-এ activation/trial screen থাকবে; valid key বা active trial ছাড়া protected feature দেখা বা চালানো যাবে না।
- Popup খোলা, WhatsApp session শুরু এবং broadcast/auto-reply/schedule/WooCommerce-এর মতো প্রতিটি protected action-এর আগে backend validation হবে।
- Internet না থাকলে বা validation ব্যর্থ হলে সঙ্গে সঙ্গে lock হবে—কোনো offline grace period থাকবে না।
- Revoked, suspended, blocked, expired, wrong device ও device-limit-এর জন্য পরিষ্কার আলাদা বার্তা থাকবে।
- Service worker alarm দিয়ে নিয়মিত validation চলবে; invalid হলে cached active state মুছে extension lock হবে।
- Deactivate করলে শুধু বর্তমান device release হবে এবং admin-ও device release/reset করতে পারবে।

## ৩. Trial

- বর্তমান ৩ দিনের trial রাখা হবে এবং এক WhatsApp নম্বরে একবারই শুরু করা যাবে।
- Trial ও paid license একই lock rules মেনে চলবে।
- Trial শেষ হলে extension activation screen দেখাবে; protected automation বন্ধ থাকবে।
- Trial abuse কমাতে WhatsApp number-এর সঙ্গে device identity-ও রেকর্ড ও যাচাই করা হবে।

## ৪. Backend ও নিরাপত্তা

- Existing hashed-key lookup, server-only privileged access, RLS এবং admin role validation অক্ষুণ্ণ থাকবে।
- Activation, validation ও trial endpoints-এ strict input validation এবং bounded rate limiting যোগ হবে।
- License key কখনো URL, analytics metadata, console বা error message-এ লেখা হবে না।
- Admin action history যোগ হবে: কে key তৈরি, suspend/revoke, extend, assign বা device reset করেছে এবং কখন।
- Activation/validation আপডেটগুলো transaction-safe করা হবে, যাতে একই সময়ে request এলেও device limit অতিক্রম না করে।
- Expired status validation-এর সময় সঙ্গে সঙ্গে প্রয়োগ হবে; admin list-এ date অনুযায়ী কার্যকর status দেখাবে।

## ৫. Download ও replacement

- সংশোধিত extension source থেকে নতুন versioned `wapilot-ai.zip` তৈরি হবে এবং বর্তমান Download বাটন একই নামের নতুন ZIP দেবে।
- Extension-এর API URL stable published Wapilot AI endpoint ব্যবহার করবে, temporary preview ঠিকানা নয়।
- Version number বাড়িয়ে পুরোনো unlocked build থেকে upgrade স্পষ্ট করা হবে।
- Install/activation নির্দেশনায় trial, license entry এবং device-limit ধাপ সংক্ষেপে দেখানো হবে।

## ৬. যাচাই

- Admin থেকে ১ দিন, ১ মাস, custom এবং lifetime key তৈরি করে যাচাই।
- প্রত্যেক customer-এর key আলাদা এবং ভুল key reject হচ্ছে তা যাচাই।
- প্রথম activation-এ expiry শুরু, একই device revalidation, second-device limit এবং device release পরীক্ষা।
- suspend/revoke/expire/offline হলে popup ও background action সঙ্গে সঙ্গে lock হচ্ছে তা পরীক্ষা।
- Trial একবারই চলছে এবং expiry-র পরে lock হচ্ছে তা পরীক্ষা।
- নতুন ZIP download/install, console errors, TypeScript এবং public/admin route regression পরীক্ষা।

## Technical Details

- বর্তমান `licenses`, `license_devices`, `app_users`, `user_roles` কাঠামো extend করা হবে; কোনো existing data reset/delete হবে না।
- Admin mutations authenticated server functions এবং server-side role check ব্যবহার করবে।
- Extension-এর raw HTTP contract `/api/public/ext/*`-তেই থাকবে; privileged database credential শুধু server-side থাকবে।
- প্রয়োজনীয় schema change migration দিয়ে হবে; নতুন audit/rate-limit data RLS ও explicit grants সহ সুরক্ষিত থাকবে।
