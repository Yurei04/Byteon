
import { supabase } from "@/lib/supabase";

/**
 * Unlock a chapter (and mark previous as completed)
 * When you finish chapter 2, this unlocks chapter 3 and marks chapter 2 as completed
 * @param {number} completedChapter - The chapter number you just finished (1-5)
 */
export async function unlockNextChapter(completedChapter) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("[unlockNextChapter] User not authenticated");
      return { success: false, message: "Not authenticated" };
    }

    // Update: set chapters_completed and unlock next chapter
    const { data, error } = await supabase
      .from('users')
      .update({
        chapters_completed: completedChapter,
        chapters_unlocked: completedChapter + 1, // Unlock next chapter
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error("[unlockNextChapter] Error:", error);
      return { success: false, message: "Update failed" };
    }

    console.log(`[unlockNextChapter] Completed chapter ${completedChapter}, unlocked chapter ${completedChapter + 1}`);
    return { 
      success: true, 
      message: `Chapter ${completedChapter + 1} unlocked!`,
      data 
    };

  } catch (error) {
    console.error("[unlockNextChapter] Error:", error);
    return { success: false, message: "Unexpected error" };
  }
}

/**
 * Get user's current progress
 * @returns {Promise<{chapters_unlocked: number, chapters_completed: number}>}
 */
export async function getUserProgress() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { chapters_unlocked: 1, chapters_completed: 0 };
    }

    const { data, error } = await supabase
      .from('users')
      .select('chapters_unlocked, chapters_completed')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return { chapters_unlocked: 1, chapters_completed: 0 };
    }

    return {
      chapters_unlocked: data.chapters_unlocked || 1,
      chapters_completed: data.chapters_completed || 0
    };

  } catch (error) {
    console.error("[getUserProgress] Error:", error);
    return { chapters_unlocked: 1, chapters_completed: 0 };
  }
}