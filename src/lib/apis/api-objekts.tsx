const proxyUrl = "/api/query";

export interface Objekts_ {
	created_at: string;
	season: string;
	member: string;
	artist: string;
	collection_no: string;
	class: string;
	thumbnail_image: string;
	front_image: string;
	back_image: string;
	background_color: string;
	text_color: string;
	accent_color: string;
}

export interface Objekts_Owner extends Objekts_ {
	owner?: string;
	minted_at: string;
	received_at: string;
	serial: string;
	transferable: boolean;
}

async function sendQuery(sql: string, params: string[]) {
	const requestBody = {
		sql,
		method: "all",
		...(params.length > 0 && { params }),
	};

	// console.log('送出的body:', JSON.stringify(requestBody));

	const response = await fetch(proxyUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(requestBody),
	});
	const text = await response.text();

	// console.log('收到回應:', text);

	if (!response.ok) {
		throw new Error(`無法拿到資料: ${response.status} - ${text}`);
	}
	return JSON.parse(text);
}

// 根據filters從資料庫取得資料
export async function fetchObjekts<T extends Objekts_ | Objekts_Owner>(
	search: boolean = false,
	artist: string[] = [],
	member: string[] = [],
	season: string[] = [],
	collection: string[] = [],
	class_: string[] = [],
	owner?: string
): Promise<T[]> {
	if (
		search &&
		season.length === 0 &&
		class_.length === 0 &&
		member.length === 0 &&
		collection.length === 0 &&
		artist.length === 0
	) {
		console.log("No search filters provided, returning empty result.");
		return [];
	}

	const baseSql = owner
		? "SELECT o.owner, o.minted_at, o.received_at, o.serial, o.transferable, " +
		  "c.season, c.member, c.artist, c.collection_no, c.class, c.thumbnail_image, " +
		  "c.front_image, c.back_image, c.background_color, c.text_color, c.accent_color " +
		  "FROM objekt o JOIN collection c ON o.collection_id = c.id WHERE c.artist IN ('tripleS', 'artms')"
		: "SELECT c.created_at, c.season, c.member, c.artist, c.collection_no, c.class, " +
		  "c.thumbnail_image, c.front_image, c.back_image, c.background_color, c.text_color, c.accent_color " +
		  "FROM collection c WHERE c.artist IN ('tripleS', 'artms')";

	const params: string[] = [];
	let sql = baseSql;
	let paramIndex = 1;

	// 處理season過濾條件
	if (season.length > 0) {
		const seasonPlaceholders = season
			.map((_, index) => `$${paramIndex + index}`)
			.join(", ");
		sql += ` AND c.season IN (${seasonPlaceholders})`;
		params.push(...season);
		paramIndex += season.length;
	}

	// 處理class過濾條件
	if (class_.length > 0) {
		const classPlaceholders = class_
			.map((_, index) => `$${paramIndex + index}`)
			.join(", ");
		sql += ` AND c.class IN (${classPlaceholders})`;
		params.push(...class_);
		paramIndex += class_.length;
	}

	// 處理member過濾條件
	if (member.length > 0) {
		const memberPlaceholders = member
			.map((_, index) => `$${paramIndex + index}`)
			.join(", ");
		sql += ` AND c.member IN (${memberPlaceholders})`;
		params.push(...member);
		paramIndex += member.length;
	}

	// 處理collection過濾條件
	if (collection.length > 0) {
		const collectionPlaceholders = collection
			.map((_, index) => `$${paramIndex + index}`)
			.join(", ");
		sql += ` AND c.collection_no IN (${collectionPlaceholders})`;
		params.push(...collection);
		paramIndex += collection.length;
	}

	// 處理artist過濾條件
	if (artist.length > 0) {
		const artistPlaceholders = artist
			.map((_, index) => `$${paramIndex + index}`)
			.join(", ");
		sql += ` AND c.artist IN (${artistPlaceholders})`;
		params.push(...artist);
		paramIndex += artist.length;
	}

	// 處理owner過濾條件
	if (owner) {
		sql += ` AND o.owner = $${paramIndex}`;
		params.push(owner);
		paramIndex++;
	}

	sql += owner ? " ORDER BY o.received_at DESC" : " ORDER BY c.created_at DESC";

	// 送出sql query到資料庫取得資料
	const data = await sendQuery(sql, params);

	console.log("生成的SQL:", sql);
	console.log("SQL參數:", params);

	return data.map((row: (string | boolean)[]) =>
		owner
			? ({
					owner: row[0],
					minted_at: row[1],
					received_at: row[2],
					serial: row[3],
					transferable: row[4],
					season: row[5],
					member: row[6],
					artist: row[7],
					collection_no: row[8],
					class: row[9],
					thumbnail_image: row[10],
					front_image: row[11],
					back_image: row[12],
					background_color: row[13],
					text_color: row[14],
					accent_color: row[15],
			  } as Objekts_Owner)
			: ({
					created_at: row[0],
					season: row[1],
					member: row[2],
					artist: row[3],
					collection_no: row[4],
					class: row[5],
					thumbnail_image: row[6],
					front_image: row[7],
					back_image: row[8],
					background_color: row[9],
					text_color: row[10],
					accent_color: row[11],
			  } as Objekts_)
	) as T[];
}

/* 用來取得該artist的所有member，暫時沒用到
export async function fetchUniqueMembers(artists: string[]): Promise<string[]> {
  const artistPlaceholders = artists.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `SELECT DISTINCT member FROM collection WHERE artist IN (${artistPlaceholders}) ORDER BY member`;
  const data = await sendQuery(sql, artists);
  return data.map(([member]: [string]) => member);
}
*/

//用來取得該artist的所有season
export async function fetchUniqueSeasons(artists: string[]): Promise<string[]> {
	const artistPlaceholders = artists.map((_, i) => `$${i + 1}`).join(", ");
	const sql = `SELECT DISTINCT season FROM collection WHERE artist IN (${artistPlaceholders}) ORDER BY season`;
	const data = await sendQuery(sql, artists);
	return data.map(([season]: [string]) => season);
}

//用來取得該artist的所有collection_no
export async function fetchUniqueCollections(
	artists: string[]
): Promise<string[]> {
	const artistPlaceholders = artists.map((_, i) => `$${i + 1}`).join(", ");
	const sql = `SELECT DISTINCT collection_no FROM collection WHERE artist IN (${artistPlaceholders}) ORDER BY collection_no`;
	const data = await sendQuery(sql, artists);
	return data.map(([collection]: [string]) => collection);
}
