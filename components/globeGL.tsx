"use client"

import React, { useEffect, useRef, useState } from "react"
import Globe from 'globe.gl'

export default function GlobeVisualization({
    pointData = null,
    width = "100%",
    height = "600px",
    globeImageUrl = '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
    backGroundImageUrl = '//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png',
    topAltitude = 0.7,
    transitionDuration = 0,
    enableInteraction = true
}) {
  const globeContainerRef = useRef(null)
  const globeRef = useRef(null)
  
    const [data, setData] = useState(() => {
        if (pointData && pointData.length > 0) {
        return pointData;
        }

        // if there is no pointData, fetch data from init.json in ../data/
        const initData = require('../data/init.json');
        return initData;
    });
    // Update data when pointData prop changes
    useEffect(() => {
      if (pointData && pointData.length > 0) {
        setData(pointData);
      }

    }, [pointData]);

  useEffect(() => {
    if (!globeContainerRef.current) return;
    
    // Initialize the globe
    const globe = Globe()(globeContainerRef.current)
        .globeImageUrl(globeImageUrl)
        .heatmapsData([data])
        .heatmapPointLat('lat')
        .heatmapPointLng('lng')
        .heatmapPointWeight('weight')
        .heatmapTopAltitude(topAltitude)
        .heatmapsTransitionDuration(transitionDuration)
        .enablePointerInteraction(enableInteraction)
        .backgroundImageUrl(backGroundImageUrl)
        
      
    // Save reference to cleanup later
    globeRef.current = globe;
    
    // Set the container width and height to match parent
    const container = globeContainerRef.current;
    const parent = container.parentElement;
    
    // Responsive sizing function
    const handleResize = () => {
      if (parent && globe) {
        // Get parent dimensions
        const parentWidth = parent.clientWidth;
        const parentHeight = parent.clientHeight || parseInt(height);
        
        // Update globe dimensions to fit parent
        globe.width(parentWidth).height(parentHeight);
      }
    };
    
    // Set initial size
    handleResize();
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (globeRef.current && globeContainerRef.current) {
        // Clean up Three.js resources
        globeRef.current._destructor && globeRef.current._destructor();
        
        // Clear the container
        if (globeContainerRef.current.innerHTML) {
          globeContainerRef.current.innerHTML = '';
        }
      }
    };
  }, [globeImageUrl, topAltitude, transitionDuration, enableInteraction, height]);

  // Update data when it changes
  useEffect(() => {
    if (globeRef.current && data) {
      globeRef.current.heatmapsData([data]);
    }
  }, [data]);

  // Update heatmap data if pointData prop changes
  useEffect(() => {
    if (pointData && pointData.length > 0) {
      setData(pointData);
    }
  }, [pointData]);

  return (
    <div 
      ref={globeContainerRef} 
      style={{ 
        width: '100%',  // Always use 100% to fit parent
        height: typeof height === 'number' ? `${height}px` : height,
        position: 'relative',
        maxWidth: '100%', // Ensure it doesn't overflow
        margin: '0 auto'  // Center within parent if smaller
      }}
    />
  );
}