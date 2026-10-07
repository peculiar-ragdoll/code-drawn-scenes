# Brief: Last Bowl

## Scene
A rainy night on a city side street. A small street-food stall (a ramen cart with a canopy, a short counter, stools,
a hanging red lantern and a cloth curtain across the front) glows on a corner. A cook works inside. A person with an
umbrella has just stopped at the counter, half under the canopy. Both are adults, stylised, and not likenesses of
anyone.

Inventory:
- the stall: canopy, cloth curtain with a simple emblem, counter with bowls, a steaming pot, condiment jars, a menu
  board, stools, a lantern
- the street: wet asphalt with reflections, a kerb, a puddle, a drain, a lamp post
- buildings rising behind: lit windows in a grid, a fire escape, a vertical sign, a water tower on a roof
- the sky: rain clouds, rain falling in angled streaks
- a poster title band, in the manner of the references: for example "LATE NIGHT · NOODLES" in period poster type
- gentle animation: rain falls, steam rises from the pot, the lantern sways, a sign flickers, reflections ripple,
  the curtain moves in the wind, the umbrella drips

## Art direction
- **Style:** a 1930s WPA screen-print travel poster: flat ink layers, at most six inks with no gradients (tone comes
  from flat shapes and a few hatched or stippled bands), bold silhouettes, simplified geometry, period lettering.
- **Light:** night; the stall is the main warm light source; the cool city glow comes through windows and the wet
  street. Reflections are flat vertical bands of ink.
- **Palette:** deep navy, slate blue, teal, vermilion, cream and mustard.
- **Mood:** cosy refuge in the rain; graphic and confident.
- **Must-have:** it reads as a printed poster, not a painting. **Avoid:** soft gradients, glow blur, photo realism.

## References
| file | role | artist | license | source |
|---|---|---|---|---|
| `style-wpa-see-america.jpg` | style: flat-ink 1930s screen print, limited palette, bold shapes | Alexander Dux for the Works Progress Administration New York City Federal Art Project | Public domain | [See America, WPA poster, ca. 1937.jpg](https://commons.wikimedia.org/wiki/File:See_America,_WPA_poster,_ca._1937.jpg) |
| `style-wpa-winter-new-york.jpg` | style: night palette and silhouette treatment in a WPA screen print | Jack Rivolta, NYC Works Progress Administration Federal Art Project | Public domain | [Winter in New York State, WPA poster, ca. 1938.jpg](https://commons.wikimedia.org/wiki/File:Winter_in_New_York_State,_WPA_poster,_ca._1938.jpg) |
| `style-wpa-nyc-airports.jpg` | style: city geometry, lettering and layering in a WPA poster | Harry Herzog for the Works Progress Administration[1] | Public domain | [New York City municipal airports, WPA poster, ca. 1937.jpg](https://commons.wikimedia.org/wiki/File:New_York_City_municipal_airports,_WPA_poster,_ca._1937.jpg) |
| `element-yatai-stall.jpg` | element: a street-food stall: canopy, counter, lanterns, stools | Nesnad | CC BY 4.0 | [Hakata yatai and yatai food - 2024 Sept 24 various.jpeg](https://commons.wikimedia.org/wiki/File:Hakata_yatai_and_yatai_food_-_2024_Sept_24_various.jpeg) |
| `element-rain-street-night.jpg` | element: wet street at night, reflections of signs | Eden, Janine and Jim from New York City | CC BY 2.0 | [Times Square Rain (6387401445).jpg](https://commons.wikimedia.org/wiki/File:Times_Square_Rain_(6387401445).jpg) |
| `pose-figure-umbrella.jpg` | pose: a figure walking with an umbrella in the rain | Jeremy Segrott from Cardiff, Wales, UK | CC BY 2.0 | [Figure in the rain (24263897279).jpg](https://commons.wikimedia.org/wiki/File:Figure_in_the_rain_(24263897279).jpg) |

## Deliverable
A single self-contained HTML file, `scene.html`, in this folder: an animated Canvas2D illustration with a logical size
of 1600×900, DPR-aware (support `?dprMax=`), that scales to the window width. No external images, fonts or libraries.
Also save `preview.png` here: a full-frame 1600×900 screenshot of a representative moment.

## How to work
- Start by reading `skill/SKILL.md` and follow it. The other files in `skill/` are its references; `skill/scene-kit.js`
  is a toolkit you may copy from or inline.
- The reference images are in `references/` (roles in the table below; licenses in `references/CREDITS.md`). Look at
  them for structure, palette, mood and style. **Never embed or trace them**; draw everything fresh in code.
- Review your own render the way the skill describes: serve this folder over http on port 8804, take your own
  screenshots with a headless browser you script yourself (e.g. Node + Playwright, or Python + Playwright). Other
  agents are running in parallel, so do **not** use a shared browser tool or any other port.
- Make it as high quality, detailed and correct as you can in one pass: this should look like a finished
  illustration, not a draft.
- Treat what you report as the final deliverable. Run the full review loop yourself, and fix every defect you find
  before reporting. A known defect is not a compromise.
- Do not ask questions; make sensible decisions.

## Isolation (strict)
Read and write **only inside this folder** (`<the run's folder>`). Do not read, list or search anything outside it, do not invoke
skills through a skill tool, and do not use the web. Everything you need is here.

## Report
When done, report briefly what you built, which art-direction choices you made, how many review rounds you ran, and,
as compromises, only what you tried and couldn't fix, with what you tried.
