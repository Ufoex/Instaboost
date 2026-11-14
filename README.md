<h1 align="center">Instaboost</h1>

<p align="center">Light Android client for Instagram with a better reel viewer.</p>

<p align="center"><b>English</b> · <a href="README.es.md">Español</a></p>

<p align="center">
    <a href='https://github.com/Ufoex/Instaboost/releases/latest'><img alt='Download' height='40' src='https://img.shields.io/github/v/release/Ufoex/Instaboost?style=for-the-badge&logo=github&label=Download&color=E4405F&labelColor=24292F'/></a>
    <a href='https://grev.shehryar.ae/?owner=Ufoex&repo=Instaboost'><img alt='Downloads' height='40' src='https://img.shields.io/github/downloads/Ufoex/Instaboost/total?style=for-the-badge&logo=github&label=Downloads&color=E4405F&labelColor=24292F'/></a>
    <a href='https://buymeacoffee.com/masterllamk'><img alt='Buy me a coffee' height='40' src='https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black'/></a>
</p>

<p align="center">
    🙋 Problem or suggestion? <a href='https://github.com/Ufoex/Instaboost/issues/new/choose'>Open an issue</a> &nbsp;·&nbsp; ☕ Like the app? <a href='https://buymeacoffee.com/masterllamk'>Buy me a coffee</a>
</p>

<p align="center">
    📘 Also available: <a href='https://github.com/Ufoex/Faceboost'><b>Faceboost</b></a>, the same idea for Facebook.<br>
    🎵 And <a href='https://github.com/Ufoex/Spotiboost'><b>Spotiboost</b></a>, for Spotify.
</p>

Instaboost is a light Android client for Instagram. It wraps the mobile Instagram website and adds settings and a better reel viewer on top of it.

## Features

- Hide stories, suggested posts, people you may know, Reels and AI-labelled posts.
- Block sponsored posts and trackers.
- Reel viewer: tap to pause, hold to play faster, double tap in the middle to like and on the sides to skip, auto-scroll, sound always on, movable buttons, a seek bar and a hide-icons mode.
- Tap a video in the feed to open it full screen.
- Download photos, carousels and reels.
- Direct messages in their own layer, app lock, share to the app, launcher shortcuts.
- Material You colors and AMOLED black.
- Update check: the app looks for new releases here and shows the release notes in English or Spanish.

## Install

Download the APK from the [latest release](https://github.com/Ufoex/Instaboost/releases/latest) and open it. Android asks once to allow installing from your browser or file manager. Later updates can be installed from inside the app (Settings, Backup and updates).

Requires Android 8.0 (API 26) or newer.

## Build

```
./gradlew assembleDebug      # app/build/outputs/apk/debug (named "Instaboost Debug", installs next to the release)
./gradlew assembleRelease    # unsigned for your key; CI signs it
./gradlew testDebugUnitTest
```

Every push to `main` builds a signed release in CI and publishes it as a GitHub release. The release notes come from the newest section of [CHANGE.md](CHANGE.md), which has an English and a Spanish block.

## License

GPL-3.0, see [LICENSE](LICENSE). Instaboost started from [Materialbook](https://github.com/eepiemi/Materialbook) by eepiemi, which is also GPL-3.0.

Instaboost is not affiliated with or endorsed by Instagram or Meta. Instagram is a trademark of Meta Platforms, Inc.
