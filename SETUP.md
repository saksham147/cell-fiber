# CellFiber website – setup

Plain HTML, CSS and JS. No server code, no database.
The contact form is handled by Netlify Forms and sent to an email address.

## Content to fill in

Everything shown in grey italic with a dashed border (`class="ph"`, `ph-title`, `ph-list`)
is a placeholder in `index.html`. Replace the text and remove the class.

| Where | What to add |
|---|---|
| Hero | tagline |
| Products | 4 categories, their products/grades, images (replace `<div class="card__img img-ph">Image</div>` with `<img class="card__img" src="images/…" alt="…">`) |
| Product dropdown in the form | same 4 category names |
| Sustainability | intro + 2 points |
| About | 2 paragraphs, 2 images (`about__img`) |
| Stats | real numbers in `data-target="…"` and the text below |
| Terms / Privacy modals | full legal text |

## Form → email

1. **Deploy**: drag the `cellfiber` folder into Netlify (app.netlify.com → Add new project → Deploy manually).
   Git or the Netlify CLI also work.
2. **Project configuration → Forms → Enable form detection**, then deploy again.
   The form appears as `contact`.
3. **Project configuration → Notifications → Emails and webhooks → Form submission notifications
   → Add notification → Email notification** → form `contact` → **sakshamgupta5050@gmail.com**.
   Add another notification for each extra address that should get a copy.
4. Fill in the form once on the live site to test. The first email may land in spam – mark it "Not spam".

Every enquiry is also saved under **Forms → contact** in the Netlify dashboard, with a CSV download.
