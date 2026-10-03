# Crochet Studio

A static, cinematic 3D crochet site (Three.js + GSAP ScrollTrigger). No build step, no backend.

## Run locally
ES modules do not load from `file://`. From this folder run:

    python3 -m http.server 8000

then open http://localhost:8000

## Edit content (all in `script.js`, inside the `EDIT ME` block)
- `SITE`: title, owner, tagline, about and process text
- `COLORS`: page colours (the 3D scene uses the same palette)
- `AUDIO_CONFIG`: file paths and volumes
- `SOCIALS`: a link only shows if it has a value
- `selectedWork` and `websites`: see below

### Add a project
Copy this into the `selectedWork` array (mind the comma after the previous entry):

    {
      title: "My New Project",
      category: "CROCHET ART",
      description: "My project description.",
      url: "https://example.com",
      status: "ONLINE",
      featured: false,
      image: null,          // or "./assets/images/photo.jpg"
      year: "2026"
    },

### Edit a project
Change the values inside its `{ ... }` block.

### Delete a project
Remove its whole `{ ... }` block. Delete the clearly marked EXAMPLE block first.
An empty array (`[]`) shows "NO PROJECTS YET".

Websites work the same way in the `websites` array (`name`, `description`, `url`, `status`, `button`).

## Add audio
Put these files in `assets/audio/` (exact names, lowercase): `ambient.mp3`, `enter.mp3`,
`transition.mp3`, `hover.mp3`, `click.mp3`. See `assets/audio/README.txt`. Use only audio you
have the rights to. Without them the site simply stays silent.
Sound starts after the first click, tap or key press. The ON/OFF choice is stored in
`localStorage` under `crochet-sound`.

## Add images
Put images in `assets/images/` and reference them as `./assets/images/name.jpg`.

## Deploy to GitHub Pages
1. Create a GitHub repository and upload the contents of this folder
   (`index.html` must be at the repository root).
2. Repository **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, Save.
4. After a minute the site is live at `https://YOUR-USER.github.io/YOUR-REPO/`.

All paths are relative (`./assets/...`), so the repository sub-path works.

## Notes
- Three.js and GSAP load from the jsDelivr CDN, so visitors need internet access.
- `prefers-reduced-motion` removes sway, floating, strand animation and card tilt.
- On phones the particle count, pixel ratio, shadows and stitch count are reduced.
