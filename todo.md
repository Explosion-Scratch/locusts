- Tooltips for regular text don't work, make sure to properly show [text like this](with tooltips) correctly. 
- Make the entire page smaller, base typography should be about 80% what it is right now
- Increase page width
- When hovering over a dot highlight the SENTENCE that contains that time not the entire paragraph
- Allow hovering over the date inline in the text and show the alt title and highlight the dot.
- The underline on the header should apply to all the title text not just the first line
- Demonstrate citations
- Use a cool ocean blue as the accent color
- For the timeline don't inset the paragraph with the timeline, instead keep it the same width and place the timeline to the side.
- Demonstrate banner with the lotus.png image.
- Allow clicking on headers to add them to the url (via hash)
- Use a beautiful but subtle effect on link underline
- Use Fraunces ExtraBold 800 for the title header and Regular 400 italic for the subtitle.
- Make the header playful, e.g. playful shadow and hover effects, very thoughtfully implemented but subtle - be creative here.
- Use light theme for the tooltips
- Use this for animated link underlines but adapt to the theme:

a {
    text-decoration: none;
    background-image: linear-gradient(currentColor, currentColor);
    background-position: 0% 100%;
    background-repeat: no-repeat;
    background-size: 0% 2px;
    transition: background-size .3s;
}

a:hover, a:focus {
    background-size: 100% 2px;
}

- Show side content when that paragraph is in close to the center of the screen. Make it much smaller and less padded as well
- Place table of contents subtly on the left and fade it mostly out unless we hover.
- Demonstrate Image Carousel - Use the lotus.png and flowers2.png
- For Hover text allow it to be inline isntead of taking up its own separate line (inline-block). Create a beautiful but different underline effect for Hover.
- Demonstrate all components.

## MOre todo
- Follow this guide to use an animated indicator on the table of contents - https://kld.dev/toc-animation/
- Add more padding above the top header. 
- Shrink the size of the table of contents as well - 
- Use EB Garamond for the font on the table of contents (configure weight and italics based on the header level)
- For tooltips, use hover style 15 (squiggly line) underneath and animate it. This should be 2px thick and a variation of the accent color (hue rotate)
- For regular links use hover style 1 (just adopt the current hvoer effect so it can go the other way as well)
- Decrease line spacing on bullet points, it's too much
- Make the image carousel smaller, make the icons more subtle, animate the indicators better, center the images and add tasteful box shadow. Don't show the total number
- Make references and citations smaller and decrease their line height.
- Upon hover of the title begin an animation that ripples each letter. Split up the header into individual spans then animate. Make it subtle but playful.
- For the Spanner also do this same sort of effect on hover but very subtle. We can probably do this natively with CSS and computed animation delay and index attrs
- Render HTML in citations, currently it shows '<em>' as plaintext
- Remove the hash symbol for the headers but still allow them to be clickable.
- On hover of headers subtly and gently increase the letter spacing
- On hover of a Time inside the text, don't show the tooltip for that dot in the timeline in the timeline, only show the tooltip over the text itself. Decrease the page max width slightly (by 150px) and shrink header size as well and the padding below and above them.
For the sidebar content, increase its width (in correspondance to the decrease in page width). Also for mobile require clicking to reveal this hint, then show it at the bottom of the screen as we do now, then click again to hide. Currently it always shows. Add a small dot in the top rigth corner menu for the table of contents on mobile.