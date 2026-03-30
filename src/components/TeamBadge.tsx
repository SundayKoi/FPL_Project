import { teamInitial } from "@/lib/utils";
import type { Team } from "@/hooks/useLeagueData";

interface Props {
  team?: Team;
  size?: number;
}

export function TeamBadge({ team, size = 28 }: Props) {
  if (team?.logo_url) {
    return (
      <img
        src={team.logo_url}
        alt={team.name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-heading font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        background: team?.color_primary || "var(--clr-border)",
      }}
    >
      {teamInitial(team?.name)}
    </div>
  );
}
