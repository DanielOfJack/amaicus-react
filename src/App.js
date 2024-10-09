import React, { useState, useEffect } from 'react';
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
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [yearRange, setYearRange] = useState([1900, 2024]);  // State for date range filter
  const [loading, setLoading] = useState(false); // Loading state for spinner
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed

  const handleSearchResults = (results) => {
    setDocuments(results);
  };

  const handleLocationFilterChange = (locations) => {
    setSelectedLocations(locations);
  };

  const handleYearRangeChange = (range) => {
    setYearRange(range);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <MainContent
          handleSearchResults={handleSearchResults}
          documents={documents}
          selectedLocations={selectedLocations}
          yearRange={yearRange}
          onLocationChange={handleLocationFilterChange}
          onYearRangeChange={handleYearRangeChange}
          loading={loading}
          setLoading={setLoading}
          hasSearched={hasSearched}
          setHasSearched={setHasSearched} // Pass this down to SearchBar
        />
      </Router>
    </ThemeProvider>
  );
}

function MainContent({ handleSearchResults, documents, selectedLocations, yearRange, onLocationChange, onYearRangeChange, loading, setLoading, hasSearched, setHasSearched }) {
  const location = useLocation();
  const [sortBy, setSortBy] = useState("Similarity Score");

  // Determine if we are on the document viewer page
  const isDocumentViewer = location.pathname.startsWith('/document/');

  // State for the typing animation
  const [animatedTitle, setAnimatedTitle] = useState('');
  const fullTitle = "What are you looking for?";

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < fullTitle.length) {
        const nextChar = fullTitle[index];
        if (nextChar === ' ') {
          // If the character is a space, append it immediately and increment index
          setAnimatedTitle(prev => prev + nextChar);
          index++; // Move to the next character
        } else {
          // Append the current character and increment index with delay
          setAnimatedTitle(prev => prev + nextChar);
          index++;
        }
      } else {
        clearInterval(intervalId); // Clear the interval once the full text is displayed
      }
    }, 50); // Typing speed (in milliseconds)

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, []); // Empty dependency array ensures this runs only once on component mount

  return (
    <div style={{ display: 'flex' }}>
      {/* Logo above the sidebar */}
      {!isDocumentViewer && (
        <div className="logo-wrapper">
          <img src={logo} alt="Logo" className="app-logo" />
        </div>
      )}
      {!isDocumentViewer && (
        <div className="sidebar-wrapper">
          <Sidebar 
            onLocationChange={onLocationChange} 
            onYearRangeChange={onYearRangeChange}
          /> 
        </div>
      )}
      <main style={{ marginLeft: isDocumentViewer ? '0' : '23rem', paddingTop: '0px', width: isDocumentViewer ? '100%' : 'calc(100vw - 23rem)' }}>
        {!isDocumentViewer && (
          <div className={`search-container ${hasSearched ? '' : 'centered'}`}>
            {!hasSearched && (
              <h1 className="amaicus-title">{animatedTitle}</h1>
            )}
            <SearchBar 
              onSearchResults={handleSearchResults} 
              setLoading={setLoading} 
              loading={loading}
              sortBy={sortBy}
              setSortBy={setSortBy}
              setHasSearched={setHasSearched} // Pass this down
            />
          </div>
        )}

        {/* Render SearchResultsContainer only after a search */}
        {hasSearched && (
          <Routes>
            <Route 
              path="/" 
              element={
                <SearchResultsContainer 
                  documents={documents} 
                  selectedLocations={selectedLocations}
                  yearRange={yearRange}
                  loading={loading}
                  sortBy={sortBy}
                />
              }
            />
            <Route path="/document/:docId" element={<DocumentViewer />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

export default App;