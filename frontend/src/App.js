import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EditorNew from './pages/EditorNew';
import { Toaster } from 'sonner';
import '@/App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EditorNew />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;