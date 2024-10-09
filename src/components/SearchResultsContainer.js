import React from 'react';
import SearchResultCard from './SearchResultCard';
import './SearchResultsContainer.css';

// Skeleton Loader for Search Results
const SkeletonSearchResultCard = () => {
  return (
    <div className="search-result-card skeleton">
      <div className="skeleton-loader" style={{ height: '2rem', marginBottom: '1rem' }}></div> {/* Title */}
      <div className="skeleton-loader" style={{ width: '80%', height: '1rem', marginBottom: '0.5rem' }}></div> {/* Subtitle */}
      <div className="skeleton-loader" style={{ width: '60%', height: '1rem', marginBottom: '0.5rem' }}></div> {/* Date */}
      <div className="skeleton-loader" style={{ width: '50%', height: '1rem' }}></div> {/* Document Type */}
      <div className="skeleton-loader" style={{ height: '2rem', marginBottom: '1rem' }}></div> {/* Title */}
      <div className="skeleton-loader" style={{ width: '80%', height: '1rem', marginBottom: '0.5rem' }}></div> {/* Subtitle */}
      <div className="skeleton-loader" style={{ width: '60%', height: '1rem', marginBottom: '0.5rem' }}></div> {/* Date */}
      <div className="skeleton-loader" style={{ width: '50%', height: '1rem' }}></div> {/* Document Type */}
      <div className="skeleton-loader" style={{ height: '2rem', marginBottom: '1rem' }}></div> {/* Title */}
      <div className="skeleton-loader" style={{ width: '80%', height: '1rem', marginBottom: '0.5rem' }}></div> {/* Subtitle */}
      <div className="skeleton-loader" style={{ width: '60%', height: '1rem', marginBottom: '0.5rem' }}></div> {/* Date */}
      <div className="skeleton-loader" style={{ width: '50%', height: '1rem' }}></div> {/* Document Type */}
      <div className="skeleton-loader" style={{ height: '2rem', marginBottom: '1rem' }}></div> {/* Title */}
      <div className="skeleton-loader" style={{ width: '80%', height: '1rem', marginBottom: '0.5rem' }}></div> {/* Subtitle */}
      <div className="skeleton-loader" style={{ width: '60%', height: '1rem', marginBottom: '0.5rem' }}></div> {/* Date */}
      <div className="skeleton-loader" style={{ width: '50%', height: '1rem' }}></div> {/* Document Type */}
      <div className="skeleton-loader" style={{ height: '2rem', marginBottom: '1rem' }}></div> {/* Title */}
      <div className="skeleton-loader" style={{ width: '80%', height: '1rem', marginBottom: '0.5rem' }}></div> {/* Subtitle */}
      <div className="skeleton-loader" style={{ width: '60%', height: '1rem', marginBottom: '0.5rem' }}></div> {/* Date */}
      <div className="skeleton-loader" style={{ width: '50%', height: '1rem' }}></div> {/* Document Type */}
    </div>
  );
};

const getLocationName = (locationCode) => {
  const locationMap = {
    wc011: 'Matzikama',
    wc033: 'Cape Agulhas',
    cpt: 'Cape Town',
    jhb: 'Johannesburg',
    eth: 'eThekwini',
    ec443: 'Mbizana',
    // Add more mappings as necessary
  };
  return locationMap[locationCode?.toLowerCase()] || locationCode || '';
};

const SearchResultsContainer = ({ documents, selectedLocations, yearRange, loading, sortBy }) => {
  console.log("Received documents:", documents); // Debugging output
  console.log("Selected locations for filtering:", selectedLocations); // Debugging output
  console.log("Year range for filtering:", yearRange); // Debugging output
  console.log("Sort By:", sortBy); // Debugging output

  // Filter the documents based on the selected locations and year range
  const filteredDocuments = documents.filter((doc) => {
    const locationCode = doc.country.split('-')[1]; // Extract the location code from 'za-wc011'
    const locationName = getLocationName(locationCode); // Map the location code to the human-readable name
    console.log(`Document country code: ${doc.country}, mapped location: ${locationName}`); // Debugging output

    const docYear = parseInt(doc.date || doc.expression_date); // Parse document year from date
    const isWithinYearRange = docYear >= yearRange[0] && docYear <= yearRange[1]; // Check if within the selected year range

    return (
      (selectedLocations.length === 0 || selectedLocations.includes(locationName)) &&
      isWithinYearRange // Filter by location and year range
    );
  });

  // Sort the filtered documents based on the "Sort By" option
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === "Similarity Score") {
      return (b.similarityScore || 0) - (a.similarityScore || 0); // Sort by similarity score in descending order
    } else if (sortBy === "Date (oldest first)") {
      return new Date(a.date || a.expression_date) - new Date(b.date || b.expression_date); // Sort by date ascending
    } else if (sortBy === "Date (newest first)") {
      return new Date(b.date || b.expression_date) - new Date(a.date || a.expression_date); // Sort by date descending
    }
    return 0; // Default no sorting
  });

  console.log("Sorted documents:", sortedDocuments); // Debugging output

  // Render skeleton cards if loading
  if (loading) {
    return (
      <div className="search-results-container">
        {[...Array(5)].map((_, index) => (
          <SkeletonSearchResultCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="search-results-container">
      {sortedDocuments.map((doc, index) => (
        <SearchResultCard
          key={index}
          documentTitle={doc.alias}
          countryName={doc.country}  // Pass country code (like 'za-wc011')
          flagUrl={`https://flagcdn.com/w320/${doc.country.split('-')[0]}.png`}
          documentType={doc.subtype}
          date={doc.date}
          expression_date={doc.expression_date}
          searchResults={doc.search_hits}
          docId={doc.doc_id} // Pass docId to SearchResultCard
        />
      ))}
    </div>
  );
};

export default SearchResultsContainer;