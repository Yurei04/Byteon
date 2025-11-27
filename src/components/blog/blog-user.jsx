"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"

export default function MyBlogs({ blogs, onBlogDeleted }) {
const [deletingId, setDeletingId] = useState(null)
const [alert, setAlert] = useState(null)


const handleDelete = async (blogId) => {
    setDeletingId(blogId)
    setAlert(null)

    try {
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', blogId)

        if (error) throw error

    setAlert({ type: 'success', message: 'Blog deleted successfully!' })
        setTimeout(() => {
            if (onBlogDeleted) onBlogDeleted()
        }, 1000)
    } catch (error) {
        console.error('Error deleting blog:', error)
        setAlert({ type: 'error', message: 'Failed to delete blog' })
    } finally {
        setDeletingId(null)
    }
}

if (!blogs || blogs.length === 0) {
    return (
        <div className="text-center py-12">
            <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-fuchsia-500/20 rounded-full flex items-center justify-center">
                    <Eye className="w-10 h-10 text-fuchsia-300" />
                </div>
            </div>
            <h3 className="text-xl font-semibold text-fuchsia-100 mb-2">No Blogs Yet</h3>
            <p className="text-fuchsia-200/70">You havent created any blog posts yet. Start sharing your thoughts!</p>
        </div>
    )
}

return (
    <div className="space-y-4">
    {alert && (
        <Alert className={`${alert.type === 'error' ? 'border-red-500 bg-red-500/10 text-red-100' : 'border-green-500 bg-green-500/10 text-green-100'}`}>
            {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
    )}

    <div className="grid gap-4">
        {blogs.map((blog) => (
            <Card key={blog.id} className="group bg-gradient-to-br from-fuchsia-900/20 via-purple-900/20 to-slate-950/20 backdrop-blur-lg border border-fuchsia-500/20 hover:border-fuchsia-400/40 transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Blog Image */}
                        {blog.image && (
                        <div className="lg:w-64 h-48 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                            src={blog.image} 
                            alt={blog.title}
                            width={64}
                            height={48}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        )}

                        {/* Blog Content */}
                        <div className="flex-1 space-y-3">
                        <div>
                            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300 mb-2">
                            {blog.title}
                            </h3>
                            <p className="text-fuchsia-200/70 line-clamp-2">
                            {blog.des || blog.content?.substring(0, 150) + '...'}
                            </p>
                        </div>

                        {/* Meta Information */}
                        <div className="flex flex-wrap gap-3 text-sm text-fuchsia-200/60">
                            {blog.author && (
                            <div className="flex items-center gap-1">
                                <span className="font-medium">By {blog.author}</span>
                            </div>
                            )}
                            {blog.created_at && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                            </div>
                            )}
                            {blog.place && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{blog.place}</span>
                            </div>
                            )}
                        </div>

                        {/* Tags & Theme */}
                        <div className="flex flex-wrap gap-2">
                            {blog.theme && (
                            <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 hover:bg-purple-500/30">
                                <Tag className="w-3 h-3 mr-1" />
                                {blog.theme}
                            </Badge>
                            )}
                            {blog.hackathon && Array.isArray(blog.hackathon) && blog.hackathon.map((hack, idx) => (
                            <Badge key={idx} className="bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/30 hover:bg-fuchsia-500/30">
                                {hack}
                            </Badge>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <Button 
                            size="sm" 
                            variant="outline"
                            className="border-fuchsia-500/30 text-fuchsia-200 hover:bg-fuchsia-500/20"
                            >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                            </Button>
                            <Button 
                            size="sm" 
                            variant="outline"
                            className="border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                            >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                            </Button>
                            <Dialog>
                            <DialogTrigger asChild>
                                <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-500/30 text-red-200 hover:bg-red-500/20"
                                disabled={deletingId === blog.id}
                                >
                                {deletingId === blog.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                    </>
                                )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 border-fuchsia-500/30">
                                <DialogHeader>
                                <DialogTitle className="text-fuchsia-100">Confirm Deletion</DialogTitle>
                                <DialogDescription className="text-fuchsia-200/70">
                                    Are you sure you want to delete {blog.title}? This action cannot be undone.
                                </DialogDescription>
                                </DialogHeader>
                                <div className="flex gap-3 justify-end mt-4">
                                <Button variant="outline" className="border-fuchsia-500/30">
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive"
                                    onClick={() => handleDelete(blog.id)}
                                    disabled={deletingId === blog.id}
                                >
                                    {deletingId === blog.id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                    ) : (
                                    'Delete Blog'
                                    )}
                                </Button>
                                </div>
                            </DialogContent>
                            </Dialog>
                        </div>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>
    )
}