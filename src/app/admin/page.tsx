import { Users, Film, FileSpreadsheet, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { GOOGLE_SHEETS_URL } from "@/lib/constants";

const quickLinks = [
  {
    label: "Player Signups",
    href: "/admin/signups",
    icon: Users,
    description: "View and manage player registrations",
  },
  {
    label: "VOD Manager",
    href: "/admin/vods",
    icon: Film,
    description: "Add, edit, and remove match VODs",
  },
  {
    label: "Master Sheet",
    href: "/admin/sheets",
    icon: FileSpreadsheet,
    description: "View and edit the master spreadsheet",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card hover className="h-full">
              <link.icon className="h-8 w-8 text-fpl-accent mb-3" />
              <h3 className="font-semibold mb-1">{link.label}</h3>
              <p className="text-fpl-muted text-sm">{link.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Google Sheets Master Doc</h3>
            <p className="text-fpl-muted text-sm">
              Open the master spreadsheet directly in Google Sheets
            </p>
          </div>
          <a
            href={GOOGLE_SHEETS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-fpl-accent hover:bg-fpl-accent-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Open Sheet <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </Card>
    </div>
  );
}
