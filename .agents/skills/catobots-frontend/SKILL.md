---
name: Cato Bots Frontend Design System (V2 - High Energy eSports)
description: Official graphic line and design rules for CATO BOTS IV EDICIÓN frontend components, based on the official "Grunge/Loud" Green & Yellow banner.
---

# 🟢 DESCRIPCIÓN

Este skill rige el diseño de componentes para CATO BOTS IV EDICIÓN. Tras el análisis del logo oficial y sus artes (fondos verdes vibrantes, líneas de velocidad, textura de papel, rostros de robots agresivos), la estética debe alejarse del "Dark Mode corporativo o Glassmorphism" y abrazar un estilo **100% eSports, ruidoso, agresivo, con texturas grunge y altísimo contraste**, inspirado en torneos de combate de robots y cultura urbana/gaming.

## 🟢 PERSONALIDAD DEL EVENTO

- **Loud & Aggressive** (Ruidoso y Agresivo)
- **Grunge / Callejero-Tech** (Texturas de papel arrugado, desgaste, halftones)
- **High-Energy** (Colores extremadamente vibrantes, cero pasteles o tonos apagados)
- **Cómic / eSports Competitivo** (Líneas de velocidad, trazos negros gruesos)
- **Peligro / Combate** (Uso constante de cintas de peligro amarillas/negras)

**NUNCA DEBE VERSE:**
- Elegante, limpio, corporativo ("Apple-like").
- Translúcido suave (Cero Glassmorphism).
- Curvo y amigable (No usar bordes muy redondeados sin justificación pesada).
- Oscuro plano sin energía (fondos negros/grises sin texturas ni cortes).

## 🟢 PALETA OFICIAL (OBLIGATORIA)

El esquema es un contraste agresivo ("Duo-tono extremo" + Negro puro).

### Colores Principales
- `--cb-green-vibrant`: `#10B961` (Verde hiper-saturado y brillante, color dominante de fondos de impacto)
- `--cb-yellow-alert`: `#FFF000` (Amarillo tóxico/neón puro para logos, textos principales y acentos de peligro)
- `--cb-black-pure`: `#000000` (Negro puro para fondos base, módulos, contornos densos vectoriales y sombras duras sólidas)
- `--cb-white`: `#FFFFFF` (Blanco puro para asegurar máxima legibilidad de textos frente a negros o verdes oscuros)

### Reglas de Uso de Color:
- **Fondos de Alta Jerarquía (Hero / Banners):** Verde vibrante casi tóxico (`--cb-green-vibrant`), idealmente superpuesto con textura de papel arrugado o gránulo (noise).
- **Fondos de Contenido (Tarjetas/Módulos):** Bloques macizos negros o grises muy oscuros (`#111111`), sin transparencias suaves.
- **Acentos:** Cinta de peligro (Rayas diagonales negras y amarillas) para separadores, fondos de insignias o alertas.

## 🟢 TIPOGRAFÍA OBLIGATORIA

- **Títulos y Logos:** Tipografías Blocky, pesadas, de tipo atlético o industrial (ej. `Bebas Neue`, `Anton`, `Russo One`). DEBEN estar siempre en MAYÚSCULAS.
- **Estilo de Títulos:** Para máxima energía, se puede usar texto en cursiva (`italic`) para dar sensación de velocidad. Usar *stroke* (contorno negro grueso) en fondos claros.
- **Cuerpo de Texto:** Tipografías sans-serif pesadas (`Montserrat` o `Inter` en Bold), priorizando mayúsculas en subtítulos y botones. El texto debe ser ruidoso.

## 🟢 ESTILO VISUAL OBLIGATORIO (UI)

El sistema web debe imitar un póster o interfaz de torneo táctil:
1. **Sombras de Bloque (Solid Offset Shadows):** Las sombras NUNCA deben usar difuminado (blur `0`). Deben ser bloques sólidos de color desplazados (Ej: `shadow-[6px_6px_0px_#000]`).
2. **Texturas Grunge/Táctiles:** Usar ruido (noise), patrones de medios tonos (halftones) y fondos que emulen papel gastado o metal rallado.
3. **Líneas de Velocidad & Ángulos:** Elementos diagonales agudos (`clip-path: polygon(...)`) y vectores puntiagudos ingresando desde los bordes.
4. **Cintas de Peligro (Warning Tape):** Patrones CSS de rayas amarillas y negras (Ej: `repeating-linear-gradient`).
5. **Bordes:** Duros, gruesos y de alto contraste (`border-2` o `border-4` en colores opuestos al fondo). Nada de bordes sutiles.

## 🟢 BOTONES Y TARJETAS

- **Geometría:** Rectangulares con cortes diagonales asimétricos, o cajas sólidas de bordes afilados (`rounded-none`).
- **Estados de Botón (Default):** Fondo brillante (Amarillo/Blanco/Verde) + Borde negro grueso + Sombra desplazada negra sólida (`shadow-[4px_4px_0px_#000]`).
- **Estados de Botón (Hover/Active):** La sombra desaparece y el botón se mueve físicamente para ocupar ese espacio (efecto de "presionar", traduciéndose `translate-x-[4px] translate-y-[4px] shadow-none`).
- **Animaciones:** Agresivas, de tipo "Snap". Prohibidas las transiciones lentas y etéreas (`duration-500` o mayores). Usar `duration-75` o `duration-150`.

## 🟢 MODO HERO SECTION

- **Impacto Frontal:** Fondo de pantalla completo en Verde estridente con texturas aplicadas y marcas de agua enormes del logo de fondo (con opacidad).
- **Central:** Escudo/Logo de los robots enfrentados gigante, resplandeciente en amarillo.
- **Decoración:** "Speed lines" o explosiones de formas geométricas dentadas/rayos como las del logo. Cintas de `IV EDICIÓN` en ángulos oblicuos.
- Las insignias (fechas, lugares) deben parecer "stickers" o pegatinas pegadas a la fuerza sobre el papel, idealmente torcidas un par de grados.

## 🟢 COHERENCIA DE ICONOGRAFÍA Y TEXTOS

- **Textos:** Tono ultra-imperativo. "DOMINA LA ARENA", "INSCRIBE A TU EQUIPO AHORA", "DESCARGA LAS REGLAS".
- **Iconografía Estricta:** 
  - Usar SIEMPRE íconos SVG puros y agresivos (Ej: a través de `lucide-react` usando `Sword`, `Zap`, `Terminal`).
  - **PROHIBIDO EL USO DE EMOJIS (📅, 🏟️, 🚀)**. Restan profesionalidad eSports.
  - **Evitar iconos web genéricos clásicos** (`Mail`, `User`, `CreditCard`) que la IA pueda proponer por defecto.
- **Iconos Visuales:** Gruesos, pesados, estilo *Stencil* o vectorial sólido (`fill`). Evitar iconos de línea fina o "outline" delicados (`strokeWidth="1"`), a menos que se sobrepongan a formas pesadas.
