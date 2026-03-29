export interface Signup {
  id: string;
  discordUsername: string;
  opggLink: string;
  primaryRole: string;
  secondaryRole?: string;
  currentRank: string;
  peakRank: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
