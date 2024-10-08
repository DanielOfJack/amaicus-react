import React, { useState } from 'react';
import { Box, Typography, Divider, Link, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './SearchResultCard.css';
import Tooltip from '@mui/material/Tooltip';

const getCountryName = (countryCode) => {
  const countryMap = {
    za: 'South Africa',
    zw: 'Zimbabwe',
    ng: 'Nigeria',
    ke: 'Kenya',
    // Add more country codes as necessary
  };
  return countryMap[countryCode.toLowerCase()] || countryCode;
};

const getLocationName = (locationCode) => {
  const locationMap = {
    cpt: 'Cape Town',
    jhb: 'Johannesburg',
    wc033: 'Cape Agulhas',
    wc011: 'Matzikama',
    eth: 'eThekwini',
    ec443: 'Mbizana',
    // Add more locations as necessary
  };
  return locationMap[locationCode?.toLowerCase()] || locationCode || '';
};

const formatSubtype = (subtype) => {
  return subtype.charAt(0).toUpperCase() + subtype.slice(1);
};

const getParagraphFromEId = (eId) => {
  const match = eId.match(/_p_(\d+)$/); // Extract the number after '_p_' in the eId
  if (match && match[1]) {
    return `Paragraph ${match[1]}`; // Return 'Paragraph' followed by the number
  }
  return 'Paragraph'; // Fallback in case there's no match
};

const formatComponentTitle = (component) => {
  const { tag, num, heading, subheading, crossheading, eId } = component;
  const capitalizedTag = tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : '';
  const formattedNum = num && num !== "N/A" ? (num.endsWith('.') ? num.slice(0, -1) : num) : '';

  let titleParts = [];
  
  // Check if the tag is 'P' and use eId to form the title
  if (capitalizedTag === 'P' && eId) {
    titleParts.push(getParagraphFromEId(eId));
  } else if (capitalizedTag && formattedNum) {
    titleParts.push(`${capitalizedTag} ${formattedNum}`);
  } else if (capitalizedTag) {
    titleParts.push(`${capitalizedTag}`);
  }

  if (heading && heading !== "N/A") {
    titleParts.push(heading);
  }

  if (subheading && subheading !== "N/A") {
    titleParts.push(subheading);
  }

  if (crossheading && crossheading !== "N/A") {
    titleParts.push(crossheading);
  }

  return titleParts.join(' | ');
};

const SearchResultCard = ({ documentTitle, countryName, flagUrl, documentType, date, expression_date, searchResults, docId }) => {
  const [expandedHeadings, setExpandedHeadings] = useState({}); // Store the expanded state of headings
  const [summaries, setSummaries] = useState({}); // Store summaries returned by API
  const [, setLoading] = useState(false); // Ignore the loading state, just use setLoading
  const navigate = useNavigate();

  const toggleHeadingExpansion = async (idx, eId, docId) => {
    setExpandedHeadings((prevState) => ({
      ...prevState,
      [idx]: !prevState[idx], // Toggle the current index
    }));

    // If summary not already fetched for this section, show skeleton loader
    if (!summaries[idx]) {
      setLoading(true);

      // Initialize skeleton loader
      setSummaries((prevSummaries) => ({
        ...prevSummaries,
        [idx]: "loading", // Use 'loading' as a placeholder for the skeleton loader
      }));

      try {
        const response = await fetch('https://amaicus-production.up.railway.app/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eId, docId }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch summary");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder(); 
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: true });

          // Append chunk to summary
          setSummaries((prevSummaries) => ({
            ...prevSummaries,
            [idx]: prevSummaries[idx] === "loading" ? chunk : prevSummaries[idx] + chunk,
          }));
        }
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const locationCode = countryName.split('-')[1];
  const countryCode = countryName.split('-')[0];
  const locationName = getLocationName(locationCode);
  const fullCountryName = getCountryName(countryCode);

  const highestScore = Math.max(...searchResults.map((result) => result.score));

  let previousComponents = [];

  return (
    <Box className="search-result-card">
      {/* Document Title with Date */}
      <Box className="document-info">
        <Typography variant="h5" className="document-title">
          {documentTitle}, {date}
          </Typography>
      {/* Display the highest score in the top right corner with tooltip */}
      <Tooltip 
        title="Highest search similarity score from this document in the legal database" 
        placement="right" 
        arrow
        PopperProps={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 10],
              },
            },
          ],
        }}
        componentsProps={{
          tooltip: {
            sx: {
              fontSize: '1rem', // Increase tooltip text size
              backgroundColor: '#gray', // Optional: customize tooltip background color
              color: 'white', // Optional: customize tooltip text color
            },
          },
        }}
      >
        <Typography className="highest-score" style={{ float: 'right', cursor: 'pointer' }}>
          Highest Score: {highestScore.toFixed(2)}
        </Typography>
      </Tooltip>
      </Box>

      {/* Country Info Row */}
      <Box className="country-info-row">
        <img src={flagUrl} alt={`Flag of ${fullCountryName}`} className="flag-icon" />
        <Typography className="country-name">{`${locationName}, ${fullCountryName}`}</Typography>
        <Typography className="document-type">{formatSubtype(documentType)}</Typography>
        <Typography className="document-date">{expression_date}</Typography>
      </Box>

      <Divider className="divider" />

      {/* Search Results */}
      {searchResults.map((result, index) => {
        const components = [...result.parents, {
          tag: result.tag,
          eId: result.eId,
          heading: result.heading,
          subheading: result.subheading,
          crossheading: result.crossheading,
          intro: result.intro,
          num: result.num
        }];

        const componentsToRender = components.map((component, idx) => {
          const prevComponent = previousComponents[idx];
          if (
            prevComponent &&
            JSON.stringify(component) === JSON.stringify(prevComponent)
          ) {
            return null;
          } else {
            return component;
          }
        });

        previousComponents = components;

        return (
          <Box key={index} className="search-result">
            <Box className="search-result-content">
              {/* Render each component with indentation and add '+' button for parent headings */}
              {componentsToRender.map((component, idx) => {
                const indentLevel = idx;
                if (!component) {
                  return <div key={idx} style={{ height: '0px' }}></div>;
                } else {
                  const title = formatComponentTitle(component);

                  // Determine if this component is a parent heading by checking the next component's indent level
                  const isParentHeading = componentsToRender[idx + 1] && componentsToRender[idx + 1].tag;

                  return (
                    <React.Fragment key={idx}>
                      <Box style={{ display: 'flex', alignItems: 'center', paddingLeft: `${indentLevel * 20}px` }}>
                        {/* Add the new '+' button only for parent headings */}
                        {isParentHeading && (
                          <Button 
                            variant="contained" 
                            size="small" 
                            style={{ marginRight: '10px', minWidth: '30px', padding: '0' }}
                            onClick={() => toggleHeadingExpansion(`${index}-${idx}`, component.eId, docId)} // Toggle on click
                          >
                            +
                          </Button>
                        )}
                        <Typography
                          variant="subtitle1"
                          className="search-result-title"
                        >
                          {/* Make the heading a clickable link */}
                          <Link
                            component="button"
                            variant="body2"
                            onClick={() => {
                              navigate(`/document/${docId}?eId=${component.eId}`);
                            }}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {title}
                          </Link>
                        </Typography>
                      </Box>

                      {/* Render the sub-card with skeleton loader or actual summary */}
                      {expandedHeadings[`${index}-${idx}`] && (
                        <Box
                          className="sub-card"
                          style={{
                            padding: '10px',
                            margin: '10px 0',
                            border: '1px solid black',
                            borderRadius: '10px',
                            backgroundColor: '#fcfcfc',
                            marginLeft: `${indentLevel * 20}px`,
                          }}
                        >
                          {summaries[`${index}-${idx}`] === "loading" ? (
                            // Skeleton loader content (as many as needed)
                            <>
                              <div className="skeleton-loader"></div>
                              <div className="skeleton-loader" style={{ width: '90%' }}></div>
                              <div className="skeleton-loader" style={{ width: '75%' }}></div>
                            </>
                          ) : (
                            <Typography variant="body2">
                              {summaries[`${index}-${idx}`] || "No summary available"}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </React.Fragment>
                  );
                }
              })}

              {/* Render the content text indented based on the last non-null component */}
              {result.content && (
                <Typography
                  variant="body2"
                  className="search-result-text"
                  style={{ paddingLeft: `${components.length * 20}px` }}
                >
                  {result.content}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default SearchResultCard;