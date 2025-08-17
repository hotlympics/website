import { useCallback, useEffect, useState } from "react";
import {
    LeaderboardEntry,
    leaderboardCacheService,
} from "../../services/cache/leaderboard.js";

export type LeaderboardType =
    | "female_top"
    | "female_bottom"
    | "male_top"
    | "male_bottom";

export interface LeaderboardDisplayInfo {
    key: LeaderboardType;
    label: string;
    description: string;
}

export const LEADERBOARD_OPTIONS: LeaderboardDisplayInfo[] = [
    {
        key: "female_top",
        label: "Female Top 10",
        description: "Highest rated female participants",
    },
    {
        key: "female_bottom",
        label: "Female Bottom 10",
        description: "Lowest rated female participants",
    },
    {
        key: "male_top",
        label: "Male Top 10",
        description: "Highest rated male participants",
    },
    {
        key: "male_bottom",
        label: "Male Bottom 10",
        description: "Lowest rated male participants",
    },
];

interface LeaderboardState {
    entries: LeaderboardEntry[];
    loading: boolean;
    error: string | null;
    selectedEntry: LeaderboardEntry | null;
    viewMode: "podium" | "detail";
    currentLeaderboard: LeaderboardType;
}

interface UseLeaderboardReturn extends LeaderboardState {
    selectEntry: (entry: LeaderboardEntry) => void;
    clearSelection: () => void;
    switchLeaderboard: (type: LeaderboardType) => void;
    refreshLeaderboard: () => Promise<void>;
    getCurrentLeaderboardInfo: () => LeaderboardDisplayInfo;
}

export const useLeaderboard = (
    initialType: LeaderboardType = "female_top"
): UseLeaderboardReturn => {
    const [state, setState] = useState<LeaderboardState>({
        entries: [],
        loading: true,
        error: null,
        selectedEntry: null,
        viewMode: "podium",
        currentLeaderboard: initialType,
    });

    const loadLeaderboard = useCallback(async (type: LeaderboardType) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            // Try to load from cache first
            const cacheResult = leaderboardCacheService.loadLeaderboard(
                type,
                10 * 60 * 1000
            ); // 10 minutes

            if (cacheResult.isValid && cacheResult.data) {
                setState((prev) => ({
                    ...prev,
                    entries: cacheResult.data!.entries,
                    loading: false,
                    currentLeaderboard: type,
                }));
                return;
            }

            // Cache miss or expired - fetch from server
            const success = await leaderboardCacheService.cacheLeaderboard(
                type,
                { preloadImages: true }
            );

            if (success) {
                // Load the freshly cached data
                const freshCacheResult =
                    leaderboardCacheService.loadLeaderboard(
                        type,
                        10 * 60 * 1000
                    );

                if (freshCacheResult.isValid && freshCacheResult.data) {
                    setState((prev) => ({
                        ...prev,
                        entries: freshCacheResult.data!.entries,
                        loading: false,
                        currentLeaderboard: type,
                    }));
                } else {
                    throw new Error(
                        "Failed to load cached data after successful fetch"
                    );
                }
            } else {
                throw new Error("Failed to fetch leaderboard data");
            }
        } catch (error) {
            console.error(`Error loading leaderboard ${type}:`, error);
            setState((prev) => ({
                ...prev,
                entries: [],
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load leaderboard",
            }));
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadLeaderboard(state.currentLeaderboard);
    }, [loadLeaderboard, state.currentLeaderboard]);

    const selectEntry = useCallback((entry: LeaderboardEntry) => {
        setState((prev) => ({
            ...prev,
            selectedEntry: entry,
            viewMode: "detail",
        }));
    }, []);

    const clearSelection = useCallback(() => {
        setState((prev) => ({
            ...prev,
            selectedEntry: null,
            viewMode: "podium",
        }));
    }, []);

    const switchLeaderboard = useCallback(
        (type: LeaderboardType) => {
            if (type === state.currentLeaderboard) return;

            // Clear selection when switching leaderboards
            setState((prev) => ({
                ...prev,
                currentLeaderboard: type,
                selectedEntry: null,
                viewMode: "podium",
            }));

            loadLeaderboard(type);
        },
        [state.currentLeaderboard, loadLeaderboard]
    );

    const refreshLeaderboard = useCallback(async () => {
        await loadLeaderboard(state.currentLeaderboard);
    }, [state.currentLeaderboard, loadLeaderboard]);

    const getCurrentLeaderboardInfo =
        useCallback((): LeaderboardDisplayInfo => {
            return (
                LEADERBOARD_OPTIONS.find(
                    (option) => option.key === state.currentLeaderboard
                ) || LEADERBOARD_OPTIONS[0]
            );
        }, [state.currentLeaderboard]);

    return {
        ...state,
        selectEntry,
        clearSelection,
        switchLeaderboard,
        refreshLeaderboard,
        getCurrentLeaderboardInfo,
    };
};
