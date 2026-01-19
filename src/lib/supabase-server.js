import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export function createSupabaseServer() {
    const cookieStore = cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.name
                },
                set(name, value, options) {
                    cookieStore.set({ name, value, ...options})
                },
                remove(name, options) {
                    cookieStore.remove({name, value: "", ...options})
                }
            }
        }
    )

}