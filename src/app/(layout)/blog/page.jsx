import ClientFooterLoader from "@/components/client-footer-loader";
import BlogPage from "@/pages/blog-page/blog-page";

export default function Blog () {
    return (
        <div className="w-full max-h-lvh">
            <BlogPage />
            <ClientFooterLoader />
        </div>
    )
}