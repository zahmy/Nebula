const proxyUrl = '/query';
const proxyKey = 'key';

export interface Objekt {
  season: string;
  member: string;
  collection_no: string;
  class_: string;
  front_image: string;
}

export async function fetchObjekts(season: string[] = [], class_: string[] = [], member: string[] = [], collection: string[] = []): Promise<Objekt[]> {
  const baseSql = "SELECT c.season, c.member, c.class, c.collection_no, c.front_image FROM collection c WHERE c.artist = 'tripleS'";
  const params: string[] = [];
  let sql = baseSql;
  let paramIndex = 1;

  // 處理season過濾條件
  if (season.length > 0) {
    const seasonPlaceholders = season.map((_, index) => `$${paramIndex + index}`).join(', ');
    sql += ` AND c.season IN (${seasonPlaceholders})`;
    params.push(...season);
    paramIndex += season.length;
  }

  // 處理class過濾條件
  if (class_.length > 0) {
    const classPlaceholders = class_.map((_, index) => `$${paramIndex + index}`).join(', ');
    sql += ` AND c.class IN (${classPlaceholders})`;
    params.push(...class_);
    paramIndex += class_.length;
  }

  // 處理member過濾條件
  if (member.length > 0) {
    const mamberPlaceholders = member.map((_, index) => `$${paramIndex + index}`).join(', ');
    sql += ` AND c.member IN (${mamberPlaceholders})`;
    params.push(...member);
    paramIndex += member.length;
  }

  // 處理collection過濾條件
  if (collection.length > 0) {
    const collectionPlaceholders = collection.map((_, index) => `$${paramIndex + index}`).join(', ');
    sql += ` AND c.collection_no IN (${collectionPlaceholders})`;
    params.push(...collection);
    paramIndex += collection.length;
  }

  sql += " ORDER BY created_at DESC";

  const requestBody = {
    sql,
    method: 'all',
    ...(params.length > 0 && { params }), 
  };

  //console.log('送出的body:', JSON.stringify(requestBody));

  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'proxy-key': proxyKey,
    },
    body: JSON.stringify(requestBody),
  });

  const text = await response.text();
  //console.log('收到回應:', text);

  if (!response.ok) {
    throw new Error(`無法拿到資料: ${response.status} - ${text}`);
  }

  const data = JSON.parse(text) as [string, string, string, string, string][];
  return data.map(([season, member, collection_no, class_, front_image]) => ({season, member, collection_no, class_, front_image}));
}

export async function fetchAllCollections(): Promise<string[]> {
  const sql = "SELECT DISTINCT collection_no FROM collection WHERE artist = 'tripleS' ORDER BY collection_no";
  const requestBody = {
    sql,
    method: 'all',
  };

  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'proxy-key': proxyKey,
    },
    body: JSON.stringify(requestBody),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`無法拿到資料: ${response.status} - ${text}`);
  }

  const data = JSON.parse(text) as [string][];
  return data.map(([collection]) => collection); // 返回去重複的 collection_no 陣列
}

// api_objekts.ts
export async function fetchUniqueSeasons(): Promise<string[]> {
  const sql = "SELECT DISTINCT season FROM collection WHERE artist = 'tripleS' ORDER BY season";
  const requestBody = { sql, method: 'all' };
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'proxy-key': proxyKey },
    body: JSON.stringify(requestBody),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`無法拿到資料: ${response.status} - ${text}`);
  const data = JSON.parse(text) as [string][];
  return data.map(([season]) => season);
}

export async function fetchUniqueClasses(): Promise<string[]> {
  const sql = "SELECT DISTINCT class FROM collection WHERE artist = 'tripleS' ORDER BY class";
  const requestBody = { sql, method: 'all' };
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'proxy-key': proxyKey },
    body: JSON.stringify(requestBody),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`無法拿到資料: ${response.status} - ${text}`);
  const data = JSON.parse(text) as [string][];
  return data.map(([class_]) => class_);
}

export async function fetchUniqueMembers(): Promise<string[]> {
  const sql = "SELECT DISTINCT member FROM collection WHERE artist = 'tripleS' ORDER BY member";
  const requestBody = { sql, method: 'all' };
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'proxy-key': proxyKey },
    body: JSON.stringify(requestBody),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`無法拿到資料: ${response.status} - ${text}`);
  const data = JSON.parse(text) as [string][];
  return data.map(([member]) => member);
}