# Kal Luxury Wig Shop — Full-Stack E-Commerce Platform

A complete, production-ready online wig store: storefront, cart, checkout
(TeleBirr / CBE / Cash with photo payment-proof), delivery with Google Maps
location pinning or in-store pickup, customer accounts, and a full admin
dashboard with real-time order alerts (dashboard + Telegram).

```
kal-luxury-wigs/
├── backend/     Node.js + Express + MongoDB API
├── frontend/    Next.js 15 storefront + admin dashboard
└── docker-compose.yml   optional local dev stack
```

---

## 1. Before you do anything else

Read this once — it saves confusion later.

- **This code has not been run in a live environment yet.** It was written
  file-by-file and checked carefully for syntax and internal consistency,
  but it has never been through an actual `npm install` + `npm run dev`
  cycle (the environment it was built in has no internet access). Treat
  the *first* `npm install` + local run on your machine as the real first
  test — same as you'd do with code from any developer, human or AI.
- **TeleBirr and CBE do not have a public merchant API** you can just wire
  a key into — that access only comes after you register directly with
  Ethio Telecom / CBE. So payments here work the way you actually described:
  your TeleBirr number and CBE account are displayed at checkout, the
  customer pays you directly through their own banking app, uploads a
  screenshot as proof, and the order sits as **Pending Payment Verification**
  until you confirm it in the admin dashboard. This needs no merchant
  agreement and works immediately.

## 2. The only things you need to configure before launch

Everything else already works. These five (plus one database, see below)
are genuinely all that's left:

1. **Google Maps API key** — `backend/.env` → `GOOGLE_MAPS_API_KEY`
2. **TeleBirr number** — `backend/.env` → `TELEBIRR_NUMBER` / `TELEBIRR_ACCOUNT_NAME`
3. **CBE account details** — `backend/.env` → `CBE_ACCOUNT_NUMBER` / `CBE_ACCOUNT_NAME` / `CBE_BRANCH`
4. **Your logo** — already dropped in at `frontend/public/logo.png` (from the
   file you uploaded). Swap it any time by replacing that file.
5. **Your domain name** — used in `FRONTEND_URL` (backend) and
   `NEXT_PUBLIC_SITE_URL` (frontend) once you deploy.

**Plus:** a MongoDB connection string (`MONGODB_URI`). This isn't a business
credential like the five above — it's closer to "choosing a host," which
you'd do for any database-backed app. MongoDB Atlas has a free tier that
takes about 5 minutes to set up (steps below).

Until you add the Google Maps key, delivery orders automatically fall back
to a plain text address field — nothing breaks, it just upgrades
automatically the moment you add the key.

---

## 3. Run it locally

### Prerequisites
- Node.js 20 or newer
- A MongoDB database — either install MongoDB locally, or use a free
  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster
  (recommended, works the same locally and in production)

### Backend

```bash
cd backend
cp .env.example .env
# edit .env — at minimum set MONGODB_URI, JWT_SECRET, and FIRST_ADMIN_PASSWORD
npm install
npm run seed          # loads the starter product catalog (26 sample wigs)
npm run create-admin  # creates your first admin login
npm run dev            # starts the API on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# the default (http://localhost:5000) is correct if you're running the
# backend locally on its default port — otherwise update it
npm install
npm run dev            # starts the site on http://localhost:3000
```

Visit `http://localhost:3000` for the store, `http://localhost:3000/admin`
for the dashboard (log in with the phone/password from
`FIRST_ADMIN_PASSWORD` in `backend/.env`).

### Or with Docker

```bash
docker compose up --build
```
Then separately run `npm run seed` and `npm run create-admin` inside the
backend container once (`docker compose exec backend npm run seed`).

---

## 4. Setting up instant Telegram order alerts

This is optional but takes two minutes and means every new order pings your
phone immediately, in addition to appearing in the admin dashboard.

