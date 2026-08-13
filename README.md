# 📸 Captura de Pantalla - Extensión para Brave y Google Chrome

> Extensión de navegador ligera, moderna y potente desarrollada bajo el estándar **Manifest V3**. Permite realizar capturas de páginas completas (con scroll automático y unión de partes) o capturas de áreas personalizadas con el puntero interactivo 👈🏻 y color neón **#ccff00**, guardando todo automáticamente en la carpeta de **Descargas** con nombres basados en la **URL limpia + fecha**.

![Brave](https://img.shields.io/badge/Brave-Compatible-FB542B?style=for-the-badge&logo=brave&logoColor=white)
![Google Chrome](https://img.shields.io/badge/Google_Chrome-Compatible-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Windows & Mac](https://img.shields.io/badge/OS-Windows%20|%20macOS%20|%20Linux-333333?style=for-the-badge)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=for-the-badge)

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

## 🚀 Instalación Paso a Paso (Modo Desarrollador)

No requiere instalación de dependencias ni compiladores:

### En Brave Browser:
1. Abre Brave y escribe en la barra de direcciones: `brave://extensions` (o accede desde el Menú -> *Extensiones*).
2. Activa la casilla **"Modo de desarrollador"** (esquina superior derecha).
3. Haz clic en el botón **"Cargar descomprimida"** (o *Load unpacked*).
4. Selecciona la carpeta donde descargaste este proyecto.
5. ¡Listo! Para tenerla siempre a mano, pulsa el icono de la pieza de puzzle 🧩 en la barra de Brave y fija el icono 📸.

### En Google Chrome:
1. Abre Chrome y escribe en la barra de direcciones: `chrome://extensions`.
2. Activa el interruptor **"Modo de desarrollador"** en la esquina superior derecha.
3. Haz clic en **"Cargar descomprimida"**.
4. Selecciona la carpeta del proyecto.
5. Fija el icono 📸 en la barra de herramientas para acceder en 1 clic.

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

Desarrollado por **Miguel Freire**.
Proyecto de código abierto listo para publicar y compartir en GitHub.
