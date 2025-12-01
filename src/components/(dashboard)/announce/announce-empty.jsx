import { Megaphone, Search } from "lucide-react"

export default function AnnounceEmpty() {
    return (
        <div className="flex flex-col items-center justify-center p-12 max-w-md">
            <div className="relative mb-6">
                <div className="w-24 h-24 bg-fuchsia-900/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-fuchsia-700/40">
                    <Megaphone className="w-12 h-12 text-fuchsia-400" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-fuchsia-800/30 rounded-full flex items-center justify-center border border-fuchsia-600/40">
                    <Search className="w-4 h-4 text-fuchsia-300" />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-fuchsia-100 mb-3 text-center">
                No Announcements Found
            </h3>
            
            <p className="text-fuchsia-300/70 text-center leading-relaxed">
                We couldn't find any announcements matching your search. Try adjusting your filters or search terms.
            </p>

            <div className="mt-8 flex gap-3">
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg 
                        transition-all duration-200 font-medium border border-fuchsia-500/50 
                        hover:shadow-lg hover:shadow-fuchsia-500/20"
                >
                    Refresh
                </button>
                <button 
                    onClick={() => {
                        const searchInput = document.querySelector('input[type="text"]')
                        if (searchInput) searchInput.value = ""
                    }}
                    className="px-6 py-2.5 bg-fuchsia-950/40 hover:bg-fuchsia-900/40 text-fuchsia-200 
                        rounded-lg transition-all duration-200 font-medium border border-fuchsia-800/40 
                        backdrop-blur-sm"
                >
                    Clear Search
                </button>
            </div>
        </div>
    )
}