1. **Open Telegram** and message **[@BotFather](https://t.me/BotFather)**.
2. Send `/newbot`, give it a name (e.g. "Kal Orders Bot") and a username
   ending in `bot` (e.g. `kal_orders_bot`).
3. BotFather replies with a token that looks like
   `123456789:AAExampleTokenTextGoesHere`. Copy it.
4. Message **[@userinfobot](https://t.me/userinfobot)** — it replies with
   your numeric Telegram chat ID.
5. In `backend/.env`, set:
   ```
   TELEGRAM_BOT_TOKEN=the token from step 3
   TELEGRAM_CHAT_ID=the number from step 4
   ```
6. **Important:** open your new bot in Telegram and send it any message
   (e.g. "hi") once — bots can't message you first, so this step
   "unlocks" the conversation. Restart the backend after this.
7. Place a test order on the site — you should get a Telegram message
   within seconds.

Leave both values blank to skip this entirely; nothing else depends on it.
You can also enable email alerts the same way with the `SMTP_*` variables
in `.env`.

---

## 5. How admin access actually works

- Customers and admins are the same `User` model with a `role` field
  (`customer` or `admin`) — there's no separate login system to manage.
- The **only** way to become an admin is `npm run create-admin` (reads
  `FIRST_ADMIN_PHONE` / `FIRST_ADMIN_PASSWORD` from `backend/.env`) or by
  an existing admin creating one in the database directly. There's no
  public "become an admin" signup path.
- Every `/api/admin/*` and order-management route checks the JWT for
  `role: 'admin'` server-side (`middleware/auth.js`) — this isn't just a
  hidden frontend page, the API itself refuses these requests from
  ordinary customer accounts.
- The admin dashboard (`/admin`) is a completely separate layout from the
  storefront — no shared header/cart/nav — and redirects to `/admin/login`
  if you're not signed in as an admin.
- The moment an order is placed (any payment method, delivery or pickup),
  it's written to the database first, then the dashboard updates instantly
  over a live socket connection, and Telegram/email fire if configured.
  Nothing about receiving/storing the order depends on Telegram — that's
  purely an extra notification on top.

---

## 6. Deploying

A common, low-cost setup:

| Piece | Where | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Free tier is fine to start. Root directory: `frontend` |
| Backend | [Railway](https://railway.app) or [Render](https://render.com) | Root directory: `backend` |
| Database | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | Free tier (512MB) is enough to start |
| Images | Local disk (default) or [Cloudinary](https://cloudinary.com) | See note below |

Steps:
1. Push this whole folder to a GitHub repo.
2. **MongoDB Atlas**: create a free cluster → Database Access (create a
   user) → Network Access (allow `0.0.0.0/0`, or your host's IPs) → copy
   the connection string into `MONGODB_URI`.
3. **Backend (Railway/Render)**: point it at the `backend/` folder, set
   the environment variables from `backend/.env.example` in its dashboard,
   deploy. Note the URL it gives you (e.g. `https://kal-api.up.railway.app`).
4. **Frontend (Vercel)**: point it at the `frontend/` folder, set
   `NEXT_PUBLIC_API_URL` to the backend URL from step 3, deploy.
5. Back in the backend's env vars, set `FRONTEND_URL` to your new Vercel
   URL (needed for CORS), and redeploy the backend.
6. Run `npm run seed` and `npm run create-admin` once against the deployed
   backend (e.g. via Railway's shell, or temporarily point your local
   `.env` at the Atlas URI and run them from your machine).
7. Point your real domain at Vercel (and optionally a subdomain like
   `api.yourdomain.com` at the backend) once you're happy with everything.

**On image storage:** local disk storage (the default) works fine to
start, but most hosts wipe local files on every redeploy — so plan to add
Cloudinary (free tier, 3 env vars) before you rely on uploaded product
photos and payment screenshots sticking around long-term.

---

## 7. What's included

**Backend** — Express + MongoDB/Mongoose, JWT auth (customer + admin roles),
bcrypt password hashing, product catalog with full-text search and
faceted filtering, order management with a manual payment-proof-of-payment
workflow, Socket.IO for real-time admin order alerts, image uploads (local
disk by default, Cloudinary if configured), Telegram/email notifications
(optional), rate limiting, Helmet, Mongo sanitization, input validation,
CSV order export, a seed script with 26 sample products, and a script to
bootstrap your first admin account.

**Frontend** — Next.js 15 (App Router) + React 19, Tailwind CSS with a
custom brand design system, Framer Motion, Zustand (cart/UI state,
persisted), TanStack Query, and: a homepage, searchable/filterable shop
page, quick-view + full product pages with reviews and a wishlist, a cart
drawer, a multi-step checkout (payment method → proof upload →
delivery/pickup with a Google Maps location picker, gracefully degrading
to manual address entry if no Maps key is set yet → confirmation), guest
checkout, customer accounts (orders, saved addresses, wishlist), order
tracking by order number + phone, and a full admin dashboard (live order
feed, payment confirmation, status pipeline, driver assignment + delivery
map, product CRUD with image upload, banner management, revenue/analytics).

**Not included / left as a template on purpose:**
- Product photography — seed products use clearly-labeled on-brand
  placeholder images (`placehold.co`), not scraped competitor photos.
  Swap them for real photos via the admin dashboard before launch.
- Testimonials — the homepage testimonials section is explicit placeholder
  copy ("— Add customer name —"), not fabricated reviews. Replace with
  real customer feedback once you have some.
- Legal pages (`/privacy`, `/terms`, `/returns`) are starting templates,
  not reviewed legal documents — worth a quick pass by someone familiar
  with Ethiopian consumer-protection rules before you rely on them.

---

## 8. Security checklist before going live

- [ ] Set a long, random `JWT_SECRET` (never use the example value)
- [ ] Change `FIRST_ADMIN_PASSWORD` immediately after your first admin login
- [ ] Restrict your Google Maps API key by HTTP referrer (your domain) in
      the Google Cloud Console — it's meant to be public-facing, but should
      only work from your site
- [ ] Set `NODE_ENV=production` on the deployed backend
- [ ] Confirm `FRONTEND_URL` in the backend matches your real deployed
      frontend domain exactly (this is what CORS is locked to)
- [ ] Add Cloudinary if you want uploaded images to survive redeploys
- [ ] Enable MongoDB Atlas's automatic backups (on by default on most tiers)
