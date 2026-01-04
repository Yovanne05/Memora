/**
 * Extrait le texte brut du contenu HTML.
 * Utile pour afficher des aperçus de notes enrichies dans les cartes.
 *
 * @param content - Le contenu HTML ou texte simple
 * @returns Le texte brut sans balises HTML
 */
export function stripHTML(content: string): string {
  if (!content) return ''

  // Si ce n'est pas du HTML, retourner tel quel
  if (!content.trim().startsWith('<')) {
    return content
  }

  // Créer un élément temporaire pour parser le HTML
  const temp = document.createElement('div')
  temp.innerHTML = content

  // Extraire le texte
  return temp.textContent || temp.innerText || ''
}

/**
 * Tronque le texte à une longueur donnée en préservant les mots.
 *
 * @param text - Le texte à tronquer
 * @param maxLength - Longueur maximale
 * @returns Le texte tronqué avec "..." si nécessaire
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text

  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...'
}

/**
 * Extrait et tronque le texte pour un aperçu de note.
 *
 * @param content - Le contenu HTML ou texte simple
 * @param maxLength - Longueur maximale de l'aperçu
 * @returns L'aperçu du contenu
 */
export function getContentPreview(content: string, maxLength: number = 150): string {
  const plainText = stripHTML(content)
  return truncateText(plainText, maxLength)
}
