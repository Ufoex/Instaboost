# Instaboost

**English** · [Español](README.es.md)

Instaboost is a light Android client for Instagram. It wraps the mobile Instagram website and adds settings and a better reel viewer on top of it.

[![Latest release](https://img.shields.io/github/v/release/Ufoex/Instaboost?label=download)](https://github.com/Ufoex/Instaboost/releases/latest)

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
