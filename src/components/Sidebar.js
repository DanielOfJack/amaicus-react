import React, { useState } from 'react';
import { Box, Button, Typography, Divider, Slider, Chip, List, ListItem, ListItemText, Checkbox, Autocomplete, TextField, Tooltip } from '@mui/material';
import './Sidebar.css'; // Import CSS for sidebar styling

const documentLabels = ["By-law", "Act", "Gazette", "Notice", "Judgement"];
const africanCountries = ["South Africa", "Nigeria", "Kenya", "Ghana", "Egypt"];
const cities = ["Cape Town", "Johannesburg", "Cape Agulhas", "Matzikama", "eThekwini", "Mbizana"];

const Sidebar = ({ onLocationChange, onYearRangeChange }) => {
  const [selectedDocuments] = useState(["By-law"]);
  const [selectedLocalities, setSelectedLocalities] = useState([]);
  const [yearRange, setYearRange] = useState([1900, 2024]);

  const toggleLocality = (city) => {
    const updatedLocalities = selectedLocalities.includes(city)
      ? selectedLocalities.filter((item) => item !== city)
      : [...selectedLocalities, city];
    setSelectedLocalities(updatedLocalities);
    onLocationChange(updatedLocalities);
  };

  const handleYearRangeChange = (event, newValue) => {
    setYearRange(newValue);
    onYearRangeChange(newValue); // Send the updated range to the parent
  };

  return (
    <Box className="sidebar-container">
      {/* Document Section */}
      <Typography variant="h6" className="sidebar-section-title">Document</Typography>
      <Box className="button-group">
        {documentLabels.map((label) => (
          <Tooltip
            key={label}
            title="Documents have been restricted to only 'By laws' for the amAIcus Africa prototype. Full API access coming soon."
            placement="right"
            arrow
          >
            <Button
              key={label}
              variant={selectedDocuments.includes(label) ? "contained" : "outlined"}
              disabled={label !== "By-law"}
              className={`custom-button ${selectedDocuments.includes(label) ? "active" : ""}`}
            >
              {label}
            </Button>
          </Tooltip>
        ))}
      </Box>
      <Divider className="sidebar-divider" />

      {/* Jurisdiction Section */}
      <Typography variant="h6" className="sidebar-section-title">Jurisdiction</Typography>
      <Autocomplete
        options={africanCountries}
        value="South Africa"
        getOptionDisabled={(option) => option !== "South Africa"}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            sx={{ backgroundColor: 'white', borderRadius: '1rem' }}
          />
        )}
        className="sidebar-autocomplete"
      />
      <Box className="chip-group">
        {/* Preselect 'South Africa' */}
        <Tooltip 
          title="Jurisdiction has been limited to South Africa for the amAIcus Africa prototype. Full API access coming soon." 
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
          <span>
            <Chip
              label="South Africa"
              sx={{
                backgroundColor: 'black !important',
                color: 'white !important',
                '& .MuiChip-deleteIcon': {
                  color: 'white !important',
                },
                '&.Mui-disabled': {
                  opacity: 1,
                  backgroundColor: 'black !important',
                  color: 'white !important',
                },
              }}
              onDelete={() => {}}
              deleteIcon={<span>✕</span>}
              disabled
            />
          </span>
        </Tooltip>
      </Box>
      <Divider className="sidebar-divider" />

      {/* Locality Section */}
      <Typography variant="h6" className="sidebar-section-title">Locality</Typography>
      <List className="scrollable-list">
        {cities.map((city) => (
          <ListItem key={city} disablePadding>
            <Checkbox
              edge="start"
              checked={selectedLocalities.includes(city)}
              tabIndex={-1}
              onChange={() => toggleLocality(city)}
              className="custom-checkbox"
            />
            <ListItemText primary={city} />
          </ListItem>
        ))}
      </List>
      <Divider className="sidebar-divider" />

      {/* Year Section */}
      <Typography variant="h6" className="sidebar-section-title">Year</Typography>
      <Box sx={{ width: '90%' }}>
        <Slider
          value={yearRange}
          onChange={handleYearRangeChange}
          valueLabelDisplay="auto"
          min={1900}
          max={2024}
          className="custom-slider"
        />
      </Box>
      <Typography variant="body2" className="slider-range">
        Range: {yearRange[0]} - {yearRange[1]}
      </Typography>
    </Box>
  );
};

export default Sidebar;