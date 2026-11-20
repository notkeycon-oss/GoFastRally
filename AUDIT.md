# Go Fast Rally — rally game audit and feature picks

This is the research behind the game: what other rally games do well, and what Go Fast Rally takes from each.

## Games looked at

| Game | What it's known for | What we took |
|---|---|---|
| **Richard Burns Rally** | Still the reference for realism. Weight and momentum, surfaces you can feel, harsh damage. | Real weight transfer from a full rigid-body sim. Surface-dependent grip. Damage that changes how the car drives. |
| **DiRT Rally 2.0** | Pace notes as a core skill (turn grade, distance, hazards). Surface grip, persistent damage across an event, a service park. | A co-driver with a full pace-note vocabulary. Rally Events where damage carries over between stages, plus a repair choice between stages. |
| **EA SPORTS WRC** | Reuses DR2.0 handling. A good balance of realism and accessibility on pad and keyboard. | Assists you can turn off: steering assist, ABS, traction control, auto/manual gearbox. Stage results against a field of drivers. |
| **DirtBound (browser)** | Free in the browser. Endless generated mountain stages (2/5/10 km or endless) with themes and landscapes, a daily ranked stage, ghosts, low-poly style, R to reset to the road, C to change between chase and tactical cameras. | Seeded procedural stages in four landscapes, stage lengths, Endless mode, a Daily Stage, ghosts, a low-poly look, the same R/C keys, and a high "helicopter" camera. |
| **Riptide Run (our last game)** | Glass-card menus, medals and stars, a garage with paints, ghost racing, a How-to-Play card, procedural audio, auto graphics quality, and gamepad support. | The menu style (Barlow Condensed type, glass cards, medal stars), medal/star progression that unlocks cars, the garage and livery editor, and the auto-quality and dynamic-resolution approach. |

(DirtBound's own site could not be opened from the build machine, so the DirtBound notes come from public guides and listings.)

## What makes rally handling feel real (and how we built it)

- **Rigid-body chassis at 240 Hz.** Body roll, dive, squat and weight transfer come from the simulation itself, not from scripted animation.
- **Ray-cast suspension.** Each corner has its own spring, damper, bump stop and travel, and each axle has an anti-roll bar. Cars land jumps on their springs, and can bottom out.
- **Combined-slip tyre model (friction circle).** Each surface has its own grip curve:
  - **Tarmac:** sharp, high peak.
  - **Gravel, dirt and snow:** a flatter peak at a larger slip angle that stays usable while sliding. This is what makes rally drifting work.
  - **Ice:** almost nothing.
  - **Grip falls with load.** A heavily loaded tyre grips less per kilo, which is why you can feel understeer and oversteer.
  - **Rain** cuts grip, most of all on tarmac.
- **Drivetrain:**
  - Engine torque curves.
  - Turbo lag on turbo cars. The Havoc B has a lot of it.
  - Anti-lag pops and flames when you lift off.
  - Clutch slip on launch.
  - A sequential gearbox, auto or manual.
  - FWD, RWD and AWD layouts, with centre and axle limited-slip differentials.
  - Engine inertia carried into the driven wheels, so first gear feels heavy.
- **Brakes:** front/rear bias, ABS (optional) and a handbrake that locks the rear wheels.
- **Damage:**
  - **Front hits:** damage the radiator, engine and steering. A damaged radiator overheats the engine over time.
  - **Corner hits:** damage the suspension.
  - **Hard hits on rocks:** can puncture a tyre.
  - **Body:** the bodywork dents at the impact point.

## Stage design ("cool trails with difficult turns")

- **Built like real pace notes.** Stages are made from turn grades 6 (flat out) down to 1, then hairpins. They include:
  - square turns
  - turns that tighten or open
  - long turns
  - chicanes linked by "into" and "and"
  - crests, jumps and dips
  - narrow sections
  - "don't cut" rocks on the inside of corners
  - "caution" calls where there's a drop on the outside
- **Clothoid transitions** let each turn wind on and off smoothly, so corners feel like real roads.
- **Switchbacks.** Brutal stages stack hairpins into switchbacks up mountainsides.
- **The road never crosses itself.** The generator checks for free space ahead and backtracks when it gets boxed in. In testing, 80 random 10 km stages had zero crossings.
- **Elevation** follows the landscape with a grade limit, then adds crests and jumps.
- **Banking and crown.** Corners are banked and the road surface has a crown.
- **Four landscapes:**
  - **Pine Forest:** fast gravel and jumps.
  - **Red Canyon:** mesas, terraces and drops.
  - **Alpine Snow:** snowbanks you can lean on, plus icy patches.
  - **Coastal Tarmac:** guard rails above the sea.
- **Time and weather.** Four times of day, including night stages with a light pod. Clear, fog, rain or falling snow.

## Feature list for v1

- **Modes:**
  - Featured Stages: 9 stages, with medals and stars.
  - Quick Stage: pick the seed, length, turns, time and weather, and share the stage code.
  - Rally Event: 3 stages against 11 rivals, with damage carrying over and repairs between stages.
  - Daily Stage.
  - Endless Run: checkpoints add time.
- **Co-driver:**
  - Spoken calls with adjustable timing.
  - Pace-note cards with arrow icons on the HUD.
- **HUD:**
  - Timer, with delta to your ghost.
  - Splits.
  - Stage progress bar with a ghost marker.
  - Rotating minimap.
  - Speedo with rev bar and turbo boost bar.
  - Damage panel.
- **Ghost** of your best run on each stage.
- **Replays.** TV-style trackside cameras or chase cam, plus slow motion.
- **Five cameras:** chase, far chase, bonnet, bumper and helicopter.
- **Five cars:** Sprite R2 (FWD), Vortex R5 (AWD turbo), Mistral 77 (RWD classic), Atlas Raid (AWD truck) and Havoc B (Group B monster). The last three unlock with stars.
- **Livery editor:** colours, patterns, wheels and door number.
- **Effects:**
  - Dust trails that hang in the air.
  - Gravel spray.
  - Tyre tracks that stay on the road.
  - Tyre smoke.
  - Rain spray.
  - Sparks.
  - Backfire flames.
  - Engine smoke when the car is damaged.
- **Crowds** at hairpins and jumps.
- **Procedural audio:**
  - Engine with turbo whistle and blow-off.
  - Backfire pops.
  - Gravel and tyre sounds, plus wind and rain.
  - Impacts.
  - Menu music.
- **Controls:** keyboard, gamepad and touch.
- **Performance:**
  - Auto graphics quality.
  - Dynamic resolution.
  - Streaming terrain in three levels of detail, built in small slices so frames never stall.
  - Instanced trees.
  - Fixed-step physics.

## Not in v1 (ideas for next)

- **Online:** leaderboards, live ghosts and multiplayer (Riptide Run's Firebase setup could be reused).
- **A stage editor** like DirtBound's circuit editor.
- **Rallycross:** closed circuits with laps.
- **Car setup:** gear ratios, brake bias and suspension sliders.
- **Day-to-night stages** with weather that changes during the stage.
