/**
 * Utility functions for Organization Profile
 */

/**
 * Format a date string to readable format
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

/**
 * Parse achievements data (handle both string and array formats)
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
 * Validate hex color code
 */
export const isValidHexColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color)
}

/**
 * Calculate profile completion percentage
 */
export const calculateOrgCompletion = (formData) => {
  const fields = ['name', 'des', 'author_name', 'primary_color', 'secondary_color', 'color_scheme']
  const completedFields = fields.filter(field => formData[field])
  return Math.round((completedFields.length / fields.length) * 100)
}