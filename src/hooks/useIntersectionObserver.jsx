import { useState, useEffect, useRef } from 'react';

export const useIntersectionObserver = (elements, options = {}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const observerRef = useRef(null);

  useEffect(() => {
    const defaultOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
      ...options
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const elementIndex = elements.findIndex(el => el === entry.target);
          if (elementIndex !== -1) {
            setActiveIndex(elementIndex);
          }
        }
      });
    }, defaultOptions);

    const currentElements = Array.isArray(elements) ? elements : [elements];
    currentElements.forEach(element => {
      if (element) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        currentElements.forEach(element => {
          if (element) {
            observerRef.current.unobserve(element);
          }
        });
        observerRef.current.disconnect();
      }
    };
  }, [elements, options.threshold, options.rootMargin]);

  return activeIndex;
};
