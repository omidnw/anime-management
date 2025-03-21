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
	type: string;
	name: string;
	url: string;
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
