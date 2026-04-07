alter table public.workouts
  add column if not exists duration_minutes integer null,
  add column if not exists distance_km numeric(6,2) null,
  add column if not exists pace_seconds_per_km integer null;

alter table public.workouts
  drop constraint if exists workouts_duration_minutes_check,
  drop constraint if exists workouts_distance_km_check,
  drop constraint if exists workouts_pace_seconds_per_km_check;

alter table public.workouts
  add constraint workouts_duration_minutes_check
    check (duration_minutes is null or duration_minutes > 0),
  add constraint workouts_distance_km_check
    check (distance_km is null or distance_km >= 0),
  add constraint workouts_pace_seconds_per_km_check
    check (pace_seconds_per_km is null or pace_seconds_per_km > 0);
