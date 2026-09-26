import { Megaphone, Search } from "lucide-react"

export default function AnnounceEmpty() {
    return (
        <div className="flex flex-col items-center justify-center p-12 max-w-md">
            <div className="relative mb-6">
                <div className="w-24 h-24 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-brand-300 dark:border-brand-700/40">
                    <Megaphone className="w-12 h-12 text-brand-600 dark:text-brand-400" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-200 dark:bg-brand-800/30 rounded-full flex items-center justify-center border border-brand-300 dark:border-brand-600/40">
                    <Search className="w-4 h-4 text-brand-700 dark:text-brand-300" />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-text-primary mb-3 text-center">
                No Announcements Found
            </h3>
            
            <p className="text-text-secondary/70 text-center leading-relaxed">
                We couldn&apos;t find any announcements matching your search. Try adjusting your filters or search terms.
            </p>

            <div className="mt-8 flex gap-3">
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg 
                        transition-all duration-200 font-medium border border-brand-500/50 
                        hover:shadow-lg hover:shadow-brand-500/20"
                >
                    Refresh
                </button>
                <button 
                    onClick={() => {
                        const searchInput = document.querySelector('input[type="text"]')
                        if (searchInput) searchInput.value = ""
                    }}
                    className="px-6 py-2.5 bg-brand-100 dark:bg-brand-900/40 hover:bg-brand-200 dark:hover:bg-brand-800/40 
                        text-brand-700 dark:text-text-secondary rounded-lg transition-all duration-200 font-medium 
                        border border-brand-300 dark:border-brand-800/40 backdrop-blur-sm"
                >
                    Clear Search
                </button>
            </div>
        </div>
    )
}