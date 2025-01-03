import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet";
import { IconContext } from "react-icons";
import { FaMapMarkerAlt, FaEye } from "react-icons/fa";
import ReactDOMServer from "react-dom/server";
import { config } from "config";
import L from "leaflet";
import axios from "axios";
import { useMonth } from "Fonctions/Month";
import { useDateFilter } from "Fonctions/YearMonth";
import { Image, Flex, Text, IconButton } from "@chakra-ui/react";
const position = [16.2833, -3.0833];
        
const Carte = ({ onShowIncident }) => {
  const [showOnlyTakenIntoAccount, setShowOnlyTakenIntoAccount] = useState(false);
  const [showOnlyResolved, setShowOnlyResolved] = useState(false);
  const [showOnlyDeclared, setShowOnlyDeclared] = useState(false);
  const [positions, setPositions] = useState([]);
  const { filterType, customRange } = useDateFilter();
  const { selectedMonth } = useMonth();
  const [mapType, setMapType] = useState('standard');

  useEffect(() => {
    _getIncidents();
  }, [selectedMonth, filterType, customRange]);
  
  const _getUserById = async (userId) => {
    try {
      const res = await axios.get(`${config.url}/MapApi/user/${userId}/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.token}`,
        },
      });
      console.log(res.data, "")
      return res.data;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  };

  const _getIncidents = async () => {
    let url = `${config.url}/MapApi/incident-filter/?filter_type=${filterType}`;
    
    if (filterType === 'custom_range' && customRange[0].startDate && customRange[0].endDate) {
        url += `&custom_start=${customRange[0].startDate.toISOString().split('T')[0]}&custom_end=${customRange[0].endDate.toISOString().split('T')[0]}`;
    }
    
    try {
      if (!sessionStorage.token) {
        console.error("Token non trouvé");
        return;
      }

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${sessionStorage.token}`,
          'Content-Type': 'application/json',
        },
      });
      const incidents = res.data.filter(incident => incident.etat === "taken_into_account");
      const validPositions = await Promise.all(
        incidents
          .filter(
            (incident) =>
              incident.lattitude !== null &&
              incident.longitude !== null &&
              !isNaN(incident.lattitude) &&
              !isNaN(incident.longitude)
          )
          .map(async (incident) => {
            const user = await _getUserById(incident.taken_by);
            return {
              id: incident.id,
              lat: incident.lattitude,
              lon: incident.longitude,
              tooltip: incident.title,
              desc: incident.description,
              etat: incident.etat,
              img: config.url + incident.photo,
              orgPhoto: config.url + user?.avatar || "", 
              orga_name: user?.organisation,
              video: config.url + incident.video,
              audio: config.url + incident.audio,
            };
          })
      );

      setPositions(validPositions);
    } catch (error) {
      console.error(error.message);
    }
  };

  const iconHTMLBlue = ReactDOMServer.renderToString(
      <FaMapMarkerAlt color= "blue" size={20}/>
  );

  const customMarkerIconBlue = new L.DivIcon({
    html: iconHTMLBlue,
  });

  const iconHTMLRed = ReactDOMServer.renderToString(
      <FaMapMarkerAlt color= "red" size={20}/>
  );

  const customMarkerIconRed = new L.DivIcon({
    html: iconHTMLRed,
  });

  const iconHTMLOrange = ReactDOMServer.renderToString(
      <FaMapMarkerAlt color= "orange" size={20}/>
  );

  const customMarkerIconOrange = new L.DivIcon({
    html: iconHTMLOrange,
  });

  return (
    <MapContainer center={position} zoom={5} style={{ height: '50vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {positions.map((mark, idx) => (
        ((showOnlyTakenIntoAccount && mark.etat !== "taken_into_account") ||
          (showOnlyResolved && mark.etat !== "resolved") ||
          (showOnlyDeclared && mark.etat !== "declared")) ? null : (
          <Marker
            className="icon-marker"
            key={`marker-${idx}`}
            icon={
              mark.etat === "resolved"
                ? customMarkerIconBlue
                : mark.etat === "taken_into_account"
                  ? customMarkerIconOrange
                  : customMarkerIconRed
            }
            position={[mark.lat, mark.lon]}
          >
            <Popup>
              <span className="icon-marker-tooltip">
                <ul>
                  <div className="row">
                    <div className="col-md-6">
                    <Flex alignItems="center">
                      <Text mr={2}>Voir l'incident</Text> 
                      <IconButton
                        icon={<FaEye />}
                        aria-label="Voir l'incident"
                        colorScheme="gray"
                        onClick={() => onShowIncident(mark.id)}
                      />
                    </Flex>
                    </div>
                    <div className="col-md-6">
                      <Image
                        src={mark.img}
                        alt="Organization"
                        boxSize="100px"
                        objectFit="cover"
                      />
                      <div style={{ wordBreak:'break-word', maxWidth:'14Opx'}}>
                        <p> Pris en compte par {mark.orga_name} </p>
                      </div>
                      <Image
                        src={mark.orgPhoto}
                        alt="Organization"
                        borderRadius="full" 
                        boxSize="100px"      
                        objectFit="cover"   
                      />
                    </div>
                  </div>
                </ul>
              </span>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default Carte;
