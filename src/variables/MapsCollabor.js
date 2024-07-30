import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet";
import { IconContext } from "react-icons";
import { FaMapMarkerAlt, FaEye } from "react-icons/fa";
import ReactDOMServer from "react-dom/server";
import { config } from "config";
import L from "leaflet";
import axios from "axios";

const position = [16.2833, -3.0833];

const Carte = ({ onShowIncident }) => {
  const [showOnlyTakenIntoAccount, setShowOnlyTakenIntoAccount] = useState(false);
  const [showOnlyResolved, setShowOnlyResolved] = useState(false);
  const [showOnlyDeclared, setShowOnlyDeclared] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    _getIncidents();
  }, [selectedMonth]);

  const _getIncidents = async () => {
    const url = `${config.url}/MapApi/incidentByMonth/?month=${selectedMonth}`;
    try {
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${sessionStorage.token}`,
                "Content-Type": "application/json",
            },
        });

        console.log('Les informations de la carte', res.data.data);

        const incidents = res.data.data.filter(incident => incident.etat === "taken_into_account");

        const validPositions = incidents
            .filter(
                (incident) =>
                    incident.lattitude !== null &&
                    incident.longitude !== null &&
                    !isNaN(incident.lattitude) &&
                    !isNaN(incident.longitude)
            )
            .map((incident) => ({
                id: incident.id,
                lat: incident.lattitude,
                lon: incident.longitude,
                tooltip: incident.title,
                desc: incident.description,
                etat: incident.etat,
                img: incident.photo,
                video: config.url + incident.video,
                audio: config.url + incident.audio
            }));
            console.log(validPositions)

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
                      <p>Voir l'incident</p>
                    </div>
                    <div className="col-md-6">
                      <img src={mark.img} alt="" />
                      <div>
                        <button
                          className="boutton button--round-l"
                          onClick={() => onShowIncident(mark.id)}
                        >
                          <FaEye color="#ccc" />
                        </button>
                      </div>
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
// import React from 'react';
// import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet';
// import L from 'leaflet';
// import { IconContext } from 'react-icons';
// import { FaMapMarkerAlt } from 'react-icons/fa';
// import ReactDOMServer from 'react-dom/server';

// const position = [16.2833, -3.0833]; // Position centrale de la carte

// const iconHTMLBlue = ReactDOMServer.renderToString(
//   <IconContext.Provider value={{ color: 'blue', className: 'global-class-name' }}>
//     <FaMapMarkerAlt />
//   </IconContext.Provider>
// );

// const customMarkerIconBlue = new L.DivIcon({
//   html: iconHTMLBlue,
// });

// const dummyPositions = [
//   { id: 1, lat: 16.5, lon: -3.5, tooltip: 'Marqueur 1', img: 'https://via.placeholder.com/50' },
//   { id: 2, lat: 16.7, lon: -3.0, tooltip: 'Marqueur 2', img: 'https://via.placeholder.com/50' },
//   { id: 3, lat: 16.3, lon: -3.2, tooltip: 'Marqueur 3', img: 'https://via.placeholder.com/50' },
// ];

// const Carte = () => {
//   return (
//     <MapContainer center={position} zoom={5} style={{ height: '50vh', width: '100%' }}>
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//       />
//       {dummyPositions.map((mark, idx) => (
//         <Marker
//           key={`marker-${idx}`}
//           icon={customMarkerIconBlue}
//           position={[mark.lat, mark.lon]}
//         >
//           <Popup>
//             <span className="icon-marker-tooltip">
//               <p>{mark.tooltip}</p>
//               <img src={mark.img} alt="" />
//             </span>
//           </Popup>
//         </Marker>
//       ))}
//     </MapContainer>
//   );
// };

// export default Carte;
