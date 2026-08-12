'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export default function MultiSelect({ options, selectedValues, onChange, placeholder = 'Select Brands' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (option) => {
    let newSelected;
    if (option === 'All') {
      newSelected = []; // Empty array means 'All'
    } else {
      if (selectedValues.includes(option)) {
        newSelected = selectedValues.filter((v) => v !== option);
      } else {
        newSelected = [...selectedValues, option];
      }
    }
    onChange(newSelected);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected = selectedValues.length === 0;

  // Button display text
  let buttonText = placeholder;
  if (isAllSelected) {
    buttonText = 'All Brands';
  } else if (selectedValues.length === 1) {
    buttonText = selectedValues[0];
  } else if (selectedValues.length > 1) {
    buttonText = `${selectedValues.length} Brands Selected`;
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', width: '100%', minWidth: '160px' }}>
      {/* Dropdown Toggle Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          color: '#e2e8f0',
          fontSize: '13px',
          cursor: 'pointer',
          userSelect: 'none',
          gap: '8px',
          height: '38px',
          transition: 'all 0.2s',
          boxShadow: isOpen ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none'
        }}
      >
        <span style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          flex: 1,
          textAlign: 'left'
        }}>
          {buttonText}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {!isAllSelected && (
            <X 
              size={14} 
              onClick={handleClearAll} 
              style={{ color: '#94a3b8', cursor: 'pointer' }} 
              className="hover-bright"
            />
          )}
          <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          zIndex: 1000,
          background: '#0f111a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '300px'
        }}>
          {/* Mini Search input */}
          <input
            type="text"
            placeholder="Search brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '12px',
              outline: 'none'
            }}
          />

          {/* Options list */}
          <div style={{ 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '2px',
            flex: 1
          }}>
            {/* "All Brands" Option */}
            {searchTerm === '' && (
              <div
                onClick={() => handleToggleOption('All')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: isAllSelected ? '#f8fafc' : '#94a3b8',
                  background: isAllSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  transition: 'background 0.2s',
                  textAlign: 'left'
                }}
                className="multiselect-option"
              >
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isAllSelected ? '#1e40af' : 'transparent',
                  borderColor: isAllSelected ? '#1e40af' : 'rgba(255, 255, 255, 0.2)',
                  flexShrink: 0
                }}>
                  {isAllSelected && <Check size={10} style={{ color: '#ffffff' }} />}
                </div>
                <span>All Brands</span>
              </div>
            )}

            {/* Individual Options */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => handleToggleOption(option)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: isSelected ? '#f8fafc' : '#cbd5e1',
                      background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                      transition: 'background 0.2s',
                      textAlign: 'left'
                    }}
                    className="multiselect-option"
                  >
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected ? '#1e40af' : 'transparent',
                      borderColor: isSelected ? '#1e40af' : 'rgba(255, 255, 255, 0.2)',
                      flexShrink: 0
                    }}>
                      {isSelected && <Check size={10} style={{ color: '#ffffff' }} />}
                    </div>
                    <span>{option}</span>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '8px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                No brands found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
