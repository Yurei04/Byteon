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

        <EmptyContent>
          <div className="flex gap-3 mt-4">
            <Button onClick={onCreate} className="bg-fuchsia-600 hover:bg-fuchsia-500">
              Create Blog
            </Button>
            <Button variant="outline" onClick={onCreate}>
              Manage
            </Button>
          </div>
        </EmptyContent>

        <div className="mt-4">
          <Button variant="link" className="text-fuchsia-300 text-sm" asChild>
            <a href="#">Learn More <ArrowUpRightIcon className="ml-2 inline" /></a>
          </Button>
        </div>
      </Empty>
    </div>
  )
}