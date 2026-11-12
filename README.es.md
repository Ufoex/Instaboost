# Instaboost

[English](README.md) · **Español**

## 🙋 ¿Tienes un problema o una sugerencia?

Cuéntanos: abre un issue y describe qué pasó o qué te gustaría.

[![Abrir un issue](https://img.shields.io/badge/Abrir%20un%20issue-D73A4A?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Ufoex/Instaboost/issues/new/choose)

Instaboost es un cliente ligero de Instagram para Android. Envuelve el sitio web móvil de Instagram y le añade ajustes y un mejor visor de reels.

[![Última versión](https://img.shields.io/github/v/release/Ufoex/Instaboost?label=descargar)](https://github.com/Ufoex/Instaboost/releases/latest)
[![Descargas](https://img.shields.io/github/downloads/Ufoex/Instaboost/total?label=descargas)](https://grev.shehryar.ae/?owner=Ufoex&repo=Instaboost)

📘 También disponible: [**Faceboost**](https://github.com/Ufoex/Faceboost), la misma idea para Facebook.

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

## Licencia

GPL-3.0, ver [LICENSE](LICENSE). Instaboost parte de [Materialbook](https://github.com/eepiemi/Materialbook), de eepiemi, que también es GPL-3.0.

Instaboost no está afiliado ni respaldado por Instagram ni Meta. Instagram es una marca de Meta Platforms, Inc.
