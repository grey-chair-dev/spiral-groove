# Google review reply flow (Make.com only)

The review-notification and reply flow lives entirely in Make.com. This app does not host any form or API for it.

## Flow in Make

1. **Watch reviews** (Google My Business) → new review.
2. **OpenAI** → generate suggested reply from review text.
3. **Router**
   - **Stars > 3:** Post suggested reply to Google (Create/update a reply).
   - **Else (e.g. ≤ 3 stars):** Send internal email to owner; email is built in Make (HTML).

## Email (built in Make)

- **From:** Your SMTP/email connection in Make.
- **To:** Owner (e.g. brendan@greychair.io or adam@spiralgrooverecords.com).
- **Subject:** e.g. `New Google review – {{2.starRating}} stars`
- **Content type:** HTML.

Include in the email:

- Review details: reviewer name, rating, review text, date.
- **Suggested reply** (e.g. `{{6.result}}`).
- **“Post this reply”** link: webhook URL that posts the suggested reply to Google (you manage the business profile).
- **“Edit”** link: opens a form so the store owner can change the reply and submit their own text (same webhook; you still post to GMB).

## “Post this reply” link (Make-only)

Use a **second Make scenario** triggered by **Webhooks → Custom webhook**:

- **Webhook URL:** `https://hook.us2.make.com/vp5fdupao3oxo5y9p5gkl7a3irl0r7mq`
- **Link in email:**  
  `https://hook.us2.make.com/vp5fdupao3oxo5y9p5gkl7a3irl0r7mq?reviewId={{2.name}}&response={{6.result}}`  
  Make has no `encodeUriComponent`; if the reply contains `&`, `?`, `=`, or spaces the GET link may break—use a simple HTML form that POSTs to the webhook for long or special-character replies.

When the webhook runs:

- Read `reviewId` (GMB review name) and `response` (reply text) from the request.
- **Google My Business – Create/update a reply:**  
  Review name = `reviewId`, Reply comment = `response`.

Optional: add a **secret token** in the webhook URL (e.g. `?token=SECRET&...`) and in the webhook scenario check that token so only your email link can trigger it.

## Email HTML

- No “View on Google” link (you manage the profile; owner doesn’t need the review page).
- **Post this reply** = direct webhook link with `reviewId` and `response`.
- **Edit** = link to your hosted “edit reply” form with `reviewId` and optional `response` (pre-fill); owner edits and submits to the same webhook.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Google review</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.5; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 1.25rem; margin-bottom: 16px;">New Google review</h1>

  <div style="margin-bottom: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
    <p style="margin: 0 0 8px;"><strong>Reviewer:</strong> {{2.reviewer.displayName}}</p>
    <p style="margin: 0 0 8px;"><strong>Rating:</strong> {{2.starRating}} stars</p>
    <p style="margin: 0 0 8px;"><strong>Date:</strong> {{2.createTime}}</p>
    <p style="margin: 0;"><strong>Review:</strong><br>{{2.text}}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p style="margin: 0 0 8px; font-weight: 600;">Suggested reply</p>
    <p style="margin: 0; padding: 12px; background: #f0f7ff; border-left: 4px solid #2563eb; border-radius: 4px;">{{6.result}}</p>
  </div>

  <p style="margin-bottom: 8px;">
    <a href="https://hook.us2.make.com/vp5fdupao3oxo5y9p5gkl7a3irl0r7mq?reviewId={{2.name}}&response={{6.result}}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Post this reply</a>
    <span style="margin-left: 8px;">
      <a href="https://spiralgrooverecords.com/edit-reply?reviewId={{2.name}}&response={{6.result}}" style="display: inline-block; padding: 10px 20px; background: #64748b; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Edit</a>
    </span>
  </p>
</body>
</html>
```

Edit button points to **https://spiralgrooverecords.com/edit-reply** (hosted on the site).

## Edit-reply page (spiralgrooverecords.com)

Live at **https://spiralgrooverecords.com/edit-reply**. Implemented in the site (see `src/components/EditReplyPage.tsx`). Owner can change the reply text and submit; the form POSTs `reviewId` and `response` to the same Make webhook.

**Protected / not public:** The page is only useful when opened from the email link (it requires `reviewId` in the URL; otherwise it shows “Invalid link”). It is **not** in the sitemap, is **Disallow: /edit-reply** in `robots.txt`, and sends **noindex,nofollow** (Vercel header + meta on the page).

Standalone HTML equivalent for reference:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edit reply</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; max-width: 520px; margin: 0 auto; }
    label { display: block; font-weight: 600; margin-bottom: 6px; }
    textarea { width: 100%; min-height: 120px; padding: 12px; border: 1px solid #ccc; border-radius: 6px; font: inherit; box-sizing: border-box; }
    .btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; margin-top: 12px; }
    .btn:hover { background: #1d4ed8; }
    p { margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>Edit reply</h1>
  <p>Change the reply below, then click Submit. We’ll post it to the Google review (we manage the business profile).</p>
  <form id="editForm" method="post" action="https://hook.us2.make.com/vp5fdupao3oxo5y9p5gkl7a3irl0r7mq" target="_blank">
    <input type="hidden" name="reviewId" id="reviewId">
    <label for="response">Your reply</label>
    <textarea name="response" id="response" required placeholder="Type or paste your reply…"></textarea>
    <button type="submit" class="btn">Submit reply</button>
  </form>

  <script>
    var params = new URLSearchParams(window.location.search);
    document.getElementById('reviewId').value = params.get('reviewId') || '';
    var response = params.get('response');
    if (response) document.getElementById('response').value = response;
  </script>
</body>
</html>
```

- **Edit** link from email: `https://spiralgrooverecords.com/edit-reply?reviewId={{2.name}}&response={{6.result}}` (pre-fill may break on special characters; owner can still type).
- Webhook receives POST body: `reviewId`, `response` — same as the “Post this reply” scenario.

## Summary

| Piece              | Where        |
|--------------------|--------------|
| Watch reviews      | Make scenario |
| AI suggested reply | Make (OpenAI) |
| Router             | Make          |
| Email to owner     | Make (Send Email) |
| “Post this reply”  | Make webhook URL in email |
| Post reply to GMB  | Make scenario (webhook → GMB module) |

No routes, env vars, or templates in this app are used for this flow.
