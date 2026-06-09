import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePersistentState } from "../hooks/usePersistentState";
import { useWorldCupSchedule } from "../hooks/useWorldCupSchedule";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Match {
  id: string;
  status?: "conflict" | "close" | "safe";
  local_date: string;
  group?: string;
  home_team_name_en: string;
  away_team_name_en: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateTime(dateStr: string) {
  if (!dateStr) return { date: "—", time: "—", fullDate: "—" };
  const parts = dateStr.split(" ");
  if (parts.length < 2) return { date: dateStr, time: "", fullDate: dateStr };
  const [datePart, timePart] = parts;
  const [month, day, year] = datePart.split("/");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthName = monthNames[parseInt(month, 10) - 1] ?? month;
  return {
    date: `${parseInt(day, 10)} ${monthName}`,
    time: timePart,
    fullDate: `${parseInt(day, 10)} ${monthName} ${year}`,
  };
}

// ─── Status ───────────────────────────────────────────────────────────────────
type StatusCfg = { border: string; bg: string; accent: string; tag: string; tagBg: string };

function statusCfg(status?: string): StatusCfg {
  if (status === "conflict")
    return { border: "#FF3B55", bg: "#1A0810", accent: "#FF3B55", tag: "⚠ CONFLICT", tagBg: "#3D0B15" };
  if (status === "close")
    return { border: "#F5A623", bg: "#1A1200", accent: "#F5A623", tag: "⏱ CLOSE", tagBg: "#3D2B00" };
  return { border: "#1C2E45", bg: "#0B1625", accent: "#2563EB", tag: "", tagBg: "" };
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <View style={s.chip}>
      <Text style={s.chipText}>{label}</Text>
      <Pressable onPress={onRemove} style={s.chipClose} hitSlop={10}>
        <Text style={s.chipCloseText}>{"\u00D7"}</Text>
      </Pressable>
    </View>
  );
}

// ─── All Matches Row ──────────────────────────────────────────────────────────
function AllMatchRow({ item, index }: { item: Match; index: number }) {
  const { date, time } = formatDateTime(item.local_date);
  const home = item.home_team_name_en || "TBD";
  const away = item.away_team_name_en || "TBD";
  const isTbd = !item.home_team_name_en && !item.away_team_name_en;

  return (
    <View style={[s.row, index % 2 === 0 ? s.rowEven : s.rowOdd, isTbd && s.rowDim]}>
      <Text style={s.rowNum}>{index + 1}</Text>
      <View style={s.rowDate}>
        <Text style={s.rowDateText}>{date}</Text>
        <Text style={s.rowTimeText}>{time}</Text>
      </View>
      <Text style={[s.rowTeam, s.right]} numberOfLines={1}>{home}</Text>
      <View style={s.rowVsWrap}><Text style={s.rowVs}>vs</Text></View>
      <Text style={[s.rowTeam, s.left]} numberOfLines={1}>{away}</Text>
      {item.group ? (
        <View style={s.rowGroup}><Text style={s.rowGroupText}>{item.group}</Text></View>
      ) : (
        <View style={s.rowGroupEmpty} />
      )}
    </View>
  );
}

