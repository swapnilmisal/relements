import { useState, useRef, useEffect } from 'react';

export function useDropdown(createTerm, options, optionKey, value, allowCreate, createPrefix = '+ Create') {
  const getFilteredOptions = () => {
    const flatValue = value.map(valueItem => valueItem[optionKey]);
    let filteredOptions = options.filter(option => !flatValue.includes(option[optionKey]));
    if (allowCreate && createTerm) {
      filteredOptions = [
        {
          [optionKey]: `${createPrefix} "${createTerm}"`,
          type: 'CREATE',
        },
      ].concat(filteredOptions);
    }
    return filteredOptions;
  };

  return [getFilteredOptions(options)];
}