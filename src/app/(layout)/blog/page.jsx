import Footer from "@/components/footer";
import NavBar from "@/components/navbar";
import BlogPage from "@/pages/blog-page/blog-page";

export default function Blog () {
    return (
        <div className="w-full max-h-lvh">
            <NavBar />
            <BlogPage />
            <Footer />
        </div>
    )
}