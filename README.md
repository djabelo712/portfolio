# Djabon Ounimborbitibou · Personal Portfolio

My academic portfolio. Built with Next.js, TypeScript, Tailwind CSS, and a custom ivory-and-navy academic theme.

## What's on the site

- **Hero** · name, MSc credential (AIMS Ghana, Distinction), PhD-seeking badge, and key stats
- **About** · bio + quick-facts card (location, email, phone, current focus, recognition)
- **Projects** · 9 cards filterable by category (QKD / Algorithms / Simulation / Quantum ML / Hardware / Tools / Research)
- **Skills** · 25 skills across Quantum & QChem, Programming, Math & Theory, Tools
- **Timeline** · 15 entries: research, education, teaching, awards, training
- **Contact** · email CTA, social links, academic references

## How to add or update a project

All content lives in one file: **`src/lib/portfolio-data.ts`**.

### To add a new project

Open `src/lib/portfolio-data.ts`, find the `projects` array, and add a new entry:

```ts
{
  id: "my-new-project",       // unique id
  title: "My New Quantum Project",
  tagline: "One-sentence description.",
  description: "Longer 2–3 sentence description.",
  tags: ["Qiskit", "PennyLane"],
  category: "algorithm",      // qkd | algorithm | simulation | ml | hardware | tool | research
  github: "https://github.com/djabelo712/my-new-project",
  date: "2026-09",
  featured: true,             // optional · featured cards appear first
},
```

Save the file. The page hot-reloads automatically.

### To update an existing project

In the same `projects` array, find the entry by `id` and edit any field. For example, to update the description of the QAPINN project:

```ts
{
  id: "qapinn-wiser",
  title: "Quantum-Assisted Physics-Informed Neural Networks (QAPINNs)",
  description: "Updated description here...",
  // ...
}
```

### To add a GitHub project I haven't published yet

Two options:
1. **Push the project to GitHub first**, then add the `github:` URL to a project entry · the "Code" link appears automatically.
2. **Use a Google Drive link** instead (set `driveLink:` instead of `github:`) · the "Drive" button appears.

### To add a new skill

In the `skills` array, add:
```ts
{ name: "New Tool", level: 3, category: "tools" }
// level: 1 (Beginner) → 5 (Expert)
// category: "quantum" | "programming" | "math" | "tools"
```

### To add a new timeline entry (education, award, internship, etc.)

In the `timeline` array, add:
```ts
{
  id: "new-entry",
  date: "Sep 2026 · present",
  title: "PhD in Quantum Information",
  organization: "Target University",
  description: "What I am working on.",
  type: "education",   // education | research | teaching | award | training
}
```

### To add a CV PDF for download

1. Drop `CV.pdf` (or `resume.pdf`) into the `public/` folder.
2. In `src/lib/portfolio-data.ts`, set `resumeUrl: "/CV.pdf"` inside the `profile` object.
3. A "Download CV" button appears in the contact section.

### To enable LinkedIn / arXiv / Twitter

In the `profile` object, replace `undefined` with the actual URL:
```ts
linkedin: "https://linkedin.com/in/djabon-ounimborbitibou",
arxiv:    "https://arxiv.org/a/djabon_o_1",
twitter:  "https://twitter.com/djabelo712",
```
The "coming soon" placeholders disappear automatically.

## Run locally

```bash
bun install
bun run dev        # http://localhost:3000
bun run lint        # check code quality
```

## Deploy to Vercel (recommended · free for personal use)

### Step-by-step

1. **Create a GitHub repo**
   ```bash
   # Initialize git (if not done)
   git init
   git add .
   git commit -m "Initial portfolio"

   # Create the repo on github.com first, then:
   git remote add origin https://github.com/djabelo712/portfolio.git
   git branch -M main
   git push -u origin main
   ```

2. **Sign up at vercel.com** with your GitHub account.

3. **Import the repo**
   - Click "Add New Project" → select your `portfolio` repo.
   - Vercel auto-detects Next.js. Just click "Deploy".
   - In ~2 minutes you get a public URL: `portfolio-djabelo.vercel.app` (or similar).

4. **Custom domain (optional)**
   - In the Vercel dashboard → Settings → Domains.
   - Add a custom domain like `djabon.dev` (costs ~$15/year for the domain).

### Every time you push to GitHub, Vercel redeploys automatically.

So the workflow is:
1. Edit `src/lib/portfolio-data.ts` (add a project, update a skill, etc.)
2. `git push`
3. Vercel rebuilds in ~30 seconds · your live site is updated.

### Alternative deployments

- **Netlify**: drag-and-drop the build output. Free for personal use.
- **GitHub Pages**: requires `next.config.ts` static export. A bit more setup.
- **Cloudflare Pages**: similar to Vercel, free tier is generous.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui base
- EB Garamond serif + Geist sans (via `next/font/google`)
- Lucide icons

## Color palette

| Token              | Hex       | Use                            |
|--------------------|-----------|--------------------------------|
| Background (paper)  | `#FAF7F2` | Page background                |
| Ink (navy)         | `#1B2A4E` | Headings, primary buttons      |
| Copper (accent)     | `#B87333` | Links, highlights, badges      |
| Tan (border)        | `#E8E2D5` | Borders, dividers              |
| Highlight           | `#FBF6E9` | Subtle background highlights   |

Default theme is light. Dark theme is available via the toggle in the header.

---

© Djabon Ounimborbitibou. All rights reserved.
