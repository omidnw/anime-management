export interface AnimeImage {
	jpg: {
		image_url: string;
		small_image_url?: string;
		large_image_url?: string;
	};
	webp?: {
		image_url: string;
		small_image_url?: string;
		large_image_url?: string;
	};
}

export interface AnimeTitle {
	type: string;
	title: string;
}

export interface AnimeAired {
	from: string;
	to: string | null;
	prop: {
		from: {
			day: number;
			month: number;
			year: number;
		};
		to: {
			day: number | null;
			month: number | null;
			year: number | null;
		};
	};
	string: string;
}

export interface AnimeGenre {
	mal_id: number;
	name: string;
	url: string;
	count: number;
}

export interface AnimeStudio {
	mal_id: number;
	type: string;
	name: string;
	url: string;
}

export interface AnimeData {
	mal_id: number;
	url: string;
	images: {
		jpg: {
			image_url: string;
			small_image_url: string;
			large_image_url: string;
		};
		webp: {
			image_url: string;
			small_image_url: string;
			large_image_url: string;
		};
	};
	trailer: {
		youtube_id: string | null;
		url: string | null;
		embed_url: string | null;
	};
	approved: boolean;
	titles: AnimeTitle[];
	title: string;
	title_english: string | null;
	title_japanese: string | null;
	title_synonyms: string[];
	type: string | null;
	source: string | null;
	episodes: number | null;
	status: string | null;
	airing: boolean;
	aired: AnimeAired;
	duration: string | null;
	rating: string | null;
	score: number | null;
	scored_by: number | null;
	rank: number | null;
	popularity: number | null;
	members: number | null;
	favorites: number | null;
	synopsis: string | null;
	background: string | null;
	season: string | null;
	year: number | null;
	broadcast: {
		day: string | null;
		time: string | null;
		timezone: string | null;
		string: string | null;
	};
	producers: AnimeStudio[];
	licensors: AnimeStudio[];
	studios: AnimeStudio[];
	genres: AnimeGenre[];
	explicit_genres: AnimeGenre[];
	themes: AnimeGenre[];
	demographics: AnimeGenre[];
}

export interface JikanResponse<T> {
	data: T;
	pagination?: {
		last_visible_page: number;
		has_next_page: boolean;
		current_page: number;
		items: {
			count: number;
			total: number;
			per_page: number;
		};
	};
}

export interface UserAnimeData {
	anime_id: number;
	status: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";
	score: number;
	progress: number;
	notes: string;
	favorite: boolean;
	start_date: string | null;
	end_date: string | null;
	image_url: string;
	title: string;
}

