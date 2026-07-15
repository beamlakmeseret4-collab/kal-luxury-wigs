# Getting Kal Luxury Wig Shop Online — Complete Beginner's Guide

Written for someone who has never done this before. Don't skip steps —
each one sets up something the next one needs. If a step doesn't say
"optional," it's required.

## The big picture (read this first)

Your project has **two separate programs** that work together:

- **Backend** — the "brain and warehouse." It stores your products, orders,
  and customers, and does all the behind-the-scenes work. Nobody sees this
  directly.
- **Frontend** — the actual website people visit and click around on.

You'll do this in three stages:

1. **Run everything on your own computer first**, so you can see it working
   and fix your settings before anyone else can see it. This is called
   running it "locally."
2. **Add your real business details** — Google Maps, TeleBirr, CBE, etc.
3. **"Deploy" it** — put it on the real internet with a real address
   anyone can visit, on servers that run 24/7 (your own computer being on
   doesn't count).

Budget about an hour for Parts 1 through 5 — don't rush the local setup,
since everything after it gets much easier once this part works.

A few words you'll see a lot, translated:

| Term | What it actually means |
|---|---|
| Terminal / Command Prompt | A black or white box where you type commands instead of clicking. Every computer has one built in. |
| `cd folder-name` | "Go into this folder" — how you move around inside the terminal |
| `npm install` | "Download all the pieces this program needs to run" |
| `localhost:3000` | A pretend website address that only exists on your own computer, for testing |
| `.env` file | A plain text settings file holding your passwords and keys — never shown on the actual website |
| API key | A password-like code that lets your site talk to another company's service (like Google Maps) |
| Deploy | "Publish this to the real internet" |

---

## PART 1 — Install the tools you need (one-time, ~15 minutes)

### 1.1 Install Node.js
This is the engine that runs your code.

1. Go to **nodejs.org**
2. Click the big button that says **LTS** (it may say something like
   "20.x.x LTS" — always pick LTS, not "Current")
3. Run the downloaded installer and click Next → Next → Install, keeping
   all the default options
4. Restart your computer if it asks you to

**Check it worked:**
- **Mac**: press `Cmd + Space`, type `Terminal`, hit Enter
- **Windows**: press the Windows key, type `Command Prompt`, hit Enter

In the black box that opens, type this and press Enter:
```
node -v
```
You should see something like `v20.11.0`. If you instead see an error
like "command not found," restart your computer and try again — Node
sometimes needs a restart to register properly.

### 1.2 Install a code editor (VS Code)
You'll use this to open and edit a few settings files.

1. Go to **code.visualstudio.com**
2. Download it for your operating system and install it (Next → Next → Install)

### 1.3 Unzip your project
1. Find the `kal-luxury-wigs.zip` file you downloaded (probably in your
   Downloads folder)
2. **Mac**: double-click it — it unzips automatically into a folder
   **Windows**: right-click it → "Extract All..." → Extract
3. Move the resulting `kal-luxury-wigs` folder somewhere easy to find,
   like your Desktop

### 1.4 Open the project in VS Code
1. Open VS Code
2. Click **File → Open Folder** (Mac: **File → Open...**)
3. Select the `kal-luxury-wigs` folder you just unzipped
4. You'll see two folders in the sidebar on the left: `backend` and `frontend`

Keep VS Code open — you'll use its built-in terminal for everything below.
To open it: **Terminal → New Terminal** in the menu bar. A black box will
appear at the bottom of the window — this is the same as the Terminal /
Command Prompt from step 1.1, just built into the editor for convenience.

---

## PART 2 — Create your free database (~10 minutes)

Your site needs somewhere to permanently store products, orders, and
customers. We'll use MongoDB Atlas, which has a genuinely free tier that's
plenty for a real small business.

1. Go to **mongodb.com/cloud/atlas/register** and create a free account
   (email/password, or sign in with Google)
2. It will ask you to create a cluster — choose the **free/shared (M0)**
   option, pick any region close to you (e.g., a European region if
   you're in Ethiopia — there usually isn't an African region yet), and
   click **Create**
3. It will prompt you to create a database user:
   - Username: anything, e.g. `kaladmin`
   - Password: click "Autogenerate Secure Password" and **copy it
     somewhere safe right now** — you won't see it again
   - Click **Create User**
4. Under "Where would you like to connect from," choose **Add My Current
   IP Address**, then also click **Add a Different IP Address** and enter
   `0.0.0.0/0` (this allows connections from anywhere — needed later once
   your backend is deployed to a server, not just your own computer).
   Click **Finish and Close**.
5. Once the cluster is ready (takes a minute or two), click **Connect** on
   your cluster
6. Choose **Drivers**
7. You'll see a connection string that looks like this:
   ```
   mongodb+srv://kaladmin:<db_password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Copy this whole thing somewhere temporary (a Notes app, anywhere) —
   you'll edit it in the next part.

---

## PART 3 — Set up the backend on your computer (~10 minutes)

1. In VS Code's terminal, type:
   ```
   cd backend
   ```
   and press Enter. This moves you into the backend folder.

2. **Create your settings file.** In VS Code's file sidebar, find the file
   called `.env.example` inside the `backend` folder. Right-click it →
   **Copy**, then right-click the `backend` folder → **Paste**. Rename the
   new copy from `.env.example copy` (or similar) to exactly `.env`
   (just a dot and the three letters, nothing else).

   *(Terminal shortcut instead, if you prefer: type `cp .env.example .env`
   on Mac, or `copy .env.example .env` on Windows, then press Enter.)*

3. Click to open `.env` in VS Code and edit these lines (leave everything
   else as-is for now):

   - **`MONGODB_URI`** — paste the connection string from Part 2, but:
     - Replace `<db_password>` (including the `<` `>`) with the real
       password you copied
     - Add your database name right after `.net/` and before the `?`,
       like this:
       ```
       MONGODB_URI=mongodb+srv://kaladmin:YourRealPassword@cluster0.xxxxx.mongodb.net/kal-luxury-wigs?retryWrites=true&w=majority
       ```

   - **`JWT_SECRET`** — this needs to be a long random string, used to
     keep login sessions secure. Generate one by typing this in the
     terminal (still inside the `backend` folder) and pressing Enter:
     ```
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
     Copy the long string it prints out and paste it as the value of
     `JWT_SECRET` in your `.env` file.

   - **`FIRST_ADMIN_PHONE`** — your own phone number, in the format
     `+251911234567`

   - **`FIRST_ADMIN_PASSWORD`** — a password you'll use to log into your
     admin dashboard. Pick something real — you'll use this in Part 5.

   - Leave `GOOGLE_MAPS_API_KEY`, `TELEBIRR_NUMBER`, `CBE_ACCOUNT_NUMBER`,
     etc. as their placeholder values for now — you'll fill those in
     during Parts 6–7. Nothing breaks by leaving them blank; those
     features just wait patiently until you add them.

   **Save the file** (Cmd+S or Ctrl+S).

4. Now install the backend's dependencies. In the terminal, type:
   ```
   npm install
   ```
   and press Enter. This downloads everything the backend needs — you'll
   see a lot of text scroll by, and it can take 1–3 minutes depending on
   your internet. Wait until you get your terminal prompt back (no more
   text moving). A few yellow "warnings" are normal and fine; red "error"
   text at the very end is not — if you see that, see the Troubleshooting
   section at the bottom of this guide.

5. Load your starter products into the database:
   ```
   npm run seed
   ```
   You should see something like `[seed] Inserted 26 products.`

6. Create your admin login:
   ```
   npm run create-admin
   ```
   You should see `[create-admin] Admin account created for +251911234567.`
   (using whatever phone number you set in step 3)

7. Start the backend:
   ```
   npm run dev
   ```
   You should see `[server] Kal Luxury Wig Shop API listening on port 5000`.

   **Leave this terminal window open and running** — closing it turns
   your backend off. Think of it like a lamp: it only stays on while this
   window is open.

**✅ Check it worked:** open a web browser and go to
`http://localhost:5000/api/health` — you should see a small block of text
that includes `"message":"Kal Luxury Wig Shop API is running."`

---

## PART 4 — Set up the frontend on your computer (~5 minutes)

Your backend needs to keep running, so open a **second** terminal window
for this part rather than closing the first one:
- In VS Code, click the **+** icon in the terminal panel to open a new tab,
  or go to **Terminal → New Terminal**

1. Move into the frontend folder (note: from the project's main folder,
   not from inside `backend`):
   ```
   cd frontend
   ```
   (If your new terminal opened inside `backend` instead, type `cd ..`
   first to step back out, then `cd frontend`.)

2. Create its settings file the same way as before: copy
   `.env.local.example`, paste it in the same `frontend` folder, rename
   the copy to exactly `.env.local`. The default values inside are
   already correct for local testing — nothing to edit here.

3. Install its dependencies:
   ```
   npm install
   ```
   Same as before — wait for it to finish (this one usually takes a
   little longer than the backend's).

4. Start the frontend:
   ```
   npm run dev
   ```
   You should see something like `Local: http://localhost:3000`

**✅ Check it worked:** open your browser to `http://localhost:3000` — you
should see your actual homepage, with your logo, hero section, and
products.

---

## PART 5 — Take it for a test drive

With both terminals still running in the background:

1. Browse to `http://localhost:3000` and click around — open a product,
   add it to your cart
2. Go to checkout, fill in a fake name/phone, choose **Cash**, choose
   **Pickup**, and place the order
3. Go to `http://localhost:3000/admin` and log in with the phone number
   and password you set as `FIRST_ADMIN_PHONE` / `FIRST_ADMIN_PASSWORD`
   in Part 3
4. Click **Orders** — your test order should be sitting right there

If all of that worked, your entire application is functioning correctly
end to end. Everything from here on is either configuration (adding real
business details) or deployment (putting it online) — no more code to run.

**To stop everything:** click into each terminal window and press
`Ctrl + C`. To start it all again later, repeat `npm run dev` in each
folder (you won't need `npm install`, `seed`, or `create-admin` again —
those were one-time setup steps).

---

## PART 6 — Get your Google Maps API key (~10 minutes)

This powers the "pin your delivery location on a map" feature at checkout.

1. Go to **console.cloud.google.com** and sign in with any Google account
2. At the top, click **Select a project → New Project**, name it
   something like "Kal Luxury Wig Shop," click **Create**
3. Once it's created and selected, use the search bar at the top and
   search for **"Maps JavaScript API"** → click it → click **Enable**
4. Search again for **"Geocoding API"** → click it → click **Enable**
5. In the left sidebar, go to **APIs & Services → Credentials**
6. Click **+ Create Credentials → API key** — a key will appear, copy it
7. **Important — restrict it** so nobody else can use your key: click on
   the key you just created, under "Application restrictions" choose
   **Websites**, and add:
   - `http://localhost:3000/*` (for testing)
   - your real domain once you have one, e.g. `https://kalluxurywigshop.com/*`

   Click **Save**.
8. Back in VS Code, open `backend/.env` and paste your key as the value of
   `GOOGLE_MAPS_API_KEY`
9. Restart your backend: click into that terminal, press `Ctrl + C`, then
   run `npm run dev` again

**✅ Check it worked:** start a checkout, choose Delivery, and you should
now see an actual interactive map instead of a plain text box.

*Google gives a monthly free credit that comfortably covers a small
store's traffic — you're unlikely to be charged anything early on, but
it's worth knowing a card is required to create the key at all.*

---

## PART 7 — Add TeleBirr, CBE, and (optional) Telegram alerts

**TeleBirr & CBE** — no application or approval needed for how this site
uses them. In `backend/.env`, just fill in your real:
```
TELEBIRR_NUMBER=+2519xxxxxxxx
CBE_ACCOUNT_NUMBER=1000xxxxxxxx
CBE_ACCOUNT_NAME=Your Name or Business Name
CBE_BRANCH=Your Branch Name
```
Customers will see these at checkout, pay you directly through their own
banking app, then upload a screenshot as proof — which lands in your admin
dashboard for you to confirm. Restart the backend after editing (`Ctrl+C`,
then `npm run dev`) for the change to take effect.

**Telegram order alerts (optional)** — get pinged on your phone the
instant an order comes in, on top of the dashboard. Full 7-step setup is
in `README.md` (Part 4), right inside your project folder — it takes about
two minutes with the Telegram app open.

---

## PART 8 — Put your website on the real internet

Right now, your site only works while your own computer is on and those
two terminal windows are running — nobody else can visit it. "Deploying"
puts copies of your backend and frontend on servers that run all the time,
with a real web address.

### 8.1 Create a GitHub account and upload your code
GitHub is where your code lives so the hosting services below can grab it.

1. Go to **github.com** and create a free account
2. Download **GitHub Desktop** from **desktop.github.com** and install it
   — this gives you a simple app instead of typing git commands
3. Open GitHub Desktop, sign in with your new account
4. Click **File → Add Local Repository**, choose your `kal-luxury-wigs`
   folder
5. It'll say the folder isn't a repository yet — click **create a
   repository** in that same message
6. Click **Publish repository** in the top bar. Untick "Keep this code
   private" if you don't mind it being public (doesn't affect security —
   your `.env` files with actual passwords are never uploaded, only the
   `.env.example` templates are). Click **Publish**.

Your code is now on GitHub. Any time you change something later, GitHub
Desktop will show the changes — click **Commit** then **Push origin** to
update it.

### 8.2 Deploy the backend (Render)
1. Go to **render.com**, sign up (you can sign in with your GitHub account
   directly, which is easiest)
2. Click **New → Web Service**
3. Connect your `kal-luxury-wigs` GitHub repository
4. Set:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Scroll to **Environment Variables** and add every line from your
   `backend/.env` file, one at a time (key on the left, value on the
   right) — yes, this means retyping them here; Render never sees your
   local `.env` file since it's not uploaded to GitHub
6. Click **Create Web Service**. Wait a few minutes for the first deploy.
7. Once it's live, copy the URL Render gives you, something like
   `https://kal-luxury-wigs-backend.onrender.com`

*Free tier note: Render's free web services fall asleep after 15 minutes
of no traffic and take ~30 seconds to wake back up on the next visit.
Fine for testing and early days; worth upgrading to a paid instance
(a few dollars a month) once you have regular customers.*

### 8.3 Deploy the frontend (Vercel)
1. Go to **vercel.com**, sign up with your GitHub account
2. Click **Add New → Project**, select your `kal-luxury-wigs` repository
3. Set **Root Directory** to `frontend`
4. Under Environment Variables, add:
   ```
   NEXT_PUBLIC_API_URL = https://kal-luxury-wigs-backend.onrender.com
   ```
   (your actual Render URL from step 8.2)
5. Click **Deploy**. In a minute or two you'll get a real live URL like
   `https://kal-luxury-wigs.vercel.app`

### 8.4 Connect the two together
Go back to your Render backend's **Environment** settings and update:
```
FRONTEND_URL = https://kal-luxury-wigs.vercel.app
```
(your actual Vercel URL). This tells your backend to accept requests from
your real site. Save — Render will redeploy automatically.

**✅ Check it worked:** visit your Vercel URL — your live site should load,
and you should be able to browse products and place a test order for real.

### 8.5 Point your own domain at it (once you've bought one)
- In Vercel: **Project → Settings → Domains** → add your domain, follow
  the on-screen instructions to update your domain's DNS records
  (wherever you bought the domain — Namecheap, Ethio Telecom, etc.)
- Once that's working, update `FRONTEND_URL` on Render and the two
  Google Maps website restrictions from Part 6 to your real domain instead
  of the `.vercel.app` one

---

## PART 9 — Final launch checklist

- [ ] Placed a full real test order yourself (all three payment methods,
      both delivery and pickup) on the *live* deployed site, not just locally
- [ ] Changed your admin password from whatever you first set it — log in,
      go to `/account`, click **Settings**, and use **Change Password**
      (works for admin logins too, not just customers)
- [ ] Added real product photos through the admin dashboard (Products →
      Edit) — the ones currently there are labeled placeholders
- [ ] Replaced the placeholder testimonials or removed that section
- [ ] Had a quick look at `/privacy`, `/terms`, and `/returns` — these are
      starting templates, not final legal text
- [ ] Confirmed Google Maps only works on your real domain (Part 6, step 7)
- [ ] Told a friend to try ordering something and watched what happened
      on your end

---

## If something breaks

- **`npm install` shows red errors** — usually a Node.js version issue.
  Run `node -v`; if it's below `v18`, reinstall Node from nodejs.org.
- **Backend won't start / mentions `MONGODB_URI`** — double check you
  replaced `<db_password>` completely (including removing the `<` `>`
  characters) and that the password doesn't contain a `@` or `#`
  character (regenerate a new password in Atlas if it does — those need
  special handling in the connection string).
- **Frontend loads but no products show up** — your backend probably
  isn't running, or `NEXT_PUBLIC_API_URL` in `frontend/.env.local` points
  to the wrong address. Locally it should be exactly
  `http://localhost:5000`.
- **"Can't log into admin"** — the phone number must be in the exact
  format `+251911234567` (with the `+`), matching what you set as
  `FIRST_ADMIN_PHONE` before running `npm run create-admin`.
- **Still stuck** — copy the exact red error text from your terminal and
  ask me directly; that error message almost always says exactly what's
  wrong.
