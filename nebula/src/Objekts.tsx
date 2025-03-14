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

  const handleDropdownSelect = (season: string) => {
    setSelectedSeason(season);
  };

  const showObjekts = objekts.map((obj, index) => (
    <div className="m-2 min-w-[150px] text-center" key={index}>
      <div className="mb-2">
        {obj.season} {obj.member} {obj.collection_no} {obj.class_}
      </div>
      <img src={obj.front_image} alt='front_image' className="w-full max-w-[220px] mx-auto" loading="lazy"/>
    </div>
  ));

  return (
    <div>
      <div>
      </div>
      {loadingOrError}
      <div className="dropdown dropdown-start">
        <div tabIndex={0} role="button" className="btn m-2 bg-gray-700 rounded-box outline -outline-offset-1 outline-blue-100/50">{selectedSeason || 'Season'}</div>
        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
          <li><a onClick={() => handleDropdownSelect('Atom01')}>Atom01</a></li>
          <li><a onClick={() => handleDropdownSelect('Binary01')}>Binary01</a></li>
          <li><a onClick={() => handleDropdownSelect('Cream01')}>Cream01</a></li>
          <li><a onClick={() => handleDropdownSelect('Divine01')}>Divine01</a></li>
          <li><a onClick={() => handleDropdownSelect('Ever01')}>Ever01</a></li>
        </ul>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {showObjekts}
      </div>
    </div>
  );
}

export default Objekts;