import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Editor from './pages/Editor';
import { Toaster } from 'sonner';
import '@/App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Editor />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;