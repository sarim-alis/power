/**
 * Formats a store name from kebab-case to Title Case
 * 
 * @param {string} storeName - Store name in kebab-case (e.g., "reviews-sum-test-store")
 * @returns {string} Formatted store name in Title Case (e.g., "Review Sum Test Store")
 * 
 * @example
 * formatStoreName("reviews-sum-test-store") // Returns: "Review Sum Test Store"
 * formatStoreName("my-awesome-shop") // Returns: "My Awesome Shop"
 */
export function formatStoreName(storeName) {
  if (!storeName || typeof storeName !== 'string') {
    return storeName || '';
  }

  // Step 1: Replace hyphens with spaces
  // Step 2: Split into words
  // Step 3: Capitalize first letter of each word
  // Step 4: Join back with spaces
  return storeName
    .split('-') // Split by hyphens: ["reviews", "sum", "test", "store"]
    .map(word => {
      // Capitalize first letter, lowercase rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' '); // Join with spaces: "Review Sum Test Store"
}

