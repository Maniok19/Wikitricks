import React, { useState, useEffect, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import styled from 'styled-components';
import axiosInstance from '../utils/axios';

const SearchContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  min-width: 250px;
  max-width: 300px;
  
  @media (max-width: 768px) {
    min-width: 200px;
    max-width: 250px;
    top: 8px;
    left: 8px;
    padding: 8px;
  }
`;

const MapContainer = styled.div`
  height: 500px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  
  &:focus {
    border-color: #2c3e50;
    box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  background: #f8d7da;
  border-radius: 8px;
  color: #721c24;
`;

const InfoWindow = styled.div`
  padding: 10px;
  max-width: 200px;
  
  h3 {
    margin: 0 0 5px 0;
    color: #2c3e50;
  }
  
  p {
    margin: 0;
    color: #34495e;
    font-size: 0.875rem;
  }
`;

const MapComponent = ({ skateParkData }) => {
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const ref = useCallback((node) => {
    if (node !== null) {
      const newMap = new window.google.maps.Map(node, {
        center: { lat: 48.8566, lng: 2.3522 }, // Paris center
        zoom: 7,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      setMap(newMap);
      setIsMapLoaded(true);

      const newInfoWindow = new window.google.maps.InfoWindow();
      setInfoWindow(newInfoWindow);

      // Search for skateparks using the new Places API
      const searchSkateparks = async () => {
        try {
          const bounds = newMap.getBounds();
          if (!bounds) return;

          const center = bounds.getCenter();
          
          // Use the new Text Search API
          const request = {
            textQuery: 'skatepark',
            fields: ['displayName', 'location', 'formattedAddress', 'rating', 'id'],
            locationBias: {
              center: center,
              radius: 50000 // 50km radius
            },
            maxResultCount: 20
          };

          const { places } = await window.google.maps.places.Place.searchByText(request);
          
          if (places && places.length > 0) {
            places.forEach((place) => {
              const marker = new window.google.maps.Marker({
                position: place.location,
                map: newMap,
                title: place.displayName,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="12" fill="#e74c3c" stroke="#fff" stroke-width="2"/>
                      <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">🛹</text>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(32, 32)
                }
              });

              marker.addListener('click', () => {
                newInfoWindow.setContent(`
                  <div>
                    <h3>${place.displayName}</h3>
                    <p><strong>Address:</strong> ${place.formattedAddress || 'N/A'}</p>
                    <p><strong>Rating:</strong> ${place.rating || 'N/A'}</p>
                    <p><em>Found via Google Places</em></p>
                  </div>
                `);
                newInfoWindow.open(newMap, marker);
              });
            });
          }
        } catch (error) {
          console.error('Error searching for skateparks:', error);
        }
      };

      // Search when map is idle (after initial load and after user stops panning/zooming)
      newMap.addListener('idle', searchSkateparks);
    }
  }, []);

  // Initialize autocomplete when map is ready
  useEffect(() => {
    if (map && isMapLoaded && window.google && window.google.maps.places) {
      const input = document.getElementById('city-search-input');
      if (input) {
        const newAutocomplete = new window.google.maps.places.Autocomplete(input, {
          types: ['(cities)'],
          fields: ['place_id', 'geometry', 'name', 'formatted_address']
        });

        newAutocomplete.addListener('place_changed', () => {
          const place = newAutocomplete.getPlace();
          
          if (!place.geometry || !place.geometry.location) {
            console.log("No details available for input: '" + place.name + "'");
            return;
          }

          // Center map on selected city
          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(10);
          }
        });

        setAutocomplete(newAutocomplete);
      }
    }
  }, [map, isMapLoaded]);

  useEffect(() => {
    if (map && infoWindow) {
      // Add markers for each user-created skate park
      skateParkData.forEach(park => {
        const marker = new window.google.maps.Marker({
          position: { lat: park.lat, lng: park.lng },
          map: map,
          title: park.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="12" fill="#2c3e50" stroke="#fff" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">🛹</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });

        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div>
              <h3>${park.name}</h3>
              <p><strong>Adresse:</strong> ${park.address}</p>
              <p>${park.description}</p>
              <p><em>User-created skatepark</em></p>
            </div>
          `);
          infoWindow.open(map, marker);
        });
      });
    }
  }, [map, infoWindow, skateParkData]);

  return (
    <MapContainer ref={ref}>
      {isMapLoaded && (
        <SearchContainer>
          <SearchInput
            id="city-search-input"
            type="text"
            placeholder="🔍 Search for a city..."
            autoComplete="off"
          />
        </SearchContainer>
      )}
    </MapContainer>
  );
};

const SkateParksMap = () => {
  const [skateParks, setSkateParks] = useState([]);

  useEffect(() => {
    const fetchSkateParks = async () => {
      try {
        const response = await axiosInstance.get('/skateparks');
        setSkateParks(response.data);
      } catch (error) {
        console.error('Error fetching skate parks:', error);
      }
    };

    fetchSkateParks();
  }, []);

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return <LoadingMessage>Loading map...</LoadingMessage>;
      case Status.FAILURE:
        return <ErrorMessage>Error loading map</ErrorMessage>;
      case Status.SUCCESS:
        return <MapComponent skateParkData={skateParks} />;
      default:
        return null;
    }
  };

  return (
    <Wrapper
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      render={render}
      libraries={['places']}
    />
  );
};

export default SkateParksMap;