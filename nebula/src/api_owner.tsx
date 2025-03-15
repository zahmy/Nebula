const proxyUrl = '/query';
const proxyKey = 'key';

export interface ObjektByOwner {
  season: string;
  member: string;
  class_: string;
  collection_no: string;
  serial: string;
  received_at: string;
  front_image: string;
}

export async function fetchObjekts(ownerAddress: string, season: string): Promise<ObjektByOwner[]> {
  const baseSql = "SELECT c.season, c.member, c.class, c.collection_no, o.serial, o.received_at, c.front_image FROM objekt o JOIN collection c ON o.collection_id = c.id WHERE c.artist = 'tripleS'";
  const params: string[] = [];
  let sql = baseSql;
  let paramIndex = 1;

  if (ownerAddress) {
    sql += ` AND o.owner = $${paramIndex}`;
    params.push(ownerAddress);
    paramIndex++;
  }
  if (season) {
    sql += ` AND c.season = $${paramIndex}`;
    params.push(season);
    paramIndex++;
  }

  sql += " ORDER BY o.received_at DESC";

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

  const data = JSON.parse(text) as [string, string, string, string, string, string, string][];
  return data.map(([season, member, class_, collection_no, serial, received_at, front_image]) => ({season, member, class_, collection_no, serial, received_at, front_image}));
}