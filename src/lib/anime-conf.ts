import { ANIME, MANGA, META } from "@consumet/extensions";

const mangareader = new MANGA.MangaReader();

const anilist = new META.Anilist();
const tmdb = new META.TMDB();

export { mangareader, anilist, tmdb };
