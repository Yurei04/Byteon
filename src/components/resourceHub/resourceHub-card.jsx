"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";

export default function ResourceCard({ item, onDelete }) {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:border-green-400 transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            {item.des && <p className="text-gray-300 text-sm mb-3">{item.des}</p>}
            {item.category && (
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs inline-block mb-3">
                {item.category}
              </span>
            )}
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />Visit Resource
                </Button>
              </a>
            )}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="ml-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
