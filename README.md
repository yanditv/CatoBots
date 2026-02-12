# Cato-Bots IV - Sistema de Gestión de Torneos de Robótica

Este proyecto es una plataforma completa para la gestión de torneos de robótica, permitiendo el registro de robots, administración de llaves (brackets) y control de encuentros en tiempo real.

## Documentación Completa

Para una guía detallada sobre cómo funciona el sistema, su arquitectura, modelos de datos y flujo de trabajo, consulta:

**[DOCUMENTACION.md](./DOCUMENTACION.md)**

## Inicio Rápido

### Requisitos
- Node.js (v18+)
- MySQL

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd Cato-Bots
   ```

2. **Configurar el Backend:**
   ```bash
   cd server
   npm install
   # Crea un archivo .env basado en la documentación
   npm run dev
   ```

3. **Configurar el Frontend:**
   ```bash
   cd ..
   npm install
   npm run dev
   ```

## Tecnologías Principales
- **Frontend:** React 19, Tailwind CSS 4, Framer Motion, Socket.io-client.
- **Backend:** Node.js, Express, Sequelize (MySQL), Socket.io.

---
© 2025 Codary
