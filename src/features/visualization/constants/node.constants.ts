/**
 * Constantes pour les dimensions et styles des nœuds de visualisation
 *
 * IMPORTANT: Ces valeurs sont utilisées pour maintenir une taille cohérente
 * des nœuds dans le graphe de visualisation. Ne pas modifier sans coordination
 * avec les styles Tailwind dans CustomNode.tsx
 */

/**
 * Largeur minimale des nœuds en pixels
 * Correspond à la classe Tailwind: min-w-[140px]
 */
export const NODE_MIN_WIDTH = 140

/**
 * Padding horizontal des nœuds en pixels
 * Correspond à la classe Tailwind: px-4 (16px)
 */
export const NODE_PADDING_X = 16

/**
 * Padding vertical des nœuds en pixels
 * Correspond à la classe Tailwind: py-3 (12px)
 */
export const NODE_PADDING_Y = 12

/**
 * Border width des nœuds en pixels
 * Correspond à la classe Tailwind: border-2
 */
export const NODE_BORDER_WIDTH = 2

/**
 * Classes Tailwind pour le style principal des nœuds
 * ATTENTION: La classe min-w-[140px] est critique pour la taille des nœuds
 */
export const NODE_BASE_CLASSES =
  "group relative min-w-[140px] rounded-lg border-2 border-blue-400 bg-white px-4 py-3 shadow-lg transition-colors hover:border-blue-600"
