-- Create table for derivatives snapshots
create table if not exists derivatives_snapshots (
  id           bigint generated always as identity primary key,
  ts           timestamptz default now(),
  exchange     text,
  symbol       text,                     -- e.g. BTCUSD-PERP
  contract_type text,                    -- 'perpetual' | 'future'
  oi_usd       numeric,                  -- open-interest USD
  funding_rate numeric,                  -- 8-h (%)
  volume_24h   numeric,
  index_price  numeric
);

-- Create index for efficient querying
create index if not exists derivatives_snapshots_idx on derivatives_snapshots(symbol, exchange, contract_type, ts desc);

-- Create materialized view for "latest by symbol"
create materialized view if not exists derivatives_latest as
select distinct on (exchange, symbol)
  *
from derivatives_snapshots
order by exchange, symbol, ts desc;

-- Create function to refresh the materialized view
create or replace function refresh_derivatives_latest()
returns trigger as $$
begin
  refresh materialized view derivatives_latest;
  return null;
end;
$$ language plpgsql;

-- Create trigger to refresh the materialized view after inserts
drop trigger if exists refresh_derivatives_latest_trigger on derivatives_snapshots;
create trigger refresh_derivatives_latest_trigger
after insert on derivatives_snapshots
for each statement
execute function refresh_derivatives_latest();
