# 🎵 SyncUp - Plataforma Musical

## Descripción
SyncUp es una plataforma de streaming y descubrimiento social de música desarrollada con **Spring Boot**, **React.js**, **MongoDB** y **Postman**. Permite a los usuarios gestionar su perfil, buscar canciones, recibir recomendaciones y conectar con otros usuarios.

## Características Principales
### Para Usuarios
- Registro e inicio de sesión
- Gestión de perfil y favoritos
- Búsqueda con autocompletado
- Playlist "Descubrimiento Semanal"
- Radio basada en canciones similares
- Conexión con otros usuarios
- Exportación de reportes CSV
### Para Administradores
- Gestión de catálogo de canciones
- Administración de usuarios
- Carga masiva de canciones
- Panel de métricas con gráficos

## Tecnologías
### Backend
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data MongoDB
- MongoDB
- Maven
- Postman (Pruebas API)

### Frontend
- React.js 18
- React Router
- Axios
- Context API
- Chart.js

## Estructura del Proyecto
```
syncup/
├── backend/          # Spring Boot + MongoDB
├── frontend/         # React.js application

### Base de Datos
- MongoDB ejecutándose en puerto 27017
- Colecciones: usuarios, canciones, playlists

## Licencia
Proyecto final de Estructura de Datos
