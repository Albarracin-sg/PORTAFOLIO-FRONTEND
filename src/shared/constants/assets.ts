/**
 * Rutas base para imágenes en src/assets.
 * Para usar una imagen: import img from '@/assets/images/projects/mi-proyecto.jpg'
 * y asigna project.image = img (Vite devuelve la URL empaquetada).
 */
export const ASSETS_IMAGES_PATH = '/src/assets/images' as const;
export const ASSETS_PROJECTS_IMAGES_PATH = `${ASSETS_IMAGES_PATH}/projects` as const;
