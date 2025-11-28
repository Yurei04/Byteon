"use client"

import { IconFolder } from "@tabler/icons-react"
import { ArrowUpRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import BlogForm from "./blog-form"
import BlogUserForm from "./blog-user-form"

export default function BlogEmpty({ onCreate }) {
  return (
    <div className="w-full flex justify-center">
      <Empty className="max-w-xl mx-auto border border-fuchsia-700/30 shadow-2xl rounded-2xl p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="text-fuchsia-300">
            <IconFolder />
          </EmptyMedia>
          <EmptyTitle className="text-fuchsia-100">No Blogs Yet</EmptyTitle>
          <EmptyDescription className="text-fuchsia-200">
            There are no blog posts to show right now. Create the first post to share your thoughts with the Byteon community.
          </EmptyDescription>
        </EmptyHeader>

        <div className="mt-4">
          <Button variant="link" className="text-fuchsia-300 text-sm cursor-pointer" asChild>
            <a href="#">Learn More <ArrowUpRightIcon className="ml-2 inline" /></a>
          </Button>
        </div>
      </Empty>
    </div>
  )
}