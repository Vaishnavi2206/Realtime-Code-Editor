import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router,Route, Routes } from 'react-router-dom';
import HomePage from './home/HomePage';
import EditorPage from './editor/EditorPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
   <>
   <div>
    <Toaster position='top-right' toastOptions={{success:{theme:{primary:'#4aed88'}}}}></Toaster>
   </div>
   <Router>
    <Routes>
      <Route path='/' element={<HomePage/>}></Route>
      <Route path='/editor/:roomId' element={<EditorPage/>}></Route>
    </Routes>
   </Router>
   </>
  );
}

export default App;
