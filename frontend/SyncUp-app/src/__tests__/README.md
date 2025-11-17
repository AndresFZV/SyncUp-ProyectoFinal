# 🧪 Tests del Frontend - SyncUp

Este directorio contiene las pruebas unitarias para el frontend de SyncUp, una plataforma de streaming musical.

## 📋 Contenido de los Tests

### 1. **Validadores Básicos** (`validators.basic.test.js`)
Pruebas para validación de username y email:
- ✅ Validación de usernames (longitud mínima, espacios, etc.)
- ✅ Validación de emails (formato, dominios, caracteres especiales)
- **Total: ~20 casos de prueba**

### 2. **Validadores de Seguridad** (`validators.security.test.js`)
Pruebas para validación de contraseñas y edad:
- ✅ Validación de contraseñas (longitud, complejidad, caracteres)
- ✅ Comparación de contraseñas
- ✅ Validación de edad (rangos válidos, números)
- **Total: ~25 casos de prueba**

### 3. **Formateadores de Tiempo** (`formatters.time.test.js`)
Pruebas para formateo de tiempo y duración:
- ✅ Formato de segundos a mm:ss
- ✅ Formato de duración de canciones
- ✅ Manejo de casos extremos (negativos, NaN, undefined)
- **Total: ~24 casos de prueba**

### 4. **Formateadores de Texto** (`formatters.text.test.js`)
Pruebas para formateo de texto y números:
- ✅ Capitalización de texto
- ✅ Truncado de texto con sufijos personalizados
- ✅ Formateo de números con separadores de miles
- **Total: ~33 casos de prueba**

### 5. **Hook useForm - Básico** (`useForm.basic.test.js`)
Pruebas para funcionalidades básicas del hook:
- ✅ Inicialización de valores
- ✅ Manejo de cambios en inputs (texto, checkbox, archivos)
- ✅ Reset de formularios
- ✅ Funciones setValue y setFormValues
- **Total: ~20 casos de prueba**

### 6. **Hook useForm - Validación** (`useForm.validation.test.js`)
Pruebas para validación y submit:
- ✅ Validación al perder foco (onBlur)
- ✅ Validación completa del formulario
- ✅ Manejo de submit con estados de carga
- ✅ Manejo de errores
- **Total: ~18 casos de prueba**

### 7. **Componente Button** (`Button.test.js`)
Pruebas para el componente Button:
- ✅ Renderizado básico
- ✅ Variantes de estilo (primary, secondary, danger)
- ✅ Tamaños (small, medium, large)
- ✅ Estados (disabled, loading)
- ✅ Iconos
- ✅ Eventos onClick
- ✅ Props personalizadas
- **Total: ~30 casos de prueba**

## 📊 Resumen Total
- **7 archivos de test**
- **~170 casos de prueba**
- Cobertura de: Utils, Hooks y Componentes

## 🚀 Instalación

Primero, instala las dependencias necesarias:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @babel/preset-env @babel/preset-react babel-jest identity-obj-proxy
```

## ▶️ Ejecutar los Tests

### Ejecutar todos los tests:
```bash
npm test
```

### Ejecutar tests en modo watch:
```bash
npm test -- --watch
```

### Ejecutar tests con cobertura:
```bash
npm test -- --coverage
```

### Ejecutar un archivo específico:
```bash
npm test validators.basic.test.js
```

### Ejecutar tests de una categoría:
```bash
npm test -- __tests__/utils/
npm test -- __tests__/hooks/
npm test -- __tests__/components/
```

## 📦 Estructura de Archivos

```
src/
├── __tests__/
│   ├── __mocks__/
│   │   └── fileMock.js
│   ├── components/
│   │   └── Button.test.js
│   ├── hooks/
│   │   ├── useForm.basic.test.js
│   │   └── useForm.validation.test.js
│   ├── utils/
│   │   ├── validators.basic.test.js
│   │   ├── validators.security.test.js
│   │   ├── formatters.time.test.js
│   │   └── formatters.text.test.js
│   ├── jest.config.js
│   └── setup.js
├── components/
├── hooks/
└── utils/
```

## 🔧 Configuración

### jest.config.js
Archivo de configuración principal de Jest que define:
- Entorno de prueba (jsdom para React)
- Transformaciones de archivos
- Mapeo de módulos CSS
- Patrones de archivos de test
- Configuración de cobertura

### setup.js
Archivo de configuración inicial que incluye:
- Imports de testing-library
- Mocks para window.matchMedia
- Mocks para localStorage y sessionStorage
- Mock para Audio API
- Mock para IntersectionObserver

## 📝 Convenciones de los Tests

1. **Estructura Describe/It**: Cada test está organizado con bloques `describe` e `it`
2. **Nombres descriptivos**: Los nombres de los tests describen claramente lo que prueban
3. **Arrange-Act-Assert**: Patrón AAA en cada test
4. **Casos extremos**: Se prueban valores límite, null, undefined, NaN
5. **Comentarios**: Cada archivo tiene un header explicativo

## ✅ Qué se está probando

### Utils (Utilidades)
- ✅ Validaciones de formularios
- ✅ Formateo de datos para UI
- ✅ Manejo de casos extremos

### Hooks (Custom Hooks)
- ✅ Gestión de estado de formularios
- ✅ Validaciones dinámicas
- ✅ Manejo de eventos
- ✅ Submit asíncrono

### Components (Componentes)
- ✅ Renderizado correcto
- ✅ Props y variantes
- ✅ Estados interactivos
- ✅ Eventos de usuario
- ✅ Accesibilidad básica

## 🎯 Próximos Pasos

Para expandir la suite de tests, considera agregar:
- Tests de integración para páginas completas
- Tests E2E con Cypress o Playwright
- Tests de contextos (MusicPlayerContext, SidebarContext)
- Tests de servicios API (con mocks de fetch)
- Tests de componentes más complejos (MusicPlayer, SongCard, etc.)

## 🐛 Debugging

Si encuentras problemas:

1. **Tests fallan por módulos CSS**: Verifica que `identity-obj-proxy` esté instalado
2. **Tests fallan por imports de React**: Verifica la configuración de Babel
3. **Tests de hooks fallan**: Asegúrate de usar `@testing-library/react` correctamente
4. **Audio mock no funciona**: Revisa el setup.js

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 👥 Contribución

Al agregar nuevos tests:
1. Sigue la estructura existente
2. Incluye comentarios descriptivos
3. Prueba casos positivos y negativos
4. Verifica la cobertura de código
5. Asegúrate de que todos los tests pasen antes de commit

---

**Desarrollado para el proyecto SyncUp - Estructura de Datos 2024**
