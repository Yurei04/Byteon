import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RecentActivity() {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-white/60 text-sm text-center py-4">
          Activity tracking coming soon
        </p>
      </CardContent>
    </Card>
  )
}