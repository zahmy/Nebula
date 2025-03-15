import { useState, useEffect } from 'react';
import ShowObjekts from './ShowObjekts';
import { fetchObjekts, Objekt } from './api_objekts';

function Objekts() {
  const [objekts, setObjekts] = useState<Objekt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [columns, setColumns] = useState(getColumns());

  //不同視窗寬度對應的Objekts顯示行數
  function getColumns() {
    if (window.innerWidth >= 1024) return 5; 
    if (window.innerWidth >= 768) return 3;  
    if (window.innerWidth >= 640) return 2;  
    return 1;                                
  }

  //隨著視窗寬度動態調整Objekts顯示行數
  useEffect(() => {
    const handleResize = () => {
      const newColumns = getColumns();
      setColumns(newColumns);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  //全部Objekts所佔列數
  const rows = Math.ceil(objekts.length / columns);

  //一個二維陣列，將Objekts以列為單位存放（因為渲染是一列一列的）
  const rowItems = Array.from({ length: rows }, (_, rowIndex) =>
    objekts.slice(rowIndex * columns, (rowIndex + 1) * columns)
  );
  
  //透過API取得Objekts
  useEffect(() => {
    fetchObjekts(selectedSeason)
    .then((data) => {
      setObjekts(data);
      setLoading(false);
    })
    .catch((err) => {
      setError(err.message);
      setLoading(false);
    });  
  }, [selectedSeason]);

  //處理Season篩選條件選單
  const handleDropdownSelect = (season: string) => {
    setSelectedSeason(season);
  };

  const SEASONS = ['Atom01', 'Binary01', 'Cream01', 'Divine01', 'Ever01'];

  return (
    <div className="min-h-screen">
      <div className="dropdown dropdown-start">
        <div tabIndex={0} role="button" className="btn m-2 bg-gray-700 rounded-box outline -outline-offset-1 outline-blue-100/50">
          {selectedSeason || 'Season'}
        </div>
        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm">
        {SEASONS.map((season) => (
          <li key={season}>
            <a onClick={() => handleDropdownSelect(season)}>{season}</a>
          </li>
        ))}
        </ul>
      </div>
      <ShowObjekts loading={loading} error={error} rowItems={rowItems}/>
    </div>
  );
}

export default Objekts;