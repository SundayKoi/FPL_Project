import { GOOGLE_SHEETS_URL, GOOGLE_SHEETS_EMBED_URL } from "@/lib/constants";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function AdminSheetsPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Master Sheet</h1>
        <a
          href={GOOGLE_SHEETS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-fpl-accent hover:bg-fpl-accent-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Open in Google Sheets <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <Card className="p-0 overflow-hidden">
        <iframe
          src={GOOGLE_SHEETS_EMBED_URL}
          className="w-full border-0"
          style={{ height: "calc(100vh - 16rem)" }}
          title="FPL Master Spreadsheet"
        />
      </Card>
    </div>
  );
}
