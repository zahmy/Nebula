import { useState, useEffect } from 'react';
import { fetchObjekts } from './api_objekts';

interface Objekt {
    season: string;
    member: string;
    collection_no: string;
    class_: string; //直接寫class會跟關鍵字重疊出錯
    front_image: string;
}

function Objekts() {
  const [objekts, setObjekts] = useState<Objekt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchObjekts()
      .then((data) => {
        setObjekts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const loadingOrError = loading ? 'Loading...' : error ? `Error: ${error}` : '';

  const showObjekts = objekts.map((obj, index) => (
    <li key={index}>
      {obj.season} {obj.member} {obj.collection_no} {obj.class_}
      <br />
      <img src={obj.front_image} alt='front_image' width="100" />
    </li>
  ));

  return (
    <div>
      {loadingOrError}
      <ul>
        {showObjekts}
      </ul>
    </div>
  );
}

export default Objekts;