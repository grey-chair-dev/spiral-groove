# Google Analytics (GA4) for the monthly report

The monthly business report (sent on the 1st of each month) can include a **Google Analytics** section: sessions, users, page views, and top pages for the previous month.

You can enable GA in the report in two ways:

- **Option A (below):** Use a **service account** in this app — no extra tools; the cron and email stay in the app. Requires Google Cloud setup and a **service account JSON key**. **Not available** if your org disables service account key creation (e.g. `iam.disableServiceAccountKeyCreation` on greychair.io / grey-chair-digital). To allow keys for one project, see [Changing the org policy (allow keys for a project)](#changing-the-org-policy-allow-keys-for-a-project).
- **Option B (recommended if keys are disabled):** Use **Make.com with OAuth** — no service account, no keys. You sign in to Google once in Make; Make fetches GA and can build/send the full report. See [Option B: Use Make.com (no service account)](#option-b-use-makecom-no-service-account).

### Changing the org policy (allow keys for a project)

If your org has **Disable service account key creation** enforced and you have permission to override it for one project (e.g. grey-chair-digital):

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select the **organization** (greychair.io) or the **project** (grey-chair-digital).
2. Go to **IAM & Admin** → **Organization policies** (or search for “Organization policies”).
3. Find the constraint **`iam.disableServiceAccountKeyCreation`** (e.g. search “service account key”).
4. Open it and click **Manage policy** / **Edit**.
5. Choose **Override parent’s policy** (so this applies only to the selected project/folder, not the whole org).
6. Set the policy to **Not enforced** for that project.
7. Save.

**Permissions required to edit org policies:**  
`orgpolicy.policy.get`, `orgpolicy.policies.create`, `orgpolicy.policies.delete`, `orgpolicy.policies.update`.  
The **Organization Policy Administrator** role (`roles/orgpolicy.policyAdmin`) includes these.  

**Permissions required to simulate policy changes (optional):**  
`policysimulator.orgPolicyViolationsPreviews.create`, `orgpolicy.customConstraints.get`, `orgpolicy.policies.list`, `cloudasset.assets.searchAllResources`, `cloudasset.assets.listResource`, `cloudasset.assets.exportResource`.

**If you’re the org admin — where to change it**

1. In [Google Cloud Console](https://console.cloud.google.com/), use the **project/organization dropdown** at the top and select your **organization** (e.g. **greychair.io**), not the project. If you only see projects and no org, open [Cloud Resource Manager](https://console.cloud.google.com/cloudresourcemanager) and select the org there first.
2. Go to **IAM & Admin** → **Organization policies** (or search the top bar for **Organization policies**).
3. In the list, find **Disable service account key creation** (constraint `iam.disableServiceAccountKeyCreation`) and open it.
4. Click **Manage policy** (or **Edit**). You should see the effective policy and an option to add an **Override**.
5. Click **Add rule** / **Override** and set the **Policy for** scope to the **grey-chair-digital** project (or the folder that contains it). Set the rule to **Allow** / **Not enforced** so key creation is allowed for that project only. Save.

If you don’t see **Manage policy** or **Add rule**, confirm you’re viewing as the org (not a project) and that your user has **Organization Policy Administrator** at the org level (check **IAM & Admin** → **IAM** with the org selected).

**Why you might still not be able to change it**

- **Role is on the project only** — Overriding an org-level policy requires the role on the **organization** (or a folder above the project), not only on the project.
- **Wrong scope in the console** — The policy list and **Manage policy** must be opened with the **organization** (greychair.io) selected in the top bar; if a project is selected, override options may be missing or read-only.

After the override is in place, you can create a service account JSON key in **grey-chair-digital** and use Option A.

---

Your site already uses **GA4 Measurement ID** `G-7VV4DCV276` for front-end tracking. The **GA4 Data API** (used for server-side reporting) does **not** support API keys — only **service accounts** or **OAuth**. So you either use a service account in this app (Option A) or Make.com’s OAuth connection (Option B).

---

## Option B: Use Make.com (no service account)

If you prefer **not** to use a service account, you can use **Make.com’s Google Analytics 4** connector, which uses **OAuth** (you log in with your Google account once; no JSON key).

**Flow:**

1. In Make, create a scenario that runs on the 1st of each month (e.g. Schedule trigger).
2. Add the **Google Analytics 4** module and connect your Google account (OAuth). Use it to get report data for the previous month (sessions, users, page views, top pages) for property **516751405**.
3. Add an **HTTP** module to call this app’s **report data API** (sales, newsletter, events, inventory):  
   - URL: `GET https://spiralgrooverecords.com/api/monthly-report-data?secret=YOUR_SECRET`  
   - Or use header: `x-monthly-report-secret: YOUR_SECRET`  
   Set `MONTHLY_REPORT_DATA_SECRET` in Vercel and use the same value as `secret` or in the header when calling from Make.
4. Combine GA4 output + report data in Make, build the HTML email (same layout as the Google review email), and send it via your email module (From: projects@greychair.io, To: owner).

**Result:** One monthly email with Sales, Newsletter, Events, Inventory, and Google Analytics — no service account and **no service account keys** (works when your org has `iam.disableServiceAccountKeyCreation` enforced). To avoid sending the report twice, either turn off the Vercel cron for `/api/monthly-report` or leave the app’s report without GA (no `GA4_*` env vars) and use only Make to send the full report.

---

## Option A: Service account (in this app)

### 1. Get your GA4 Property ID

1. Go to [Google Analytics](https://analytics.google.com/) and select the property that receives data from spiralgrooverecords.com (the one with measurement ID `G-7VV4DCV276`).
2. Click **Admin** (gear icon, bottom left).
3. Under **Property**, click **Property settings**.
4. Copy the **Property ID** — it’s a number. For Spiral Groove Records it is **516751405**. This is **not** the Measurement ID (`G-7VV4DCV276`).

---

### 2. Google Cloud: enable API and create service account

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project or select an existing one (e.g. “Spiral Groove” or “Greychair”).
3. **Enable the API**
   - Go to **APIs & Services** → **Library**.
   - Search for **Google Analytics Data API**.
   - Open it and click **Enable**.
4. **Create a service account**
   - Go to **APIs & Services** → **Credentials**.
   - Click **Create credentials** → **Service account**.
   - Name it (e.g. `monthly-report-ga4`), then **Create and continue** (no roles needed here) → **Done**.
5. **Create a key**
   - Open the new service account.
   - Go to the **Keys** tab → **Add key** → **Create new key** → **JSON** → **Create**.
   - Save the downloaded JSON file; you’ll use its contents in the next step.

---

### 3. Give the service account access in GA4 (required — otherwise you get PERMISSION_DENIED)

1. In the JSON file, find `"client_email"` — it looks like `something@grey-chair-digital.iam.gserviceaccount.com`.
2. In [Google Analytics](https://analytics.google.com/) → **Admin** (gear, bottom left) → **Property** column → **Property access management**.
3. Click **+** (Add users).
4. Paste the **client_email** address from the JSON.
5. Role: **Viewer** (read-only).
6. Click **Add**.

If you skip this step, the report will show "Google Analytics not configured" and the server log will show: `PERMISSION_DENIED: User does not have sufficient permissions for this property`.

---

### 4. Set environment variables

In **Vercel** (or your host) → Project → **Settings** → **Environment Variables**, add:

| Name | Value | Notes |
|------|--------|--------|
| `GA4_PROPERTY_ID` | `516751405` (Spiral Groove Records) | From step 1. |
| `GA4_SERVICE_ACCOUNT_JSON` | The **entire contents** of the JSON key file | One line or pretty-printed; must be valid JSON. |

- **GA4_PROPERTY_ID**  
  - Value: only the number, no `properties/` prefix.  
  - For Spiral Groove Records: `516751405`.

- **GA4_SERVICE_ACCOUNT_JSON**  
  - Value: paste the full JSON from the downloaded key file (all keys: `type`, `project_id`, `private_key_id`, `private_key`, `client_email`, `client_id`, etc.).  
  - In Vercel you can paste multi-line JSON; the app will parse it.

Optional (already have defaults):

- `MONTHLY_REPORT_RECIPIENTS` or `REPORT_EMAIL` — who receives the report (e.g. `brendan@greychair.io`).
- `MONTHLY_REPORT_FROM` — default `projects@greychair.io` for the “From” address.

---

### 5. Verify

After the next run of the monthly report (cron on the 1st, or a manual test):

- The report email should include a **Google Analytics** section with sessions, users, page views, and top pages.
- If the section says “Google Analytics not configured or unavailable”, check:
  - `GA4_PROPERTY_ID` is set and numeric.
  - `GA4_SERVICE_ACCOUNT_JSON` is valid JSON and contains `client_email` and `private_key`.
  - The service account email has **Viewer** access on the GA4 property.
  - The **Google Analytics Data API** is enabled in the same Google Cloud project as the service account.

---

### Summary (Option A)

| What | Where |
|------|--------|
| Property ID | GA4 Admin → Property settings |
| Service account JSON | Google Cloud Console → Credentials → Service account → Keys |
| GA4 access for service account | GA4 Admin → Property access management → Add user (Viewer) |
| Env vars | Vercel (or host) → Settings → Environment Variables |

No code changes are required; the monthly report already uses these env vars when present.
