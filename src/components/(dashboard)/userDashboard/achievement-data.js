// Available achievements/badges configuration
export const availableAchievements = [
  { id: 'chapter_1', label: 'Chapter 1', icon: '📚', category: 'Learning' },
  { id: 'chapter_2', label: 'Chapter 2', icon: '📚', category: 'Learning' },
  { id: 'chapter_3', label: 'Chapter 3', icon: '📚', category: 'Learning' },
  { id: 'chapter_4', label: 'Chapter 4', icon: '📚', category: 'Learning' },
  { id: 'chapter_5', label: 'Chapter 5', icon: '📚', category: 'Learning' },
  { id: 'read_blog', label: 'Blog Explorer', icon: '📖', category: 'Engagement' },
  { id: 'joined_hackathon', label: 'Hackathon Participant', icon: '🏆', category: 'Events' },
  { id: 'viewed_hackathon', label: 'Event Scout', icon: '👀', category: 'Events' },
  { id: 'first_project', label: 'First Project', icon: '💻', category: 'Development' },
  { id: 'profile_complete', label: 'Profile Complete', icon: '✅', category: 'Profile' },
  { id: 'community_member', label: 'Community Member', icon: '👥', category: 'Social' },
  { id: 'first_login', label: 'Welcome!', icon: '🎉', category: 'Profile' },
]

export const achievementCategories = ['Learning', 'Engagement', 'Events', 'Development', 'Profile', 'Social']

export const getAchievementLevel = (count) => {
  if (count === 0) return { name: 'Beginner', color: 'gray' }
  if (count < 4) return { name: 'Novice', color: 'blue' }
  if (count < 8) return { name: 'Intermediate', color: 'purple' }
  if (count < 12) return { name: 'Advanced', color: 'amber' }
  return { name: 'Master 🏆', color: 'yellow', gradient: true }
}