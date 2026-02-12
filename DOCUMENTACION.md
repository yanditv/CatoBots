# Documentación del Sistema Cato-Bots IV

Cato-Bots IV es una plataforma integral diseñada para la gestión, registro y visualización en tiempo real de torneos de robótica. El sistema permite administrar robots, instituciones, patrocinadores y generar llaves de competencia (brackets) de forma automática, permitiendo a los jueces controlar las batallas desde una interfaz dedicada.

## Arquitectura Tecnológica

El sistema utiliza una arquitectura **Full-Stack** moderna con comunicación en tiempo real:

### Frontend
- **Framework:** React 19 con TypeScript.
- **Herramienta de Construcción:** Vite 7.
- **Estilos:** Tailwind CSS 4.
- **Animaciones:** Framer Motion (utilizado para transiciones suaves y estados vivos del bracket).
- **Iconografía:** Lucide React.
- **Comunicación Real-time:** Socket.io-client.

### Backend
- **Entorno:** Node.js con TypeScript.
- **Servidor Web:** Express.
- **Base de Datos:** MySQL gestionado a través del ORM **Sequelize**.
- **Real-time:** Socket.io (servidor).
- **Autenticación:** JSON Web Tokens (JWT) y encriptación de contraseñas con BcryptJS.

---

## Módulos y Funcionalidades

### 1. Gestión de Usuarios y Seguridad
El sistema cuenta con dos niveles de acceso:
- **Admin (ADMIN):** Tiene control total sobre el sistema, incluyendo la creación de instituciones, robots, patrocinadores, jueces y la generación de llaves.
- **Juez (REFEREE):** Tiene acceso a la interfaz de control de encuentros para actualizar puntajes, sanciones y tiempos en tiempo real.

### 2. Registro y Administración
- **Instituciones:** Gestión de colegios, universidades o clubes.
- **Robots:** Registro de competidores vinculados a una institución. 
    - *Restricción:* Máximo 3 robots por categoría por institución.
- **Patrocinadores:** Módulo para mostrar las marcas que apoyan el evento.

### 3. Generación Automática de Brackets
El sistema incluye un algoritmo de generación de llaves de eliminación directa (*Single Elimination*):
- Distribuye los robots aleatoriamente para garantizar equidad.
- Soporta llaves de potencias de 2 (2, 4, 8, 16, 32 robots).
- Rellena con "Byes" (nulos) si el número de robots no es potencia de 2.
- **Avance Automático:** Al finalizar un encuentro, el sistema promueve automáticamente al ganador a la siguiente fase en la llave.

### 4. Control de Encuentros (Referee Control)
Interfaz interactiva para jueces que permite:
- **Cronómetro:** Iniciar, pausar y resetear el tiempo de batalla (sincronizado globalmente desde el servidor).
- **Puntajes:** Sumar puntos a cada robot.
- **Sanciones:** Registrar advertencias o penalizaciones.
- **Estado:** Finalizar el encuentro, lo que dispara el avance automático en el bracket.

### 5. Visualización en Tiempo Real
- **Dashboard de Partidas:** Vista pública de los encuentros actuales, próximos y terminados.
- **Brackets:** Visualización dinámica e interactiva del árbol del torneo, con efectos visuales para las finales y estados en vivo.

---

## Estructura del Proyecto

### Backend (`/server`)
- `index.ts`: Punto de entrada, configuración de Express, Socket.io y lógica de rutas.
- `models/`: Definiciones de tablas (Sequelize):
    - `Robot.ts`, `Match.ts`, `User.ts`, `Institution.ts`, `Sponsor.ts`.
- `config/db.ts`: Configuración de la conexión a MySQL.
- `seed-bracket.ts`: Script de utilidad para pruebas de brackets.

### Frontend (`/src`)
- `pages/`: Vistas principales.
    - `Brackets.tsx`: Visualización de las llaves del torneo.
    - `Dashboard.tsx`: Panel principal de visualización pública.
    - `RefereeControl.tsx`: Panel de control para jueces.
    - `Registration.tsx`: Formulario de registro.
    - `Admin/AdminPanel.tsx`: Administración central.
- `context/`: Gestión de estados globales.
- `App.tsx`: Enrutamiento y estructura base.

---

## Configuración y Despliegue

### Variables de Entorno (`.env`)
Se requiere un archivo `.env` en la carpeta `server` con:
```env
DB_NAME=nombre_bd
DB_USER=usuario
DB_PASS=contraseña
DB_HOST=localhost
JWT_SECRET=tu_llave_secreta
PORT=3001
```

### Ejecución en Desarrollo
1.  **Backend:** `cd server && npm run dev`
2.  **Frontend:** `npm run dev` (desde la raíz)

---

## Flujo de Trabajo del Torneo

1.  **Preparación:** El administrador registra las instituciones y robots.
2.  **Sorteo:** El administrador genera la llave para cada categoría (Minisumo, Seguidor, etc.).
3.  **Competencia:**
    - Los jueces abren `RefereeControl`.
    - Seleccionan la batalla actual.
    - Controlan el tiempo y los puntos.
    - Al dar "Finalizar", el ganador avanza en el bracket.
4.  **Público:** Los espectadores ven los cambios instantáneos en el `Dashboard` y los `Brackets` en las pantallas del evento.

---
*Documentación generada automáticamente para el proyecto Cato-Bots IV.*