// ─── Schedule Card ────────────────────────────────────────────────────────────
function SchedCard({
  item,
  index,
  onDismiss,
}: {
  item: Match;
  index: number;
  onDismiss: (id: string) => void;
}) {
  const { fullDate, time } = formatDateTime(item.local_date);
  const cfg = statusCfg(item.status);
  const home = item.home_team_name_en || "TBD";
  const away = item.away_team_name_en || "TBD";

  function handleDismiss() {
    Alert.alert(
      "Remove Match",
      `Remove "${home} vs ${away}" from your schedule?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onDismiss(item.id),
        },
      ]
    );
  }

  return (
    <View style={[s.card, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <View style={[s.cardBar, { backgroundColor: cfg.accent }]} />
      <View style={s.cardInner}>
        {/* Header */}
        <View style={s.cardHeader}>
          <View style={s.cardIndexWrap}>
            <Text style={s.cardIndex}>{index + 1}</Text>
          </View>
          {cfg.tag ? (
            <View style={[s.cardTag, { backgroundColor: cfg.tagBg }]}>
              <Text style={[s.cardTagText, { color: cfg.accent }]}>{cfg.tag}</Text>
            </View>
          ) : null}
          {item.group ? (
            <View style={s.cardGroupWrap}>
              <Text style={s.cardGroupText}>Group {item.group}</Text>
            </View>
          ) : null}
          {/* Dismiss X */}
          <Pressable onPress={handleDismiss} style={s.dismissBtn} hitSlop={10}>
            <Text style={s.dismissText}>{"\u00D7"}</Text>
          </Pressable>
        </View>

        {/* Teams */}
        <View style={s.cardTeams}>
          <Text style={[s.cardTeamName, s.right]} numberOfLines={2}>{home}</Text>
          <View style={s.cardVsCircle}>
            <Text style={s.cardVs}>VS</Text>
          </View>
          <Text style={[s.cardTeamName, s.left]} numberOfLines={2}>{away}</Text>
        </View>

        {/* Meta */}
        <View style={s.cardMeta}>
          <Text style={s.cardMetaText}>📅 {fullDate}</Text>
          <View style={s.metaDivider} />
          <Text style={s.cardMetaText}>🕐 {time}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function LegendBar() {
  return (
    <View style={s.legend}>
      {[
        { color: "#FF3B55", label: "Overlap" },
        { color: "#F5A623", label: "< 1h gap" },
        { color: "#22D3A5", label: "Safe" },
      ].map(({ color, label }) => (
        <View key={label} style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: color }]} />
          <Text style={s.legendText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function Home() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [tab, setTab] = useState<"all" | "sched">("all");

  const { teams, setTeams, dismissedIds, dismissMatch, clearAll, ready } =
    usePersistentState();

  const { allGames, schedule, loading } = useWorldCupSchedule(teams, dismissedIds);

  // Build a set of all known team names (from API data) for validation
  const knownTeams = useMemo(() => {
    const names = new Set<string>();
    allGames.forEach((g: Match) => {
      if (g.home_team_name_en) names.add(g.home_team_name_en.toLowerCase());
      if (g.away_team_name_en) names.add(g.away_team_name_en.toLowerCase());
    });
    return names;
  }, [allGames]);

  function addTeam() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const candidates = trimmed
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (loading || knownTeams.size === 0) {
      // Games not loaded yet — add optimistically
      const toAdd = candidates.filter(
        (t) => !teams.some((e) => e.toLowerCase() === t.toLowerCase())
      );
      if (toAdd.length) { setTeams([...teams, ...toAdd]); setTab("sched"); }
      setInput(""); setInputError("");
      return;
    }

    const valid: string[] = [];
    const invalid: string[] = [];

    candidates.forEach((t) => {
      // Check partial match (e.g. "brazil" matches "Brazil")
      const matchFound = [...knownTeams].some((name) => name.includes(t.toLowerCase()));
      const alreadyAdded = teams.some((e) => e.toLowerCase() === t.toLowerCase());
      if (!matchFound) {
        invalid.push(t);
      } else if (!alreadyAdded) {
        valid.push(t);
      }
    });

    if (invalid.length > 0) {
      setInputError(
        `"${invalid.join(", ")}" not found in World Cup 2026 teams.`
      );
      return;
    }

    setInputError("");
    if (valid.length) {
      setTeams([...teams, ...valid]);
      setTab("sched");
    }
    setInput("");
  }

  function handleReset() {
    Alert.alert(
      "Reset Everything",
      "This will clear all selected teams and restore removed matches. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: clearAll },
      ]
    );
  }

  const removeTeam = (t: string) => setTeams(teams.filter((x) => x !== t));

  const renderAll: ListRenderItem<Match> = ({ item, index }) => (
    <AllMatchRow item={item} index={index} />
  );
  const renderSched: ListRenderItem<Match> = ({ item, index }) => (
    <SchedCard item={item} index={index} onDismiss={dismissMatch} />
  );

  if (!ready) {
    return (
      <View style={[s.root, s.center, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#050C18" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerEmoji}>⚽</Text>
          <View>
            <Text style={s.headerTitle}>Last Dance</Text>
            <Text style={s.headerSub}>FIFA World Cup 2026</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          {!loading && (
            <View style={s.headerPill}>
              <Text style={s.headerPillText}>{allGames.length} matches</Text>
            </View>
          )}
          {(teams.length > 0 || dismissedIds.length > 0) && (
            <Pressable onPress={handleReset} style={s.clearBtn} hitSlop={8}>
              <Text style={s.clearBtnText}>Reset</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Search ── */}
      <View style={s.searchWrap}>
        <TextInput
          style={[s.searchInput, !!inputError && s.searchInputError]}
          placeholder="Search team (e.g. Brazil)"
          placeholderTextColor="#253649"
          value={input}
          onChangeText={(t) => { setInput(t); if (inputError) setInputError(""); }}
          onSubmitEditing={addTeam}
          returnKeyType="done"
        />
        <Pressable style={s.searchBtn} onPress={addTeam}>
          <Text style={s.searchBtnText}>Add</Text>
        </Pressable>
      </View>
      {!!inputError && (
        <Text style={s.errorText}>⚠ {inputError}</Text>
      )}

      {/* ── Chips ── */}
      {teams.length > 0 && (
        <View style={s.chipsWrap}>
          {teams.map((t) => (
            <Chip key={t} label={t} onRemove={() => removeTeam(t)} />
          ))}
        </View>
      )}

      {/* ── Tabs ── */}
      <View style={s.tabs}>
        <Pressable style={[s.tab, tab === "all" && s.tabOn]} onPress={() => setTab("all")}>
          <Text style={[s.tabText, tab === "all" && s.tabTextOn]}>
            All {loading ? "" : `(${allGames.length})`}
          </Text>
        </Pressable>
        <Pressable style={[s.tab, tab === "sched" && s.tabOn]} onPress={() => setTab("sched")}>
          <Text style={[s.tabText, tab === "sched" && s.tabTextOn]}>
            My Schedule {teams.length ? `(${schedule.length})` : ""}
          </Text>
        </Pressable>
      </View>

      {/* ── Body ── */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={s.loadText}>Loading matches…</Text>
        </View>
      ) : tab === "all" ? (
        <>
          <View style={s.tableHead}>
            <Text style={[s.thCell, { width: 28 }]}>#</Text>
            <Text style={[s.thCell, { width: 78 }]}>DATE / TIME</Text>
            <Text style={[s.thCell, { flex: 1, textAlign: "right" }]}>HOME</Text>
            <Text style={[s.thCell, { width: 28 }]} />
            <Text style={[s.thCell, { flex: 1 }]}>AWAY</Text>
            <Text style={[s.thCell, { width: 32, textAlign: "center" }]}>GRP</Text>
          </View>
          <FlatList
            data={allGames as Match[]}
            keyExtractor={(item, i) => item.id ?? String(i)}
            renderItem={renderAll}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState emoji="📭" text="No matches" />}
          />
        </>
      ) : (
        <FlatList
          data={schedule as Match[]}
          keyExtractor={(item, i) => item.id ?? String(i)}
          renderItem={renderSched}
          contentContainerStyle={s.schedList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={schedule.length > 0 ? <LegendBar /> : null}
          ListEmptyComponent={
            <EmptyState
              emoji={teams.length ? "🗑️" : "🏟️"}
              text={
                teams.length
                  ? dismissedIds.length > 0
                    ? "All matches removed.\nPress Reset to restore."
                    : "No matches found for selected teams."
                  : "Add teams above to build your schedule"
              }
            />
          }
        />
      )}
    </View>
  );
}

function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={s.center}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</Text>
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const ROW_H = 52;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050C18" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 11 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerEmoji: { fontSize: 32 },
  headerTitle: { color: "#EEF5FF", fontSize: 19, fontWeight: "800", letterSpacing: 0.2 },
  headerSub: { color: "#2D4B6A", fontSize: 12, marginTop: 1 },
  headerPill: {
    backgroundColor: "#0D1E32",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#16304D",
  },
  headerPillText: { color: "#3B78B8", fontSize: 12, fontWeight: "700" },
  clearBtn: {
    backgroundColor: "#2D1010",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#5A1E1E",
  },
  clearBtnText: { color: "#FF6B6B", fontSize: 12, fontWeight: "700" },

  // Search
  searchWrap: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    height: 46,
    backgroundColor: "#0B1828",
    color: "#C8DDEF",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: "#142234",
  },
  searchInputError: {
    borderColor: "#FF3B55",
  },
  searchBtn: {
    width: 64,
    height: 46,
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },

  // Chips
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C2040",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E4080",
    overflow: "hidden",
  },
  chipText: {
    color: "#93C5FD",
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 10,
  },
  chipClose: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 8,
    paddingHorizontal: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  chipCloseText: { color: "#fff", fontSize: 16, fontWeight: "700", lineHeight: 18 },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#091424",
    borderRadius: 11,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#112235",
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  tabOn: { backgroundColor: "#1D4ED8" },
  tabText: { color: "#253649", fontSize: 13, fontWeight: "600" },
  tabTextOn: { color: "#fff" },

  // Table header
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#0D1E32",
  },
  thCell: { color: "#1E3A5A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },

  // All-matches rows
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_H,
    paddingHorizontal: 14,
    gap: 4,
  },
  rowEven: { backgroundColor: "#071120" },
  rowOdd: { backgroundColor: "#050C18" },
  rowDim: { opacity: 0.4 },
  rowNum: { width: 24, color: "#1E3A5A", fontSize: 11, fontWeight: "600", textAlign: "center" },
  rowDate: { width: 78 },
  rowDateText: { color: "#2D4B6A", fontSize: 10, fontWeight: "600" },
  rowTimeText: { color: "#5B8DB8", fontSize: 14, fontWeight: "700", marginTop: 1 },
  rowTeam: { flex: 1, color: "#BDD5EE", fontSize: 13, fontWeight: "600" },
  rowVsWrap: { width: 22, alignItems: "center" },
  rowVs: { color: "#142234", fontSize: 9, fontWeight: "800" },
  rowGroup: {
    width: 30, height: 22,
    backgroundColor: "#0D1E32", borderRadius: 5,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#163048",
  },
  rowGroupText: { color: "#F59E0B", fontSize: 10, fontWeight: "800" },
  rowGroupEmpty: { width: 30 },

  // Schedule cards
  schedList: { padding: 14, paddingBottom: 20 },
  card: {
    flexDirection: "row", borderRadius: 14,
    borderWidth: 1.5, marginBottom: 12, overflow: "hidden",
  },
  cardBar: { width: 5 },
  cardInner: { flex: 1, padding: 14 },
  cardHeader: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 12,
  },
  cardIndexWrap: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#0F2035",
    justifyContent: "center", alignItems: "center",
  },
  cardIndex: { color: "#3B6A96", fontSize: 11, fontWeight: "700" },
  cardTag: { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 3 },
  cardTagText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.3 },
  cardGroupWrap: {
    backgroundColor: "#0D1E32", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  cardGroupText: { color: "#F59E0B", fontSize: 11, fontWeight: "700" },
  dismissBtn: {
    marginLeft: "auto",
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#1A0A0A",
    borderWidth: 1, borderColor: "#4A1E1E",
    justifyContent: "center", alignItems: "center",
  },
  dismissText: { color: "#FF6B6B", fontSize: 20, fontWeight: "700", lineHeight: 22, textAlign: "center" },
  cardTeams: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 12,
  },
  cardTeamName: { flex: 1, color: "#E8F3FF", fontSize: 16, fontWeight: "700", lineHeight: 21 },
  cardVsCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#0D1E32",
    justifyContent: "center", alignItems: "center",
  },
  cardVs: { color: "#203450", fontSize: 10, fontWeight: "900" },
  cardMeta: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#060F1E", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7, gap: 10,
  },
  cardMetaText: { color: "#3B6A96", fontSize: 12, fontWeight: "600" },
  metaDivider: { width: 1, height: 14, backgroundColor: "#0F2035" },

  // Legend
  legend: {
    flexDirection: "row", justifyContent: "center", gap: 24,
    backgroundColor: "#071120", borderRadius: 10,
    paddingVertical: 9, marginBottom: 14,
    borderWidth: 1, borderColor: "#0D1E32",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 7 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { color: "#2D4B6A", fontSize: 12, fontWeight: "600" },

  // States
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  loadText: { color: "#1E3A5A", marginTop: 14, fontSize: 14 },
  emptyText: {
    color: "#1E3A5A", fontSize: 15,
    textAlign: "center", paddingHorizontal: 40, lineHeight: 24,
  },

  right: { textAlign: "right" },
  left: { textAlign: "left" },
});
