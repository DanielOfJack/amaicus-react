import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import SearchResultsContainer from './components/SearchResultsContainer';
import DocumentViewer from './components/DocumentViewer';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import logo from './assets/logo.png'; // Import the logo
import './App.css'; // Import the new CSS

const theme = createTheme({
  palette: {
    primary: { main: '#000000' }, // Black
    secondary: { main: '#ffffff' }, // White
    text: { primary: '#000000', secondary: '#ffffff' }, // Black and white text
    background: { default: '#ffffff' }, // White background
    action: { active: '#000000' }, // Black active color
  },
});

function App() {
  const [documents, setDocuments] = useState([]);  // State to hold the documents
  const [selectedLocations, setSelectedLocations] = useState([]);  // State to hold selected locations
  const [yearRange, setYearRange] = useState([1900, 2024]);  // State for date range filter
  const [loading, setLoading] = useState(false); // Loading state for spinner

  const handleSearchResults = (results) => {
    console.log("Search results received from server:", results); // Debugging output
    setDocuments(results);
  };

  const handleLocationFilterChange = (locations) => {
    console.log("Selected locations:", locations); // Debugging output
    setSelectedLocations(locations); // Update selected locations
  };

  const handleYearRangeChange = (range) => {
    console.log("Year range selected:", range); // Debugging output
    setYearRange(range); // Update year range
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <MainContent 
          handleSearchResults={handleSearchResults} 
          documents={documents} 
          selectedLocations={selectedLocations} 
          yearRange={yearRange} // Pass the year range
          onLocationChange={handleLocationFilterChange} 
          onYearRangeChange={handleYearRangeChange} // Pass the year range change handler
          loading={loading} 
          setLoading={setLoading} 
        />
      </Router>
    </ThemeProvider>
  );
}

function MainContent({ handleSearchResults, documents, selectedLocations, yearRange, onLocationChange, onYearRangeChange, loading, setLoading }) {
  const location = useLocation();
  const [sortBy, setSortBy] = useState("Similarity Score");  // Add sortBy state here

  // Determine if we are on the document viewer page
  const isDocumentViewer = location.pathname.startsWith('/document/');

  return (
    <div style={{ display: 'flex' }}>
      {!isDocumentViewer && (
        <div className="sidebar-wrapper">
          <img src={logo} alt="Logo" className="sidebar-logo" /> 
          <Sidebar 
            onLocationChange={onLocationChange} 
            onYearRangeChange={onYearRangeChange}
          /> 
        </div>
      )}
      <main style={{ marginLeft: isDocumentViewer ? '0' : '20vw', paddingTop: '0px', width: '100%' }}>
        {!isDocumentViewer && (
          <SearchBar 
            onSearchResults={handleSearchResults} 
            setLoading={setLoading} 
            loading={loading}
            sortBy={sortBy}  // Pass the current sortBy value to the SearchBar
            setSortBy={setSortBy}  // Pass the setSortBy function to update the sort value
          />
        )}
        <Routes>
          <Route 
            path="/" 
            element={
              <SearchResultsContainer 
                documents={documents} 
                selectedLocations={selectedLocations}
                yearRange={yearRange}
                loading={loading}
                sortBy={sortBy}  // Pass sortBy to SearchResultsContainer for sorting
              />
            } 
          />
          <Route path="/document/:docId" element={<DocumentViewer />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;