import { useState, useEffect } from 'react';
import ShowObjekts from './ShowObjekts';
import { fetchAllCollections, fetchObjekts, fetchUniqueClasses, fetchUniqueMembers, fetchUniqueSeasons, Objekt } from './api_objekts';
import FilterDropdown from './DropdownFilter';

function Objekts() {
  const [objekts, setObjekts] = useState<Objekt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string[]>([]);
  const [columns, setColumns] = useState(getColumns());
  const [collections, setCollections] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [members, setMembers] = useState<string[]>([]);

  // 不同視窗寬度對應的Objekts顯示行數
  function getColumns() {
    if (window.innerWidth >= 1024) return 5; 
    if (window.innerWidth >= 768) return 3;  
    if (window.innerWidth >= 640) return 2;  
    return 1;                                
  }

  // 隨著視窗寬度動態調整Objekts顯示行數
  useEffect(() => {
    const handleResize = () => {
      const newColumns = getColumns();
      setColumns(newColumns);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 全部Objekts所佔列數
  const rows = Math.ceil(objekts.length / columns);

  // 一個二維陣列，將Objekts以列為單位存放（因為渲染是一列一列的）
  const rowItems = Array.from({ length: rows }, (_, rowIndex) =>
    objekts.slice(rowIndex * columns, (rowIndex + 1) * columns)
  );
  
// 透過API取得Objekts
useEffect(() => {
  setLoading(true);
  fetchObjekts(selectedSeason, selectedClass, selectedMember, selectedCollection)
    .then((data) => {
      setObjekts(data);
      setLoading(false);
    })
    .catch((err) => {
      setError(err.message);
      setLoading(false);
    });
}, [selectedSeason, selectedClass, selectedMember, selectedCollection]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAllCollections(),
      fetchUniqueSeasons(),
      fetchUniqueClasses(),
      fetchUniqueMembers(),
    ])
      .then(([collectionNosData, seasonsData, classesData, membersData]) => {
        setCollections(collectionNosData);
        setSeasons(seasonsData);
        setClasses(classesData);
        setMembers(membersData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  const toggleSelection = <T extends string>(prev: T[], value: T): T[] =>
    value
      ? prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
      : [];

  const handleSeasonChange = (season: string) => {
    setSelectedSeason((prevSelectedSeasons) => toggleSelection(prevSelectedSeasons, season));
  };

  const handleClassChange = (class_: string) => {
    setSelectedClass((prevSelectedClasses) => toggleSelection(prevSelectedClasses, class_));
  };

  const handleMemberChange = (member: string) => {
    setSelectedMember((prevSelectedMembers) => toggleSelection(prevSelectedMembers, member));
  };

  return (
    <div className="min-h-screen">
      <div className='flex items-center ml-5 mt-2'>

        {/* Season選單 */}  
        <FilterDropdown
          label="Season"
          items={seasons}
          selectedItems={selectedSeason}
          onSelectionChange={handleSeasonChange}
        />

        {/* Class選單 */}
        <FilterDropdown
          label="Class"
          items={classes}
          selectedItems={selectedClass}
          onSelectionChange={handleClassChange}
        />

        {/* Member選單 */}
        <FilterDropdown
          label="Memeber"
          items={members}
          selectedItems={selectedMember}
          onSelectionChange={handleMemberChange}
        />

      </div>

      <ShowObjekts loading={loading} error={error} rowItems={rowItems}/>

    </div>
  );
}

export default Objekts;