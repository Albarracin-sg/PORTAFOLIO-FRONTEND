# Imágenes del proyecto

- **`projects/`**: Imágenes de proyectos (portadas). Para usar una imagen local en un proyecto:
  1. Añade el archivo aquí (ej: `ecommerce.jpg`).
  2. En `src/features/projects/data/projectsList.ts` importa y asigna:
     ```ts
     import ecommerceImg from '@/assets/images/projects/ecommerce.jpg';
     // En el objeto del proyecto: image: ecommerceImg
     ```
  Vite resolverá la URL en build. Si no usas imports, los datos usan URLs externas por defecto.
