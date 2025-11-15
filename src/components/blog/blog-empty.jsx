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

export default function BlogEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFolder />
        </EmptyMedia>
        <EmptyTitle>No Blogs Yet</EmptyTitle>
        <EmptyDescription>
          There are currently no blog posts available. Check back soon or create the first one.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <div className="flex gap-2">
          <Button>Create Blog</Button>
          <Button variant="outline">Manage</Button>
        </div>
      </EmptyContent>

      <Button variant="link" className="text-muted-foreground" size="sm">
        Learn More <ArrowUpRightIcon />
      </Button>
    </Empty>
  );
}
