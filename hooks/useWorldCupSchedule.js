import axios from "axios";
import { useEffect, useMemo, useState } from "react";

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const ONE_HOUR_MS = 60 * 60 * 1000;

// Stadium UTC offsets during June/July 2026 (summer time):
// Mexico (no DST since 2023): CST = UTC-6
// US Central cities (CDT in summer): UTC-5
// US Eastern cities (EDT in summer): UTC-4
// US/Canada Western cities (PDT in summer): UTC-7
const STADIUM_UTC_OFFSET = {
  "1":  -6,  // Estadio Azteca — Mexico City (CST, no DST)
  "2":  -6,  // Estadio Akron — Guadalajara (CST, no DST)
  "3":  -6,  // Estadio BBVA — Monterrey (CST, no DST)
  "4":  -5,  // AT&T Stadium — Dallas (CDT)
  "5":  -5,  // NRG Stadium — Houston (CDT)
  "6":  -5,  // Arrowhead Stadium — Kansas City (CDT)
  "7":  -4,  // Mercedes-Benz Stadium — Atlanta (EDT)
  "8":  -4,  // Hard Rock Stadium — Miami (EDT)
  "9":  -4,  // Gillette Stadium — Boston (EDT)
  "10": -4,  // Lincoln Financial Field — Philadelphia (EDT)
  "11": -4,  // MetLife Stadium — New York/NJ (EDT)
  "12": -4,  // BMO Field — Toronto (EDT)
  "13": -7,  // BC Place — Vancouver (PDT)
  "14": -7,  // Lumen Field — Seattle (PDT)
  "15": -7,  // Levi's Stadium — San Francisco (PDT)
  "16": -7,  // SoFi Stadium — Los Angeles (PDT)
};

const SYRIA_UTC_OFFSET = 3; // UTC+3

// Convert a local match time string + stadium_id to Syria time string "MM/DD/YYYY HH:MM"
function toSyriaDateString(dateStr, stadiumId) {
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(" ");
  if (!datePart || !timePart) return null;
  const [month, day, year] = datePart.split("/");
  const [hours, minutes] = timePart.split(":");

  const venueUtcOffset = STADIUM_UTC_OFFSET[String(stadiumId)] ?? -5;
  const offsetDiff = SYRIA_UTC_OFFSET - venueUtcOffset;

  const utcMs = Date.UTC(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10)
  );
  const syriaMs = utcMs + offsetDiff * 60 * 60 * 1000;
  const s = new Date(syriaMs);

  const mm = String(s.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(s.getUTCDate()).padStart(2, "0");
  const yyyy = s.getUTCFullYear();
  const hh = String(s.getUTCHours()).padStart(2, "0");
  const min = String(s.getUTCMinutes()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
}

// Parse venue local time to a true UTC Date (for sorting & conflict detection)
function parseMatchDate(dateStr, stadiumId) {
  if (!dateStr) return new Date(0);
  const [datePart, timePart] = dateStr.split(" ");
  if (!datePart || !timePart) return new Date(0);
  const [month, day, year] = datePart.split("/");
  const [hours, minutes] = timePart.split(":");
  const venueUtcOffset = STADIUM_UTC_OFFSET[String(stadiumId)] ?? -5;
  return new Date(
    Date.UTC(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hours, 10),
      parseInt(minutes, 10)
    ) - venueUtcOffset * 60 * 60 * 1000
  );
}

export const useWorldCupSchedule = (selectedTeams, dismissedIds = []) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId = null;

    const processGames = (raw) => {
      const withSyriaTime = raw.map((g) => ({
        ...g,
        syria_date: g.local_date
          ? toSyriaDateString(g.local_date, g.stadium_id)
          : null,
      }));
      withSyriaTime.sort(
        (a, b) =>
          parseMatchDate(a.local_date, a.stadium_id) -
          parseMatchDate(b.local_date, b.stadium_id)
      );
      return withSyriaTime;
    };

    const fetchGames = async () => {
      try {
        const response = await axios.get("https://worldcup26.ir/get/games");
        const raw = Array.isArray(response.data.games)
          ? response.data.games
          : [];
        const processed = processGames(raw);
        setGames(processed);

        // Smart polling: 60s if live match, 5min otherwise
        const hasLive = processed.some(
          (g) => g.time_elapsed !== "notstarted" && g.finished !== "TRUE"
        );
        const nextInterval = hasLive ? 60_000 : 5 * 60_000;

        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(fetchGames, nextInterval);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
    intervalId = setInterval(fetchGames, 5 * 60_000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
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

    return filtered.map((game, i, arr) => {
      const currentStart = parseMatchDate(game.local_date, game.stadium_id);
      const currentEnd = new Date(currentStart.getTime() + MATCH_DURATION_MS);
      let status = "safe";

      for (let j = 0; j < arr.length; j++) {
        if (j === i) continue;
        const otherStart = parseMatchDate(arr[j].local_date, arr[j].stadium_id);
        const otherEnd = new Date(otherStart.getTime() + MATCH_DURATION_MS);

        if (currentStart < otherEnd && currentEnd > otherStart) {
          status = "conflict";
          break;
        }

        const gapBefore = currentStart.getTime() - otherEnd.getTime();
        const gapAfter = otherStart.getTime() - currentEnd.getTime();
        if (
          (gapBefore >= 0 && gapBefore <= ONE_HOUR_MS) ||
          (gapAfter >= 0 && gapAfter <= ONE_HOUR_MS)
        ) {
          if (status !== "conflict") status = "close";
        }
      }

      return { ...game, status };
    });
  }, [games, selectedTeams, dismissedIds]);

  return { allGames: games, schedule, loading };
};
