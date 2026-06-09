import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const TEAMS_KEY = "@fifia_selected_teams";
const DISMISSED_KEY = "@fifia_dismissed_matches";

export function usePersistentState() {
  const [teams, setTeamsState] = useState<string[]>([]);
  const [dismissedIds, setDismissedState] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // Load on mount
  useEffect(() => {
    async function load() {
      try {
        const [teamsRaw, dismissedRaw] = await Promise.all([
          AsyncStorage.getItem(TEAMS_KEY),
          AsyncStorage.getItem(DISMISSED_KEY),
        ]);
        if (teamsRaw) setTeamsState(JSON.parse(teamsRaw));
        if (dismissedRaw) setDismissedState(JSON.parse(dismissedRaw));
      } catch (e) {
        console.warn("Storage load error:", e);
      } finally {
        setReady(true);
      }
    }
    load();
  }, []);

  const setTeams = async (newTeams: string[]) => {
    setTeamsState(newTeams);
    try {
      await AsyncStorage.setItem(TEAMS_KEY, JSON.stringify(newTeams));
    } catch (e) {
      console.warn("Storage save teams error:", e);
    }
  };

  const dismissMatch = async (id: string) => {
    setDismissedState((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(next)).catch(
        (e) => console.warn("Storage save dismissed error:", e)
      );
      return next;
    });
  };

  const restoreMatch = async (id: string) => {
    setDismissedState((prev) => {
      const next = prev.filter((x) => x !== id);
      AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(next)).catch(
        (e) => console.warn("Storage save dismissed error:", e)
      );
      return next;
    });
  };

  const clearAll = async () => {
    setTeamsState([]);
    setDismissedState([]);
    try {
      await Promise.all([
        AsyncStorage.removeItem(TEAMS_KEY),
        AsyncStorage.removeItem(DISMISSED_KEY),
      ]);
    } catch (e) {
      console.warn("Storage clear error:", e);
    }
  };

  return { teams, setTeams, dismissedIds, dismissMatch, restoreMatch, clearAll, ready };
}
