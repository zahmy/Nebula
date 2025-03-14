import { Link, Route, Routes } from 'react-router';
import Objekts from './Objekts.tsx';
import ObjektsByOwner from './ObjektsByOwner';

function App() {
  return (
    <div>
      <nav className='flex justify-between items-center bg-blue-950 p-5'>
        <h1 className="text-4xl font-bold">Nebula</h1>
        <div className="flex space-x-10">
          <Link to="/">
            <button className="btn btn-primary">Objekts</button>
          </Link>
          <Link to="/by-owner">
            <button className="btn btn-primary">Onwer</button>
          </Link>
        </div>
        <div className="w-32" />
      </nav>

      <Routes>
        <Route path="/" element={<Objekts />} />
        <Route path="/by-owner" element={<ObjektsByOwner />} />
      </Routes>
    </div>
  )
}

export default App;