import { useState } from 'react';
import { fetchObjekts } from './api';

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
    <li key={index}>
      {obj.season} {obj.member} {obj.class_} {obj.collection_no} {obj.serial} {obj.received_at} 
      <br />
      <img src={obj.front_image} alt="front_image" width="100" />
    </li>
  ))

  const loadingOrError = loading ? 'Loading...' : error ? `Error: ${error}` : '';
  const remind = !loading && !error && objekts.length === 0 ? 'Please enter an address to search' : '';

  return (
    <div>
      <div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value.toLowerCase())}
          placeholder="Enter an address"
        />
        <button
          onClick={handleFetchObjekts}
          disabled={loading}
        >{loading ? 'Loading...' : 'Search'}</button>
      </div>  

      {loadingOrError}
      {remind}

      <ul>
        {showObjektsByOwner}
      </ul>
    </div>
  );
}

export default ObjektsByOwner;