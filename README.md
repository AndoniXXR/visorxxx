# VisorXXX

Proyecto para visualizar y descargar dark posts de varias fuentes.

## Tecnologías
- **Frontend:** Next.js + TailwindCSS
- **Backend:** Express.js (Node)
- **Gestor de paquetes:** pnpm

## Estructura
- `/app` y `/components`: Código del frontend
- `/server`: Código del backend (API Express)
- `/lib`: Utilidades y traducciones

## Instalación

1. Clona el repositorio:
   ```sh
   git clone https://github.com/AndoniXXR/visorxxx.git
   ```
2. Instala dependencias:
   ```sh
   pnpm install
   cd server
   pnpm install
   ```

## Uso local

- **Frontend:**
  ```sh
  pnpm dev
  ```
- **Backend:**
  ```sh
  cd server
  node index.js
  ```

## Despliegue recomendado
- **Frontend:** Vercel
- **Backend:** Railway o Render

## Variables de entorno
Configura las variables necesarias en cada plataforma según tus fuentes/API.

## Autor
AndoniXXR

---
¿Dudas? Abre un issue en el repo.
