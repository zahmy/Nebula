const proxyUrl = "/query";
const proxyKey = "key";

export interface ObjektByOwner {
  season: string;
  member: string;
  class_: string;
  collections: string;
  serial: string;
  received_at: string;
  front_image: string;
}

export async function fetchObjektsByOwner(
  ownerAddress: string,
  search: boolean,
  season: string[] = [],
  class_: string[] = [],
  member: string[] = [],
  collection: string[] = []
): Promise<ObjektByOwner[]> {
  if (
    search &&
    season.length === 0 &&
    class_.length === 0 &&
    member.length === 0 &&
    collection.length === 0
  ) {
    console.log("No search filters provided, returning empty result.");
    return [];
  }
  const baseSql =
    "SELECT c.season, c.member, c.class, c.collection_no, o.serial, o.received_at, c.front_image FROM objekt o JOIN collection c ON o.collection_id = c.id WHERE c.artist = 'tripleS'";
  const params: string[] = [];
  let sql = baseSql;
  let paramIndex = 1;

  if (ownerAddress) {
    sql += " AND o.owner = $1";
    params.push(ownerAddress);
    paramIndex++;
  }

  if (season.length > 0) {
    const seasonPlaceholders = season
      .map((_, index) => `$${paramIndex + index}`)
      .join(", ");
    sql += ` AND c.season IN (${seasonPlaceholders})`;
    params.push(...season);
    paramIndex += season.length;
  }

  if (class_.length > 0) {
    const classPlaceholders = class_
      .map((_, index) => `$${paramIndex + index}`)
      .join(", ");
    sql += ` AND c.class IN (${classPlaceholders})`;
    params.push(...class_);
    paramIndex += class_.length;
  }

  if (member.length > 0) {
    const mamberPlaceholders = member
      .map((_, index) => `$${paramIndex + index}`)
      .join(", ");
    sql += ` AND c.member IN (${mamberPlaceholders})`;
    params.push(...member);
    paramIndex += member.length;
  }

  if (collection.length > 0) {
    const collectionPlaceholders = collection
      .map((_, index) => `$${paramIndex + index}`)
      .join(", ");
    sql += ` AND c.collection_no IN (${collectionPlaceholders})`;
    params.push(...collection);
    paramIndex += collection.length;
  }

  sql += " ORDER BY o.received_at DESC";
  console.log("Generated SQL:", sql, "Params:", params);

  const requestBody = {
    sql,
    method: "all",
    ...(params.length > 0 && { params }),
  };

  //console.log('送出的body:', JSON.stringify(requestBody));
  try {
    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "proxy-key": proxyKey,
      },
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();
    console.log("收到回應:", text);

    if (!response.ok) {
      throw new Error(`無法拿到資料: ${response.status} - ${text}`);
    }

    let data;
    try {
      data = JSON.parse(text) as [
        string,
        string,
        string,
        string,
        string,
        string,
        string
      ][];
    } catch (parseError) {
      console.error("Failed to parse response:", parseError, "Raw text:", text);
      throw new Error("Invalid response format");
    }
    return data.map(
      ([
        season,
        member,
        class_,
        collections,
        serial,
        received_at,
        front_image,
      ]) => ({
        season,
        member,
        class_,
        collections,
        serial,
        received_at,
        front_image,
      })
    );
  } catch (error) {
    console.error("Fetch error:", error);
    throw error instanceof Error ? error : new Error("Unknown error occurred");
  }
}

export async function fetchAllCollections(): Promise<string[]> {
  const sql =
    "SELECT DISTINCT collection_no FROM collection WHERE artist = 'tripleS' ORDER BY collection_no";
  const requestBody = {
    sql,
    method: "all",
  };

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "proxy-key": proxyKey,
    },
    body: JSON.stringify(requestBody),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`無法拿到資料: ${response.status} - ${text}`);
  }

  const data = JSON.parse(text) as [string][];
  return data.map(([collection]) => collection);
}

export async function fetchUniqueSeasons(): Promise<string[]> {
  const sql =
    "SELECT DISTINCT season FROM collection WHERE artist = 'tripleS' ORDER BY season";
  const requestBody = { sql, method: "all" };
  const response = await fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "proxy-key": proxyKey },
    body: JSON.stringify(requestBody),
  });
  const text = await response.text();
  if (!response.ok)
    throw new Error(`無法拿到資料: ${response.status} - ${text}`);
  const data = JSON.parse(text) as [string][];
  return data.map(([season]) => season);
}
