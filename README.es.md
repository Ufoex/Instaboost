<h1 align="center">Instaboost</h1>

<p align="center">Cliente ligero de Instagram para Android con un mejor visor de reels.</p>

<p align="center"><a href="README.md">English</a> · <b>Español</b></p>

<p align="center">
    <a href='https://github.com/Ufoex/Instaboost/releases/latest'><img alt='Descargar' height='40' src='https://img.shields.io/github/v/release/Ufoex/Instaboost?style=for-the-badge&logo=github&label=Descargar&color=E4405F&labelColor=24292F'/></a> <a href='https://grev.shehryar.ae/?owner=Ufoex&repo=Instaboost'><img alt='Downloads' height='40' src='https://img.shields.io/github/downloads/Ufoex/Instaboost/total?style=for-the-badge&logo=github&label=Downloads&color=E4405F&labelColor=24292F'/></a> <a href='https://github.com/Ufoex/Instaboost/issues/new/choose'><img alt='Abrir un issue' height='40' src='https://img.shields.io/badge/Abrir%20un%20issue-D73A4A?style=for-the-badge&logo=github&logoColor=white'/></a> <a href='https://buymeacoffee.com/masterllamk'><img alt='Invítame un café' height='40' src='https://img.shields.io/badge/Inv%C3%ADtame%20un%20caf%C3%A9-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black'/></a>
</p>

<p align="center">
    📘 También disponible: <a href='https://github.com/Ufoex/Faceboost'><b>Faceboost</b></a>, la misma idea para Facebook.<br>
    🎵 Y <a href='https://github.com/Ufoex/Spotiboost'><b>Spotiboost</b></a>, para Spotify.
</p>

Instaboost es un cliente ligero de Instagram para Android. Envuelve el sitio web móvil de Instagram y le añade ajustes y un mejor visor de reels.

## Funciones

- Oculta historias, publicaciones sugeridas, personas sugeridas, Reels y publicaciones con etiqueta de IA.
- Bloquea publicaciones patrocinadas y rastreadores.
- Visor de reels: tocar para pausar, mantener para acelerar, doble toque en el centro para dar me gusta y en los lados para saltar, desplazamiento automático, sonido siempre activo, botones movibles, barra de progreso y modo para ocultar iconos.
- Tocar un video del feed lo abre a pantalla completa.
- Descarga fotos, carruseles y reels.
- Mensajes directos en su propia capa, bloqueo de la app, compartir hacia la app y accesos directos.
- Colores Material You y negro AMOLED.
- Búsqueda de actualizaciones: la app busca versiones nuevas aquí y muestra las notas en español o inglés.

## Instalar

Descarga el APK de la [última versión](https://github.com/Ufoex/Instaboost/releases/latest) y ábrelo. Android pide una vez permiso para instalar desde tu navegador o gestor de archivos. Las siguientes actualizaciones se pueden instalar desde la propia app (Ajustes, Copia y actualizaciones).

Requiere Android 8.0 (API 26) o superior.

## Compilar

```
./gradlew assembleDebug      # app/build/outputs/apk/debug (se llama "Instaboost Debug" y se instala junto a la versión release)
./gradlew assembleRelease    # sin firmar con tu clave; el CI la firma
./gradlew testDebugUnitTest
```

Cada push a `main` compila una versión firmada en el CI y la publica como release de GitHub. Las notas salen de la sección más reciente de [CHANGE.md](CHANGE.md), que tiene un bloque en inglés y otro en español.

## Apoyo

La app es gratis y no tiene anuncios. Si te sirve y quieres dar las gracias, puedes [invitarme un café](https://buymeacoffee.com/masterllamk).

## Licencia

GPL-3.0, ver [LICENSE](LICENSE). Instaboost parte de [Materialbook](https://github.com/eepiemi/Materialbook), de eepiemi, que también es GPL-3.0.

Instaboost no está afiliado ni respaldado por Instagram ni Meta. Instagram es una marca de Meta Platforms, Inc.
