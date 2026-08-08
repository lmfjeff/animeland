# Animeland — Project TODO

---

## 🔴 High Priority

### [ ] Replace Jikan/MAL API with a more reliable alternative

**Problem:** Jikan (which proxies MyAnimeList data) has stale airing statuses. Anime that have already started broadcasting still show `"status": "Not yet aired"` and `"score": null`, which means broadcast schedules and ratings cannot be synced accurately.

**Example:**

- BLEACH 千年血戰篇-禍進譚- (MAL #60636) — aired Jul 25, 2026 but Jikan still returns `airing: false, score: null`

**Candidates to evaluate:**

| API                 | What it provides                                                       | Notes                                                        |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| **AniList GraphQL** | Score (`meanScore`), status (`RELEASING`), airingAt, nextAiringEpisode | Already integrated for season ingest — can extend for scores |
| **AniDB**           | Broadcast times, ratings, episode data                                 | Requires registration + UDP or HTTP API                      |
| **Kitsu API**       | Ratings, airing status, episode schedule                               | REST/JSON:API, no key required                               |
| **AnimePlanet**     | Community ratings                                                      | Scraping only, no public API                                 |

**Recommended approach:** Extend the existing **AniList GraphQL** sync (Step 1) to also pull `meanScore`, `status`, and `nextAiringEpisode` — eliminating the need for a separate Jikan/MAL step entirely for score + airing status.

**Scope of change:**

- [ ] Evaluate AniList score accuracy vs MAL score
- [ ] Update `anilist-sync-job.ts` to also ingest `meanScore` → `score_external.anilist`
- [ ] Decide whether to keep `jikan-sync-job.ts` for broadcast time only (MAL is more reliable for JST broadcast schedule) or replace fully
- [ ] Update `score_external` schema/usage across the codebase

_Last updated: 2026-08-08_
