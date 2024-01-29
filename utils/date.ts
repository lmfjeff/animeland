export function pastSeasons(year: number, season: number, numOfSeason: number) {
  const list: any[] = []
  for (let i = 0; i < numOfSeason; i++) {
    year = season === 1 ? year - 1 : year
    season = season === 1 ? 4 : season - 1
    list.push({ year, season })
  }
  return list
}
