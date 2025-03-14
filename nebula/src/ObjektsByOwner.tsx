import { useState } from 'react';
import { fetchObjekts } from './api_owner';

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

  const handleFetchObjekts = () => {
    if (!address) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError(null);
    fetchObjekts(address)
      .then((data) => {
        setObjekts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const showObjektsByOwner = objekts.map((obj, index) => (
    <div className="m-2 min-w-[150px] text-center" key={index}>
      <div className="mb-2">
        {obj.season} {obj.member} {obj.class_} {obj.collection_no} {obj.serial} {obj.received_at} 
      </div>
      <img src={obj.front_image} alt="front_image" className="w-full max-w-[220px] mx-auto" loading="lazy"/>
    </div>
  ))

  const loadingOrError = loading ? 'Loading...' : error ? `Error: ${error}` : '';
  const remind = !loading && !error && objekts.length === 0 ? 'Please enter an address to search' : '';

  return (
    <div>
      <div>
        <input
          type="text"
          value={address}
          className="input w-50 mr-2 mt-5"
          onChange={(e) => setAddress(e.target.value.toLowerCase())}
          placeholder="Enter an address"
        />
        <button
          onClick={handleFetchObjekts}
          disabled={loading}
          className="btn btn-accent btn-sm mr-5 mt-5"
        >{loading ? 'Loading...' : 'Search'}</button>
      </div>  

      {loadingOrError}
      {remind}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {showObjektsByOwner}
      </div>
    </div>
  );
}

export default ObjektsByOwner;