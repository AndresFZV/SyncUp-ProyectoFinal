import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../../../components/user/Navbar';
import Sidebar from '../../../components/user/Sidebar';
import Home from '../Home/Home'; // ← IMPORTAR
import LikedSongs from '../LikedSongs/LikedSongs';
import MusicPlayer from '../../../components/user/MusicPlayer';
import AlbumView from '../AlbumView/AlbumView';
import ArtistView from '../ArtistView/ArtistView';
import Profile from '../Profile';
import Recommendations from '../Recommendations/Recommendations';
import Suggestions from '../Suggestions/Suggestions';
import QueueSidebar from '../../../components/user/QueueSidebar/QueueSidebar';
import { MusicPlayerProvider } from '../../../contexts/MusicPlayerContext';
import { SidebarProvider, useSidebar } from '../../../contexts/SidebarContext';

import styles from './UserDashboard.module.css';

const UserDashboard = () => {
  const [userName] = useState(localStorage.getItem('userName') || 'Usuario');

  const handleSearch = (query) => {
    console.log('Buscando:', query);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <MusicPlayerProvider>
      <SidebarProvider>
        <DashboardContent 
          userName={userName}
          onSearch={handleSearch}
          onLogout={handleLogout}
        />
      </SidebarProvider>
    </MusicPlayerProvider>
  );
};

const DashboardContent = ({ userName, onSearch, onLogout }) => {
  const { expanded } = useSidebar();

  return (
    <div className={styles.userDashboard}>
      <Sidebar />
      
      <div className={`${styles.mainContainer} ${!expanded ? styles.sidebarCollapsed : ''}`}>
        <Navbar 
          userName={userName}
          onSearch={onSearch}
          onLogout={onLogout}
        />
        
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Navigate to="/user/home" replace />} />
            <Route path="/home" element={<Home />} /> {/* ← USAR COMPONENTE REAL */}
            <Route path="/search" element={<SearchPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/liked-songs" element={<LikedSongs />} />
            <Route path="/album/:albumId" element={<AlbumView />} />
            <Route path="/artist/:artistId" element={<ArtistView />} />
            <Route path="/recommendations" element={<Recommendations />} />
          </Routes>
        </main>
      </div>

      <MusicPlayer />
      <QueueSidebar />
    </div>
  );
};

// Componentes temporales
const SearchPage = () => (
  <div style={{ padding: '20px', color: 'white' }}>
    <h1>Buscar</h1>
    <p>Encuentra tu música favorita</p>
  </div>
);

const LibraryPage = () => (
  <div style={{ padding: '20px', color: 'white' }}>
    <h1>Tu Biblioteca</h1>
    <p>Tus canciones favoritas</p>
  </div>
);

export default UserDashboard;