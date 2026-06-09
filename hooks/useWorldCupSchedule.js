import axios from "axios";
import { useEffect, useMemo, useState } from "react";

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const ONE_HOUR_MS = 60 * 60 * 1000;

// API returns MM/DD/YYYY HH:MM
function parseMatchDate(dateStr) {
  if (!dateStr) return new Date(0);
  const [datePart, timePart] = dateStr.split(" ");
  if (!datePart || !timePart) return new Date(0);
  const [month, day, year] = datePart.split("/");
  const [hours, minutes] = timePart.split(":");
  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10)
  );
}

export const useWorldCupSchedule = (selectedTeams, dismissedIds = []) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get("https://worldcup26.ir/get/games");
        const raw = Array.isArray(response.data.games)
          ? response.data.games
          : [];
        // Sort chronologically
        raw.sort(
          (a, b) => parseMatchDate(a.local_date) - parseMatchDate(b.local_date)
        );
        setGames(raw);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const schedule = useMemo(() => {
    if (!selectedTeams.length || !games.length) return [];

    const filtered = games.filter((game) => {
      if (dismissedIds.includes(game.id)) return false;
      const home = (game.home_team_name_en ?? "").toLowerCase();
      const away = (game.away_team_name_en ?? "").toLowerCase();
      return selectedTeams.some(
        (team) =>
          home.includes(team.toLowerCase()) ||
          away.includes(team.toLowerCase())
      );
    });

    // Already sorted since games is sorted
    return filtered.map((game, i, arr) => {
      const currentStart = parseMatchDate(game.local_date);
      const currentEnd = new Date(currentStart.getTime() + MATCH_DURATION_MS);
      let status = "safe";

      for (let j = 0; j < arr.length; j++) {
        if (j === i) continue;
        const otherStart = parseMatchDate(arr[j].local_date);
        const otherEnd = new Date(otherStart.getTime() + MATCH_DURATION_MS);

        // Overlap → conflict
        if (currentStart < otherEnd && currentEnd > otherStart) {
          status = "conflict";
          break;
        }

        // < 1h gap → close
        const gapBefore = currentStart.getTime() - otherEnd.getTime();
        const gapAfter = otherStart.getTime() - currentEnd.getTime();
        if ((gapBefore >= 0 && gapBefore <= ONE_HOUR_MS) ||
            (gapAfter >= 0 && gapAfter <= ONE_HOUR_MS)) {
          if (status !== "conflict") status = "close";
        }
      }

      return { ...game, status };
    });
  }, [games, selectedTeams, dismissedIds]);

  return { allGames: games, schedule, loading };
};
