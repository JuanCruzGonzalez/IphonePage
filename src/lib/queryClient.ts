import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración global de React Query
 * 
 * Opciones principales:
 * - staleTime: Tiempo antes de que los datos se consideren obsoletos (5 min)
 * - cacheTime: Tiempo que los datos permanecen en caché sin uso (10 min)
 * - refetchOnWindowFocus: Re-fetch automático al enfocar ventana
 * - refetchOnReconnect: Re-fetch automático al reconectar
 * - retry: Número de reintentos en caso de error
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo antes de que los datos se consideren obsoletos (5 minutos)
      staleTime: 5 * 60 * 1000,
      
      // Tiempo que los datos permanecen en caché sin uso (10 minutos)
      gcTime: 10 * 60 * 1000,
      
      // Re-fetch automático al enfocar la ventana
      refetchOnWindowFocus: true,
      
      // Re-fetch automático al reconectar
      refetchOnReconnect: true,
      
      // Reintentar 1 vez en caso de error
      retry: 1,
      
      // No mostrar errores en consola por defecto
      throwOnError: false,
    },
    mutations: {
      // Reintentar mutaciones fallidas 0 veces
      retry: 0,
      
      // No mostrar errores en consola por defecto
      throwOnError: false,
    },
  },
});

/**
 * Query keys centralizadas para mantener consistencia
 * y facilitar invalidación de caché
 */
export const queryKeys = {
  // Productos
  productos: ['productos'] as const,
  productosActivos: ['productos', 'activos'] as const,
  productoDetalle: (id: number) => ['productos', id] as const,
  unidadesMedida: ['unidades-medida'] as const,
  
  // Ventas
  ventas: ['ventas'] as const,
  ventaDetalle: (id: number) => ['ventas', id] as const,
  ventasStats: ['ventas', 'stats'] as const,
  
  // Promociones
  promociones: ['promociones'] as const,
  promocionesActivas: ['promociones', 'activas'] as const,
  promocionDetalle: (id: number) => ['promociones', id] as const,
  
  // Gastos
  gastos: ['gastos'] as const,
  gastoDetalle: (id: number) => ['gastos', id] as const,
  
  // Categorías
  categorias: ['categorias'] as const,
  categoriaDetalle: (id: number) => ['categorias', id] as const,
} as const;
