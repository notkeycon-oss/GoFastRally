# Go Fast Rally

A rally game that runs in the browser. The cars look low-poly, but the handling is realistic. Stages are procedural mountain roads full of hard turns, and your co-driver calls every one.

**Play:** open `index.html`. It works straight from the folder or from any static host, such as GitHub Pages. You don't need to install or build anything, because Three.js is included in `lib/`.

## Controls

| Key | Action |
|---|---|
| W / ↑ | Throttle |
| S / ↓ | Brake. Hold it when stopped to reverse. |
| A D / ← → | Steer |
| Space | Handbrake |
| C | Change camera (chase, far chase, bonnet, bumper, helicopter) |
| R | Reset to the road (+5 s) |
| E / Q | Shift up / down (when the gearbox is set to manual) |
| Esc / P | Pause |
| T | Restart the stage |
| M | Mute |
| F | Show the FPS counter |

- **Gamepad:** RT throttle, LT brake, A handbrake, Y reset, X camera, LB/RB gears, START pause.
- **Touch:** on-screen buttons appear on phones and tablets.

## Modes

- **Featured Stages:**
  - Nine fixed stages. Each has bronze, silver and gold times.
  - Medals give stars, and stars unlock the Mistral 77 (4 ★), the Atlas Raid (8 ★) and the Havoc B (14 ★).
- **Quick Stage:**
  - Pick the landscape, length (2–10 km), turn difficulty, time of day, weather and seed.
  - Each stage has a code, for example `F1201-2FMC`. A friend can type it in to drive the same stage.
- **Rally Event:**
  - Three stages in a row against 11 rival drivers. Damage carries over.
  - Between stages you can pay a time penalty to repair the car.
- **Daily Stage:** a new stage every day, the same one for everyone.
- **Endless Run:** a road that never ends. You start with 75 s, and each kilometre checkpoint adds time.

Every stage keeps a **ghost** of your best run. After the finish you can **watch a replay** with TV-style cameras.

## Project layout

```
index.html        page, HUD and menu markup
css/style.css     all styling
lib/three.min.js  Three.js r149 (MIT, see lib/three.LICENSE)
js/util.js        maths, seeded random, simplex noise, save data
js/data.js        surfaces, landscapes, cars, featured stages
js/track.js       procedural stage generator + pace notes + reference times
js/world.js       streamed terrain (3 levels of detail), road, scenery, sky, weather
js/geo.js         low-poly trees, rocks, people, banner textures
js/physics.js     vehicle dynamics (suspension, tyres, drivetrain, damage)
js/carmodel.js    car models, liveries, lights, dents
js/fx.js          dust trails, gravel, sparks, flames, tyre marks
js/audio.js       procedural engine/surface audio, co-driver voice, menu music
js/input.js       keyboard, gamepad, touch
js/camera.js      chase/bonnet/bumper/helicopter, replay TV cams, garage orbit
js/ai.js          autopilot (menu demo, cool-down lap, testing)
js/hud.js         timer, pace-note cards, speedo, minimap
js/session.js     one stage: countdown, timing, splits, ghost, replay, resets
js/ui.js          menus, garage, settings, results, rally event
js/main.js        renderer, quality presets, dynamic resolution, main loop
```

See `AUDIT.md` for the rally-game research and the reasons behind each feature.

## Performance notes

- **Auto graphics.** The game picks Low, Medium or High from the device. The renderer then lowers resolution on its own if the frame rate drops, and raises it again when there's room.
- **Terrain streaming.** Terrain streams in 128 m chunks at three levels of detail. Chunks are built a little at a time across frames, so the game doesn't hitch.
- **Physics.** Physics runs at a fixed 240 Hz and costs well under 1 ms per frame.
- **Trees and scenery.** Trees and rocks are instanced. Roadside props are merged per road section.
