[简体中文](README.zh-CN.md) · [English](README.md) · [日本語](README.ja.md)

<div align="center">

[![Bandage cover](docs/cover-bandage-4x3.png)](https://hbaopiqi.github.io/bandage-mv/)

# Bandage / 绷带

**HBaopiqi · 鹤我这豹脾气 — a hand-drawn collage and kinetic typography music video**

94 BPM · 03:42 · Canvas Kinetic Typography

[▶ Watch on GitHub Pages](https://hbaopiqi.github.io/bandage-mv/) · [Sites mirror](https://bandage-mv.hbaopiqi.chatgpt.site) · [Listen on NetEase Cloud Music](https://music.163.com/#/album?id=401417845)

</div>

> There is no need to rush; the road is still long. Each layer of bandage is a reminder of everything it took to get this far.

## About the work

*Bandage* follows a person learning to live with anxiety, failure, and wounds that have yet to heal. Streets before dawn, unanswered messages, and people who seem to move faster can all make the way ahead feel uncertain.

This browser-based music video uses its lyrics as a storyboard, with drumbeats and pauses shaping the rhythm of movement. Backpacks, worn canvas shoes, phones, hearts, and bandages recur through torn paper, crayon textures, and hand-drawn lines. Words become roads, seats, pockets, and wounds as well as captions. The road is long, and answers can come later; as long as you keep moving, the journey continues.

The song and on-screen lyrics are in Chinese.

## Watch online

| Platform | Link | Details |
| --- | --- | --- |
| GitHub Pages | [Watch the complete music video](https://hbaopiqi.github.io/bandage-mv/) | Automatically deployed from this repository |
| Sites | [Open the mirror](https://bandage-mv.hbaopiqi.chatgpt.site) | Independently hosted mirror |
| NetEase Cloud Music | [Listen to the Bandage album](https://music.163.com/#/album?id=401417845) | Album listening page |

Headphones are recommended. Music starts only after you click to enter, as required by browser playback rules. Fullscreen is available on desktop; landscape orientation is recommended on mobile.

## Visuals and animation

![Keyframes from the Bandage music video](docs/mv-keyframes.png)

- Lyrics synchronized line by line with the complete audio timeline; sections and strong beats trigger animation changes
- Hand drawing, crayons, torn paper, and collage throughout the song
- Type size, letter spacing, composition, and movement responding to the mood of each lyric
- A loading screen, section selection, seeking, frame saving, and fullscreen playback
- Desktop and mobile landscape layouts, with touch playback controls

## Playback controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Play / pause | Play button or Space | Play button |
| Seek backward / forward | Left / right arrow keys or drag the progress bar | Drag the progress bar |
| Choose a section | “翻到” (jump to) menu | “翻到” (jump to) menu |
| Fullscreen | Fullscreen button | Fullscreen button, then rotate to landscape |
| Save a frame | “保存画面” (save frame) button | Press and hold the generated image to save it |

## Implementation

The project uses plain HTML, CSS, and JavaScript without a frontend framework. Canvas draws the text, shapes, and collage assets frame by frame. Audio playback time is the single master clock driving lyrics, transitions, and scene animation. Fonts, lyric timing data, and visual assets are included in the repository.

```text
dist/
├─ index.html              Entry page and player structure
├─ styles.css              Page, loading screen, and mobile layouts
├─ loading.js              Asset preloading and entry flow
├─ player.js               Audio controls and timeline playback
├─ art.js                  Scene animation and typography
├─ collage.js              Collage asset coordination
└─ assets/                 Audio, lyrics, fonts, and visual assets
```

## Run locally

```bash
python -m http.server 8768 --directory dist
```

Open <http://127.0.0.1:8768/> to watch. No backend application or dependency installation is required.
