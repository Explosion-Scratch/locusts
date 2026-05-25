## Formatting and design
- Format like a NYT news / opinion article. Use snesible serif typography thoughout - Compile markdown to HTML via MDX
- Give links a slide underline effect and show their destination as a tooltip on hover. 
- Responsive and mobile friendly but desktop first
- For images create a blurhash and then lazily load them
- The article frontmatter has title, subtitle, date, and author.
- Inspiration: Opinion columns in news sites
- Beautiful and expressive typography
- For the title center it, use a semibold serif font and then add an underline behind it. This underline should be a translucent version of the accent color
- For the subtitle use a light font weight, clickable author going to the homepage index, show date, on date hover show how long ago in. natural language that was
- Don't use overly rounded corners
- Use https://css-tricks.com/snippets/css/fluid-typography/ fluid typography but use a custom less function to implement fluid typorgraph so I can do @font-size([em unit where 1em is normal text size, but then fluidly scale])
- Use New Computer Modern as the font

## MDX
- Create components in a components directory, components should be written in VueJS

## Components
- Allow giving elements a tooltip, if I write [text](more **text** here that's not a link) it should show that inside a tooltip
- Image Carousel, when writing things like this, show left / right arrows, smoothly animate slide on click, show indicator at bottom w/ total number of image, show captio for caption:

---
- ![image figcaption](https://path/to/file1.img)
- ![image figcaption](https://path/to/file2.img)
---

Render a custom image carousel using a custom component.
- Show a table of contents and show the active section. Allow clicking on the various sectiosn to jump, properly nest given headlines & figures.
- Hover, takes markdown and then displays something else to the side when we hover. When clicking on mobile display the content in a tooltip but on desktop when hovering display the markdown content to the side of the main page, e.g. <Hover text="_Polyphenism_ is a good example">![Image caption](./path/to/img)</Hover> - show similarly to a comment on a google doc - to the side of the main page
- Allow citations in native markdown syntax, when hovering over a citation note show which citation it is, then allow clicking on it to jump to the bottom of the page with the index of citations.
- SidebarTimeline - On the left side of a paragraph wrapped in SidebarTimeline show a subtle vertical timeline from the start to the end date mentioned in the paragraph. Add dots for the start & end dates and the events mentioned. The height of this should be the height of the paragraph with earlier dates higher. On hover of each of these events highlight the corresponding sentence of the paragraph. Usage:

<SidebarTimeline>

In <Time alt="Einstein travels to Bern Patent Office">1911</Time> after spending a year in Berlin, Einstein travelled to the _Bern Patent Office_ as a technical expert.
<!-- In this example we should parse and show 1911 in the timeline - use chrono node to parse in build stage - then when we hover on the sentence highlight that dot in the timeline, and when we hover on the dot in the timeline highlight the entire sentence and show the tooltip w/ Einstein travels to Bern Patent Office-->

</SidebarTimeline>
- <Spanner height=128px srcs=[array of image assets] w=[width for each] repeating|random, default repeating overlap=0.1-1 jump?> - Break the text and display a full page width (viewport width not within max-width, full viewport widht) spanner of the set images in a repeating or random order. For overlap 0 means all images would be directly on top of each other and 1 means that they would just be set directly next to each other. Each image should have an alternating up and down y position within the spanner (or random if random) and should overlap the previous iamge. The intent is a playful spanner across the page with a configurable height. Think of for instance using several images of beads as a spanner or several different pictures of seashells. Optional `jump` makes images clickable: they arc off the page (left/right from asset path) and are removed from the DOM.

## Architecture
- Vite
- VueJS
- Less.js for styling
    - Variables for accent (used for link)
    - Background color
    - Text color - for page
    - Page max width
- Output one HTML file per page, also create a barebones index page showing a listing of all articles and tooltips about them on hover and fuse.js fuzzy search of all the articles.
- Try to bundle everything, don't rely on CDNs much.
- Create an image uploader page which I can serve via script that allows me to paste in a URL to an image or paste an image itself, then name the image (give it a slug and caption) then that image is uploaded to the assets properly. For each image store the blurhash (compute), width, height and alt. If no alt is provided for an image when using in markdown then the image's configured alt.
