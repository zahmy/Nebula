import { Link, Route, Routes } from 'react-router';
import Objekts from './Objekts.tsx';
import ObjektsByOwner from './ObjektsByOwner';

function App() {
  return (
    <div>
      <nav>
        <Link to="/">
          <button>Objekts</button>
        </Link>
        <Link to="/by-owner">
          <button>Search by owner</button>
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Objekts />} />
        <Route path="/by-owner" element={<ObjektsByOwner />} />
      </Routes>
    </div>
  )
}

export default App;