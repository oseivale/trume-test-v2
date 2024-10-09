import React, { useEffect, useState } from "react";
//import "./Dropdown.css"; // Assume you have your styles here

const Dropdown = ({ tags }) => {
  // Example options stored in state
  const [options, setOptions] = useState([]);

  const setDropdown = () => {
    if (tags?.includes("classic")) {
      setOptions(prevState => [...prevState, {value: 'classic', label: 'Classic'}]);
    }  
    
    if (tags?.includes("spark")) {
      setOptions(prevState => [...prevState, {value: 'spark', label: 'Spark'}]);
    }  
    
    if (tags?.includes("bright")) {
      setOptions(prevState => [...prevState, {value: 'bright', label: 'Bright'}]);
    }
  };

  useEffect(() => {
    setDropdown()
  }, [])

  const [selectedOption, setSelectedOption] = useState("");

  // Handle option change
  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="dropdown-container">
      <label htmlFor="dynamic-dropdown" className="dropdown-label">
        Select an Option
      </label>
      <select
        id="dynamic-dropdown"
        className="dropdown"
        value={selectedOption}
        onChange={handleSelectChange}
      >
        <option value="" disabled>
          -- Choose an option --
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {selectedOption && (
        <div className="selected-option">
          <p>You selected: {selectedOption}</p>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
