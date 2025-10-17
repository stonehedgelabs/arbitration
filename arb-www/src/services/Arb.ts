import { useCallback, useState } from "react";
import { buildApiUrl } from '../config';
import { BoxScoreResponse } from '../schema';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  setLeagueScores, setLeagueTeamProfiles, setLeagueStadiums, setLeagueSchedule,
  setLeagueOdds, setLeagueCurrentGames, setLeagueLoading, setLeagueError
} from '../store/slices/sportsDataSlice';

const getUserFriendlyError = (dataType: string, league: string, error: any): string => {
  const L = league.toUpperCase();
  if (error?.message?.includes('fetch') || error?.message?.includes('NetworkError') || error?.message?.includes('Failed to fetch')) return `Failed to fetch ${L} ${dataType}. Network issue`;
  if (error?.message?.includes('404') || error?.message?.includes('Not Found')) return `Failed to fetch ${L} ${dataType}. Data not available`;
  if (error?.message?.includes('500') || error?.message?.includes('503') || error?.message?.includes('502')) return `Failed to fetch ${L} ${dataType}. Server issue`;
  return `Failed to fetch ${L} ${dataType}. Please try again`;
};

const useArb = () => {
  const [mlbBoxScore, setMlbBoxScore] = useState<BoxScoreResponse | null>(null);
  const dispatch = useAppDispatch();
  const leagueData = useAppSelector((s) => s.sportsData.leagueData);

  const selectedLeague = useAppSelector((s) => s.sportsData.selectedLeague);
  const current = leagueData[selectedLeague] ?? {};
  const scores = current.scores ?? null;
  const teamProfiles = current.teamProfiles ?? null;
  const stadiums = current.stadiums ?? null;
  const schedule = current.schedule ?? null;
  const odds = current.odds ?? null;
  const currentGames = current.currentGames ?? null;

  const scoresLoading = current.scoresLoading ?? false;
  const teamProfilesLoading = current.teamProfilesLoading ?? false;
  const stadiumsLoading = current.stadiumsLoading ?? false;
  const scheduleLoading = current.scheduleLoading ?? false;
  const oddsLoading = current.oddsLoading ?? false;
  const currentGamesLoading = current.currentGamesLoading ?? false;

  const scoresError = current.scoresError ?? null;
  const teamProfilesError = current.teamProfilesError ?? null;
  const stadiumsError = current.stadiumsError ?? null;
  const scheduleError = current.scheduleError ?? null;
  const oddsError = current.oddsError ?? null;
  const currentGamesError = current.currentGamesError ?? null;

  const norm = (l: string) => l?.toLowerCase?.() ?? l;

  const fetchScores = useCallback(async (leagueArg: string, date?: string, cache: boolean = true) => {
    const L = norm(leagueArg);
    const ld = leagueData[L] ?? {};
    if (ld.scoresLoading) return;
    try {
      dispatch(setLeagueLoading({ league: L, dataType: 'scores', loading: true }));
      const params: Record<string,string> = { league: L, cache: cache.toString() };
      if (date) params.date = date;
      const res = await fetch(buildApiUrl('/api/v1/scores', params));
      if (!res.ok) throw new Error(`Failed to fetch scores: ${res.status}`);
      const data = await res.json();
      dispatch(setLeagueScores({ league: L, data }));
    } catch (err) {
      dispatch(setLeagueError({ league: L, dataType: 'scores', error: getUserFriendlyError('scores', L, err) }));
    } finally {
      dispatch(setLeagueLoading({ league: L, dataType: 'scores', loading: false }));
    }
  }, [dispatch, leagueData]);

  const fetchTeamProfiles = useCallback(async (leagueArg?: string, cache: boolean = true) => {
    if (!leagueArg) return;
    const L = norm(leagueArg);
    const ld = leagueData[L] ?? {};
    if (ld.teamProfilesLoading) return;
    try {
      dispatch(setLeagueLoading({ league: L, dataType: 'teamProfiles', loading: true }));
      const res = await fetch(buildApiUrl('/api/team-profile', { league: L, cache: cache.toString() }));
      if (!res.ok) throw new Error(`Failed to fetch team profiles: ${res.status}`);
      const data = await res.json();
      dispatch(setLeagueTeamProfiles({ league: L, data }));
    } catch (err) {
      dispatch(setLeagueError({ league: L, dataType: 'teamProfiles', error: getUserFriendlyError('team profiles', L, err) }));
    } finally {
      dispatch(setLeagueLoading({ league: L, dataType: 'teamProfiles', loading: false }));
    }
  }, [dispatch, leagueData]);

  const fetchBoxScore = useCallback(async (leagueArg: string, gameId: string, scoreId?: string, cache: boolean = true) => {
    const L = norm(leagueArg);
    try {
      const params: Record<string,string> = L === 'NFL' && scoreId ? { league: L, score_id: scoreId, cache: cache.toString() } : { league: L, game_id: gameId, cache: cache.toString() };
      const res = await fetch(buildApiUrl('/api/v1/box-score', params), { method: 'GET', headers: { 'Content-Type': 'application/json' }});
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setMlbBoxScore(BoxScoreResponse.fromJSON(data));
    } catch {}
  }, []);

  const fetchStadiums = useCallback(async (leagueArg: string, cache: boolean = true) => {
    if (!leagueArg) return;
    const L = norm(leagueArg);
    const ld = leagueData[L] ?? {};
    if (ld.stadiumsLoading) return;
    try {
      dispatch(setLeagueLoading({ league: L, dataType: 'stadiums', loading: true }));
      const res = await fetch(buildApiUrl('/api/v1/stadiums', { league: L, cache: cache.toString() }));
      if (!res.ok) throw new Error(`Failed to fetch stadiums: ${res.status}`);
      const data = await res.json();
      dispatch(setLeagueStadiums({ league: L, data }));
    } catch (err) {
      dispatch(setLeagueError({ league: L, dataType: 'stadiums', error: getUserFriendlyError('stadiums', L, err) }));
    } finally {
      dispatch(setLeagueLoading({ league: L, dataType: 'stadiums', loading: false }));
    }
  }, [dispatch, leagueData]);

  const fetchSchedule = useCallback(async (leagueArg: string, date?: string, cache: boolean = true) => {
    const L = norm(leagueArg);
    const ld = leagueData[L] ?? {};
    if (ld.scheduleLoading) return;
    try {
      dispatch(setLeagueLoading({ league: L, dataType: 'schedule', loading: true }));
      const params: Record<string,string> = { league: L, cache: cache.toString() };
      if (date) params.date = date;
      const res = await fetch(buildApiUrl('/api/v1/schedule', params));
      if (!res.ok) throw new Error(`Failed to fetch schedule: ${res.status}`);
      const data = await res.json();
      dispatch(setLeagueSchedule({ league: L, data }));
    } catch (err) {
      dispatch(setLeagueError({ league: L, dataType: 'schedule', error: getUserFriendlyError('schedule', L, err) }));
    } finally {
      dispatch(setLeagueLoading({ league: L, dataType: 'schedule', loading: false }));
    }
  }, [dispatch, leagueData]);

  const fetchOdds = useCallback(async (leagueArg: string, date: string, cache: boolean = true) => {
    const L = norm(leagueArg);
    const ld = leagueData[L] ?? {};
    if (ld.oddsLoading) return;
    try {
      dispatch(setLeagueLoading({ league: L, dataType: 'odds', loading: true }));
      const res = await fetch(buildApiUrl('/api/v1/odds-by-date', { league: L, date, cache: cache.toString() }));
      if (!res.ok) throw new Error(`Failed to fetch odds: ${res.status}`);
      const data = await res.json();
      dispatch(setLeagueOdds({ league: L, data }));
    } catch (err) {
      dispatch(setLeagueError({ league: L, dataType: 'odds', error: getUserFriendlyError('odds', L, err) }));
    } finally {
      dispatch(setLeagueLoading({ league: L, dataType: 'odds', loading: false }));
    }
  }, [dispatch, leagueData]);

  const fetchCurrentGames = useCallback(async (leagueArg: string, start: string, end: string, cache: boolean = true) => {
    const L = norm(leagueArg);
    try {
      dispatch(setLeagueLoading({ league: L, dataType: 'currentGames', loading: true }));
      const res = await fetch(buildApiUrl('/api/v1/current-games', { league: L, start, end, cache: cache.toString() }));
      if (!res.ok) throw new Error(`Failed to fetch current games: ${res.status}`);
      const data = await res.json();
      dispatch(setLeagueCurrentGames({ league: L, data }));
    } catch (err) {
      dispatch(setLeagueError({ league: L, dataType: 'currentGames', error: getUserFriendlyError('current games', L, err) }));
    } finally {
      dispatch(setLeagueLoading({ league: L, dataType: 'currentGames', loading: false }));
    }
  }, [dispatch]);

  return {
    scores, teamProfiles, stadiums, schedule, odds, currentGames, mlbBoxScore,
    scoresLoading, teamProfilesLoading, stadiumsLoading, scheduleLoading, oddsLoading, currentGamesLoading,
    scoresError, teamProfilesError, stadiumsError, scheduleError, oddsError, currentGamesError,
    fetchScores, fetchTeamProfiles, fetchBoxScore, fetchStadiums, fetchSchedule, fetchCurrentGames, fetchOddsByDate: fetchOdds,
  };
};

export default useArb;