// Common anime genres to use for filter options
export const ANIME_GENRES: AnimeGenre[] = [
	{
		mal_id: 1,
		name: "Action",
		url: "https://myanimelist.net/anime/genre/1/Action",
		count: 0,
	},
	{
		mal_id: 2,
		name: "Adventure",
		url: "https://myanimelist.net/anime/genre/2/Adventure",
		count: 0,
	},
	{
		mal_id: 3,
		name: "Cars",
		url: "https://myanimelist.net/anime/genre/3/Cars",
		count: 0,
	},
	{
		mal_id: 4,
		name: "Comedy",
		url: "https://myanimelist.net/anime/genre/4/Comedy",
		count: 0,
	},
	{
		mal_id: 5,
		name: "Dementia",
		url: "https://myanimelist.net/anime/genre/5/Dementia",
		count: 0,
	},
	{
		mal_id: 6,
		name: "Demons",
		url: "https://myanimelist.net/anime/genre/6/Demons",
		count: 0,
	},
	{
		mal_id: 7,
		name: "Mystery",
		url: "https://myanimelist.net/anime/genre/7/Mystery",
		count: 0,
	},
	{
		mal_id: 8,
		name: "Drama",
		url: "https://myanimelist.net/anime/genre/8/Drama",
		count: 0,
	},
	{
		mal_id: 9,
		name: "Ecchi",
		url: "https://myanimelist.net/anime/genre/9/Ecchi",
		count: 0,
	},
	{
		mal_id: 10,
		name: "Fantasy",
		url: "https://myanimelist.net/anime/genre/10/Fantasy",
		count: 0,
	},
	{
		mal_id: 11,
		name: "Game",
		url: "https://myanimelist.net/anime/genre/11/Game",
		count: 0,
	},
	{
		mal_id: 12,
		name: "Hentai",
		url: "https://myanimelist.net/anime/genre/12/Hentai",
		count: 0,
	},
	{
		mal_id: 13,
		name: "Historical",
		url: "https://myanimelist.net/anime/genre/13/Historical",
		count: 0,
	},
	{
		mal_id: 14,
		name: "Horror",
		url: "https://myanimelist.net/anime/genre/14/Horror",
		count: 0,
	},
	{
		mal_id: 15,
		name: "Kids",
		url: "https://myanimelist.net/anime/genre/15/Kids",
		count: 0,
	},
	{
		mal_id: 16,
		name: "Magic",
		url: "https://myanimelist.net/anime/genre/16/Magic",
		count: 0,
	},
	{
		mal_id: 17,
		name: "Martial Arts",
		url: "https://myanimelist.net/anime/genre/17/Martial_Arts",
		count: 0,
	},
	{
		mal_id: 18,
		name: "Mecha",
		url: "https://myanimelist.net/anime/genre/18/Mecha",
		count: 0,
	},
	{
		mal_id: 19,
		name: "Music",
		url: "https://myanimelist.net/anime/genre/19/Music",
		count: 0,
	},
	{
		mal_id: 20,
		name: "Parody",
		url: "https://myanimelist.net/anime/genre/20/Parody",
		count: 0,
	},
	{
		mal_id: 21,
		name: "Samurai",
		url: "https://myanimelist.net/anime/genre/21/Samurai",
		count: 0,
	},
	{
		mal_id: 22,
		name: "Romance",
		url: "https://myanimelist.net/anime/genre/22/Romance",
		count: 0,
	},
	{
		mal_id: 23,
		name: "School",
		url: "https://myanimelist.net/anime/genre/23/School",
		count: 0,
	},
	{
		mal_id: 24,
		name: "Sci-Fi",
		url: "https://myanimelist.net/anime/genre/24/Sci-Fi",
		count: 0,
	},
	{
		mal_id: 25,
		name: "Shoujo",
		url: "https://myanimelist.net/anime/genre/25/Shoujo",
		count: 0,
	},
	{
		mal_id: 26,
		name: "Shoujo Ai",
		url: "https://myanimelist.net/anime/genre/26/Shoujo_Ai",
		count: 0,
	},
	{
		mal_id: 27,
		name: "Shounen",
		url: "https://myanimelist.net/anime/genre/27/Shounen",
		count: 0,
	},
	{
		mal_id: 28,
		name: "Shounen Ai",
		url: "https://myanimelist.net/anime/genre/28/Shounen_Ai",
		count: 0,
	},
	{
		mal_id: 29,
		name: "Space",
		url: "https://myanimelist.net/anime/genre/29/Space",
		count: 0,
	},
	{
		mal_id: 30,
		name: "Sports",
		url: "https://myanimelist.net/anime/genre/30/Sports",
		count: 0,
	},
	{
		mal_id: 31,
		name: "Super Power",
		url: "https://myanimelist.net/anime/genre/31/Super_Power",
		count: 0,
	},
	{
		mal_id: 32,
		name: "Vampire",
		url: "https://myanimelist.net/anime/genre/32/Vampire",
		count: 0,
	},
	{
		mal_id: 35,
		name: "Harem",
		url: "https://myanimelist.net/anime/genre/35/Harem",
		count: 0,
	},
	{
		mal_id: 36,
		name: "Slice of Life",
		url: "https://myanimelist.net/anime/genre/36/Slice_of_Life",
		count: 0,
	},
	{
		mal_id: 37,
		name: "Supernatural",
		url: "https://myanimelist.net/anime/genre/37/Supernatural",
		count: 0,
	},
	{
		mal_id: 38,
		name: "Military",
		url: "https://myanimelist.net/anime/genre/38/Military",
		count: 0,
	},
	{
		mal_id: 39,
		name: "Police",
		url: "https://myanimelist.net/anime/genre/39/Police",
		count: 0,
	},
	{
		mal_id: 40,
		name: "Psychological",
		url: "https://myanimelist.net/anime/genre/40/Psychological",
		count: 0,
	},
	{
		mal_id: 41,
		name: "Thriller",
		url: "https://myanimelist.net/anime/genre/41/Thriller",
		count: 0,
	},
	{
		mal_id: 42,
		name: "Seinen",
		url: "https://myanimelist.net/anime/genre/42/Seinen",
		count: 0,
	},
	{
		mal_id: 43,
		name: "Josei",
		url: "https://myanimelist.net/anime/genre/43/Josei",
		count: 0,
	},
];

// Anime type options
export const ANIME_TYPES = [
	{ value: "tv", label: "TV" },
	{ value: "movie", label: "Movie" },
	{ value: "ova", label: "OVA" },
	{ value: "special", label: "Special" },
	{ value: "ona", label: "ONA" },
	{ value: "music", label: "Music" },
];

// Anime status options
export const ANIME_STATUS = [
	{ value: "airing", label: "Currently Airing" },
	{ value: "complete", label: "Finished Airing" },
	{ value: "upcoming", label: "Not Yet Aired" },
];

// Anime rating options
export const ANIME_RATINGS = [
	{ value: "g", label: "G - All Ages" },
	{ value: "pg", label: "PG - Children" },
	{ value: "pg13", label: "PG-13 - Teens 13+" },
	{ value: "r17", label: "R - 17+" },
	{ value: "r", label: "R+ - Mild Nudity" },
	{ value: "rx", label: "Rx - Hentai" },
];

// Anime sort options
export const ANIME_SORT_OPTIONS = [
	{ value: "title", label: "Title" },
	{ value: "start_date", label: "Start Date" },
	{ value: "end_date", label: "End Date" },
	{ value: "score", label: "Score" },
	{ value: "rank", label: "Rank" },
	{ value: "popularity", label: "Popularity" },
	{ value: "members", label: "Members" },
	{ value: "favorites", label: "Favorites" },
];
