# Mechatronics Portfolio Website

Visit: https://azzamjhd.github.io

## Edit Content From GitHub

All portfolio content is loaded from:

- assets/config.json

You can edit this file directly in GitHub and commit changes without touching HTML or CSS.

### Main Config Sections

- site: name, tagline, summary, social links
- about: intro and highlight bullets
- skills: matrix grouped by domain (Mechanical, Electrical, Software)
- experience: timeline-style role entries
- projects: mechatronics projects with stack and photo gallery
- contact: message and email

## Add or Replace Project Photos

1. Put images inside assets/images/projects/<project-slug>/
2. Reference each image in assets/config.json under projects[].photos
3. Use relative paths only, for example:

```json
{
	"src": "assets/images/projects/line-follower/overview.jpg",
	"alt": "Line follower robot on track",
	"width": 1200,
	"height": 800
}
```

## Notes

- If an image path is wrong, the site automatically shows assets/images/fallback.svg.
- If assets/config.json fails to load, the page shows fallback content with a warning banner.
- External links are opened safely using noopener and noreferrer.

## Template Attribution

This site directly adopts the visual template from:

- https://github.com/codewithsadee/vcard-personal-portfolio

License:

- MIT License (copyright codewithsadee)
- Included in this repository as THIRD_PARTY_LICENSE_vcard.txt

The project structure and styling are based on the template, while content rendering is connected to assets/config.json for easy editing on GitHub.
