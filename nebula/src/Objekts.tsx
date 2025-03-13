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
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  useEffect(() => {
    fetchObjekts(selectedSeason || undefined)
      .then((data) => {
        setObjekts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedSeason]);

  const loadingOrError = loading ? 'Loading...' : error ? `Error: ${error}` : '';

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(e.target.value);
  };

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
      <select value={selectedSeason} onChange={handleSeasonChange}>
        <option value="">Season</option>
        <option value="Atom01">A</option>
        <option value="Binary01">B</option>
        <option value="Cream01">C</option>
        <option value="Divine01">D</option>
        <option value="Ever01">E</option>
      </select>
      <ul>
        {showObjekts}
      </ul>
    </div>
  );
}

export default Objekts;