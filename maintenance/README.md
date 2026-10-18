# Local subscription maintenance

The daily updater runs locally using `codex exec` and the existing ChatGPT login. It does not use an API key, GitHub Actions, or T3 scheduling. Only this public fork and its public upstream sources are in scope.

On this machine the controller is `/home/zhuyiwen/work/.pstack-maintenance/run.py`, the task prompt is `prompt.md` beside it, and the schedule is daily at **10:17 Asia/Shanghai**. Supercronic is managed by an independent user-owned Supervisor. No upstream change means no Agent run. An open maintenance PR pauses new work until reviewed. Each run is locked and limited to 45 minutes; useful partial work and logs survive failure.

The Agent ports official pstack content and Aqua Codex adaptation fixes, verifies the candidate, and creates a **draft PR** in `EwhenJoo/pstack-for-codex`. It never merges, installs or deploys automatically. Review exact inputs, omitted changes, test evidence and manual Codex/T3 acceptance before merging. The live local plugin is unchanged.

## Operate

```bash
# Read-only input/PR check; does not invoke Codex
python3 /home/zhuyiwen/work/.pstack-maintenance/run.py --check-only
# Run now (uses the subscription quota)
python3 /home/zhuyiwen/work/.pstack-maintenance/run.py
# Status; stop/start only this scheduler
supervisorctl -c /home/zhuyiwen/work/.pstack-maintenance/supervisor.conf status
supervisorctl -c /home/zhuyiwen/work/.pstack-maintenance/supervisor.conf stop pstack-daily
supervisorctl -c /home/zhuyiwen/work/.pstack-maintenance/supervisor.conf start pstack-daily
```

Logs and structured results are under `/home/zhuyiwen/work/.pstack-maintenance/logs/`; scheduler output is in `scheduler.log`. Subscription quota exhaustion, expired login or GitHub permissions can block a run. A structured blocked result writes blocked.json beside the controller; later ticks do not invoke Codex until the owner resolves the reason and explicitly clears that hold. This avoids repeatedly spending quota on the same permission denial. Use `codex login` yourself if authentication expires; never copy login tokens into the repository.

This container has no systemd or running root cron. Supervisor recovers the scheduler process while Supervisor itself is alive, but container restart recovery is **not configured or verified**. After a container restart, restore this independent service with:

```bash
supervisord -c /home/zhuyiwen/work/.pstack-maintenance/supervisor.conf
```

Do not run that command when the same supervisor is already running. No T3 process is required.
