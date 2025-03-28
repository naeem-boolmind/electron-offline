import 'antd/dist/reset.css';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import RequestList from '../components/Requests';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RequestList />} />
      </Routes>
    </Router>
  );
}
