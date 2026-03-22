---
description: Check Kwery data ingestion health for all sources
---

Call `kwery_status` (limit=50 by default) and display:
- Each source with its last successful ingestion time
- Status (ok / stale / error)
- Rows inserted in the last run

Flag any source that is stale (last run > 2 hours ago) or in error state.
Suggest re-running the backtest only after confirming data freshness.
