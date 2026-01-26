/**
 * Utility functions for the User Profile feature
 */

/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (up to 2 characters)
 */
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Parse achievements data (handle both string and array formats)
 * @param {string|array} achievementsData - Raw achievements data
 * @returns {array} Array of achievement IDs
 */
export const parseAchievements = (achievementsData) => {
  if (!achievementsData) return []
  if (Array.isArray(achievementsData)) return achievementsData
  try {
    return JSON.parse(achievementsData)
  } catch {
    return []
  }
}

/**
 * Calculate profile completion percentage
 * @param {object} formData - User profile form data
 * @returns {number} Completion percentage (0-100)
 */
export const calculateProfileCompletion = (formData) => {
  const fields = ['name', 'age', 'country', 'affiliation']
  const completedFields = fields.filter(field => formData[field])
  return Math.round((completedFields.length / fields.length) * 100)
}