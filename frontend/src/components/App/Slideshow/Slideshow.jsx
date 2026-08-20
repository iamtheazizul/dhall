import React, { useState, useEffect } from 'react';
import '../../../styles/Slideshow.css';

function Slideshow({ images, interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, interval]);

  const goToNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="slideshow-container">
      {/* Main Image Display */}
      <div className="slideshow-wrapper">
        {images.map((image, index) => {          
          return (
            <div key={index} className={`slideshow-slide ${index === currentIndex ? 'active' : ''}`}>
              {image.link ? (
                <a href={image.link} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={image.url} 
                    alt={image.alt || `Slide ${index + 1}`}
                    className="slideshow-image"
                  />
                </a>
              ) : (
                <img 
                  src={image.url} 
                  alt={image.alt || `Slide ${index + 1}`}
                  className="slideshow-image"
                />
              )}
              {image.caption && (
                <div className="slideshow-caption">
                  <p>{image.caption}</p>
                </div>
              )}
            </div>
          );
        })}
        {/* Navigation Arrows */}
        <button 
          className="slideshow-arrow prev"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button 
          className="slideshow-arrow next"
          onClick={goToNext}
          aria-label="Next slide"
        >
          ›
        </button>
      </div>


    </div>
  );
}

export default Slideshow;