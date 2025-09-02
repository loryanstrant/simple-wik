import React, { useState } from 'react';
import {
  Box,
  Chip,
  TextField,
  Autocomplete,
  Typography,
} from '@mui/material';
import { LocalOffer } from '@mui/icons-material';

const TagInput = ({ tags = [], onChange, allTags = [] }) => {
  const [inputValue, setInputValue] = useState('');

  const handleTagChange = (event, newTags) => {
    // Filter out empty tags and duplicates
    const filteredTags = newTags
      .filter(tag => tag && tag.trim())
      .map(tag => tag.trim().toLowerCase())
      .filter((tag, index, arr) => arr.indexOf(tag) === index);
    
    onChange(filteredTags);
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalOffer fontSize="small" />
        Tags (like ingredients in Simple Rick's recipes)
      </Typography>
      <Autocomplete
        multiple
        freeSolo
        options={allTags}
        value={tags}
        onChange={handleTagChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
              size="small"
              color="primary"
              key={index}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Add tags (press Enter or comma to add)"
            helperText="Simple tags keep your knowledge organized - like recipes sorted by ingredients"
            size="small"
          />
        )}
        filterOptions={(options, params) => {
          const filtered = options.filter(option =>
            option.toLowerCase().includes(params.inputValue.toLowerCase())
          );
          
          // Add the current input as an option if it's not empty
          if (params.inputValue !== '' && !filtered.includes(params.inputValue)) {
            filtered.push(params.inputValue);
          }
          
          return filtered;
        }}
      />
    </Box>
  );
};

export default TagInput;