import { useEffect, useRef, useState } from 'react';
import { fetchObjekts } from './api_owner';
import ShowObjekts from './ShowObjekts';
import FilterDropdown from './DropdownFilter';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { fetchAllCollections, fetchUniqueSeasons, fetchUniqueClasses, fetchUniqueMembers } from './api_objekts';

interface ObjektByOwner {
  season: string;
  member: string;
  class_: string;
  collection_no: string;
  serial: string;
  received_at: string;
  front_image: string;
}

function ObjektsByOwner() {
  const [objekts, setObjekts] = useState<ObjektByOwner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<string[]>([]);  
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
  
  // 處理season篩選條件，只監聽season不監聽address，不然還沒按search結果就出來了 
  const addressRef=useRef(address);

  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  // 透過API取得Objekts
  useEffect(() => {
    const currentAddress = addressRef.current;
    if (!currentAddress) {
      return;
    }
    setLoading(true);
    setError(null);
    fetchObjekts(currentAddress, selectedSeason, selectedClass, selectedMember)
      .then((data) => {
        setObjekts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  },[selectedSeason, selectedClass, selectedMember]);

  // 另外處理搜尋按鈕
  const handleFetchObjekts = () => {
    if (!address) {
      return;
    }
    setLoading(true);
    setError(null);
    fetchObjekts(address, [])
      .then((data) => {
        setObjekts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setObjekts([]);
      });
  };

  const remind = !address.length ? 'Please enter an address to search' : '';

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

  return (
    <div>
      <div className="flex items-center mt-5">
        <Input
          type="text"
          value={address}
          className="w-50 mr-2"
          onChange={(e) => setAddress(e.target.value.toLowerCase())}
          placeholder="Enter an address"
        />
        <Button
          onClick={handleFetchObjekts}
          disabled={loading}
          className="bg-accent text-white hover:bg-accent/90 mr-5"
        >
          {loading ? 'Loading...' : 'Search'}
        </Button>
      </div>  

      {remind}

      <div className="min-h-screen">
        <div className='flex'>
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
    </div>
  );
}

export default ObjektsByOwner;