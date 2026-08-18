# 📸 Captura de Pantalla - Extensión para Brave y Google Chrome

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Miguel_Freire-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/miguelangelhfreire)
![Brave](https://img.shields.io/badge/Brave-Compatible-FB542B?style=for-the-badge&logo=brave&logoColor=white)
![Google Chrome](https://img.shields.io/badge/Google_Chrome-Compatible-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Windows & Mac](https://img.shields.io/badge/OS-Windows%20|%20macOS%20|%20Linux-333333?style=for-the-badge)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=for-the-badge)

> Extensión de navegador ligera, moderna y potente desarrollada bajo el estándar **Manifest V3**. Permite realizar capturas de páginas completas (con scroll automático y unión de partes) o capturas de áreas personalizadas con el puntero interactivo 👈🏻 y color neón **#ccff00**, guardando todo automáticamente en la carpeta de **Descargas** con nombres basados en la **URL limpia + fecha**.

🔗 **Conecta conmigo en LinkedIn**: [https://www.linkedin.com/in/miguelangelhfreire](https://www.linkedin.com/in/miguelangelhfreire)

---

## 🌟 Características Principales

- 📸 **Activación Instantánea**: Haz clic en el icono de la cámara en la barra de extensiones para desplegar un banner superior moderno con efecto *Glassmorphism*.
- 📜 **Pantalla Completa (Multi-Captura y Ensamblado en Canvas)**:
  - Divide la web en secciones verticales secuenciales.
  - Recorre la página automáticamente esperando el renderizado de cada segmento.
  - Oculta encabezados fijos flotantes en los fotogramas secundarios para evitar que se repitan.
  - Ensambla todas las partes en un lienzo Canvas de alta resolución respetando la densidad de píxeles (`devicePixelRatio` / Retina / 4K).
- 👈🏻 **Captura Personalizada (Área a Medida con acento #ccff00)**:
  - Transforma el puntero en el emoji `👈🏻`.
  - Permite hacer clic y arrastrar para seleccionar exactamente la región deseada con resplandor neón **#ccff00**.
  - Muestra un indicador en tiempo real con las dimensiones en píxeles (`Ancho × Alto px`).
  - Al soltar el clic, realiza el recorte automático.
- 💾 **Descarga Inteligente con Nomenclatura Automática**:
  - Guarda los archivos PNG directamente en tu carpeta de `Descargas` sin cuadros de diálogo.
  - Formato del nombre de archivo: **URL limpia (sin `https://`, sin `www`, sin `.com`/`.es`) + Fecha y Hora**.
  - *Ejemplos*:
    - `https://www.linkedin.com/authwall` ➔ `linkedin_authwall_2026-08-13_23-45-10.png`
    - `https://github.com/trending` ➔ `github_trending_2026-08-13_23-45-10.png`
    - `https://www.marca.com/` ➔ `marca_2026-08-13_23-45-10.png`
- 💻 **100% Multiplataforma**: Funciona idénticamente en **Windows**, **macOS** y **Linux** dentro de los navegadores **Brave** y **Google Chrome**.

---

## 📖 ¿Cómo Funciona?

1. **Abrir el Menú de Captura**:
   - Entra en cualquier página web.
   - Pulsa el icono 📸 de la extensión.
   - Aparecerá el banner superior con 2 opciones principales:
     - 📜 **Pantalla completa**
     - 👈🏻 **Captura personalizada**

2. **Hacer Captura de Página Completa**:
   - Pulsa en **"Pantalla completa"**.
   - La extensión recorrerá la página por bloques, ensamblará todas las partes y descargará la imagen completa automáticamente.

3. **Hacer Captura de un Área Específica**:
   - Pulsa en **"Captura personalizada"**.
   - El cursor cambiará al emoji `👈🏻`.
   - Haz clic con el botón izquierdo y arrastra para dibujar el recuadro con el color neón `#ccff00`.
   - Suelta el ratón: el recorte se procesará al instante y se guardará en `Descargas`.

---

## 📁 Estructura del Proyecto

```
extensiones/
├── manifest.json         # Configuración y permisos (Manifest V3)
├── background.js         # Service Worker (capturas de viewport y descarga automática)
├── content.js            # Lógica: banner, multi-captura, unión en Canvas y nombres con URL limpia
├── content.css           # Estilos de interfaz, cursor 👈🏻, tema #ccff00 y notificaciones
├── icons/                # Iconos de la extensión en diferentes resoluciones
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── generate_icons.py     # Script generador de los iconos PNG 📸 con acento #ccff00
└── README.md             # Documentación del proyecto para GitHub
```

---

## 🔒 Permisos y Privacidad

- `activeTab`: Acceso temporal a la pestaña activa únicamente cuando pulsas la extensión.
- `scripting`: Permite mostrar la barra superior interactiva y el selector visual.
- `downloads`: Permite guardar las capturas generadas directamente en tu carpeta de descargas local.
- **100% Local**: Todo el procesamiento gráfico se realiza localmente en tu navegador mediante Canvas. Ningún dato ni imagen sale de tu equipo.

---

## 👤 Autor

Desarrollado por **Miguel Freire**  
🔗 [LinkedIn: miguelangelhfreire](https://www.linkedin.com/in/miguelangelhfreire)

---
---

# 📸 Page Screenshot - Extension for Brave & Google Chrome

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Miguel_Freire-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/miguelangelhfreire)
![Brave](https://img.shields.io/badge/Brave-Compatible-FB542B?style=for-the-badge&logo=brave&logoColor=white)
![Google Chrome](https://img.shields.io/badge/Google_Chrome-Compatible-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Windows & Mac](https://img.shields.io/badge/OS-Windows%20|%20macOS%20|%20Linux-333333?style=for-the-badge)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=for-the-badge)

> Lightweight, modern, and powerful browser extension built using the **Manifest V3** standard. Take full-page screenshots (with automated scrolling and stitching) or custom area screenshots using an interactive 👈🏻 pointer and **#ccff00** neon accent color. Automatically saves everything to your **Downloads** folder using clean **URL + Timestamp** filenames.

🔗 **Connect with me on LinkedIn**: [https://www.linkedin.com/in/miguelangelhfreire](https://www.linkedin.com/in/miguelangelhfreire)

---

## 🌟 Key Features

- 📸 **Instant Activation**: Click the camera icon in your extensions toolbar to unveil a modern top banner with a *Glassmorphism* blur effect.
- 📜 **Full Page Capture (Multi-Capture & Canvas Stitching)**:
  - Splits the webpage into sequential vertical segments.
  - Automatically scrolls through the page, allowing each section time to render properly.
  - Hides sticky/fixed headers during secondary frames to prevent duplication.
  - Stitches all parts onto a high-resolution HTML5 Canvas, respecting screen pixel density (`devicePixelRatio` / Retina / 4K).
- 👈🏻 **Custom Region Capture (Tailored Selection with #ccff00 Accent)**:
  - Changes the cursor into the `👈🏻` emoji.
  - Click and drag to select the exact screen area with a **#ccff00** neon glow outline.
  - Displays real-time pixel dimensions (`Width × Height px`).
  - Automatically crops and downloads the selection upon mouse release.
- 💾 **Smart Download & Automated Naming**:
  - Saves PNG files directly into your local `Downloads` folder without prompt dialogs.
  - Filename format: **Cleaned URL (stripping `https://`, `www`, and TLDs like `.com`/`.es`) + Date & Time**.
  - *Examples*:
    - `https://www.linkedin.com/authwall` ➔ `linkedin_authwall_2026-08-13_23-45-10.png`
    - `https://github.com/trending` ➔ `github_trending_2026-08-13_23-45-10.png`
    - `https://www.marca.com/` ➔ `marca_2026-08-13_23-45-10.png`
- 💻 **100% Cross-Platform**: Functions identically on **Windows**, **macOS**, and **Linux** within **Brave** and **Google Chrome** browsers.

---

## 📖 How It Works

1. **Open the Capture Toolbar**:
   - Navigate to any website.
   - Click the extension icon 📸.
   - The top banner will appear with 2 main options:
     - 📜 **Full Page**
     - 👈🏻 **Custom Capture**

2. **Take a Full Page Screenshot**:
   - Click **"Full Page"**.
   - The extension scrolls down in blocks, stitches the canvas image, and automatically downloads the completed capture.

3. **Capture a Specific Area**:
   - Click **"Custom Capture"**.
   - Cursor switches to `👈🏻`.
   - Left-click and drag to select the desired area marked by `#ccff00` neon highlights.
   - Release mouse: cropped image is processed instantly and saved to `Downloads`.

---

## 📁 Project Structure

```
extensiones/
├── manifest.json         # Extension configuration & permissions (Manifest V3)
├── background.js         # Service Worker (viewport captures & automated downloads)
├── content.js            # Core logic: UI banner, multi-capture, Canvas stitching & URL cleaning
├── content.css           # UI styles, custom cursor 👈🏻, #ccff00 theme & toast notifications
├── icons/                # Extension icons in multiple resolutions
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── generate_icons.py     # Python script to generate PNG icons 📸 with #ccff00 accent
└── README.md             # Project documentation for GitHub
```

---

## 🔒 Permissions & Privacy

- `activeTab`: Grants temporary access to the active tab only when clicking the extension icon.
- `scripting`: Enables injecting the interactive top banner and area selection overlay.
- `downloads`: Allows saving generated screenshots directly into your local downloads directory.
- **100% Local**: Image rendering and canvas manipulation happen entirely inside your browser. No data or images are ever transmitted externally.

---

## 👤 Author

Developed by **Miguel Freire**  
🔗 [LinkedIn: miguelangelhfreire](https://www.linkedin.com/in/miguelangelhfreire)
