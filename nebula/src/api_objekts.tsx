const proxyUrl = '/query';
const proxyKey = 'key';

export interface Objekt {
  season: string;
  member: string;
  collection_no: string;
  class_: string;
  front_image: string;
}

export async function fetchObjekts(season?: string): Promise<Objekt[]> {
  const baseSql = "SELECT c.season, c.member, c.class, c.collection_no, c.front_image FROM collection c WHERE c.artist = 'tripleS'";
  const params: string[] = [];
  let sql = baseSql;
  let paramIndex = 1;
  if (season) {
    sql += ` AND c.season = $${paramIndex}`;
    params.push(season);
    paramIndex++;
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