import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  Heading,
  useColorMode,
  useColorModeValue,
  Input,
  Spinner,
  Avatar,
  Checkbox,
  VStack
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import { IncidentData } from "Fonctions/Incident_fonction";
import { Player } from "video-react";
import { MapContainer, TileLayer, useMap, Popup, Marker, Circle } from 'react-leaflet'
import { FaMapMarkerAlt, FaEye } from "react-icons/fa";
import ReactDOMServer from 'react-dom/server';
import Select from 'react-select'
import Swal from 'sweetalert2';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { config } from "config";


export default function GlobalViewCollaboration() {
  const [items, setItems] = useState([
    { id: 1, label: 'Avoir plus d\'informations sur l\'incident', checked: false },
    { id: 2, label: "Proposer un partage d'informations et/ou de ressources sur l'incident", checked: false },
    { id: 3, label: "Proposer une collaboration technique sur l'incident", checked: false },
    { id: 4, label: "Autres", checked: false },
  ]);

  const handleCheck = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSubmit = () => {
    const checkedItems = items.filter((item) => item.checked);
    console.log('Checked Items:', checkedItems);
  };

  const {
    latitude,
    longitude,
    imgUrl,
    position,
    date,
    heure,
    incident,
  } = IncidentData();
  const [collaborations, setCollaborations] = useState([]);
  const userId = sessionStorage.getItem('user_id');
  const { incidentId } = useParams(); 
  const { colorMode } = useColorMode();
  const textColor = useColorModeValue("gray.700", "white");
  const [selectedDate, setSelectedDate] = useState('');
  const [newCollaborationData, setNewCollaborationData] = useState({
    incident: incidentId,
    user: userId,
    end_date: ''
  });
  const [userDetails, setUserDetails] = useState({});
  const avatar = config.url + userDetails.avatar
  console.log('avatar', avatar)
  useEffect(() => {
    setNewCollaborationData({
      incident: incidentId,
      user: userId,
      end_date: selectedDate
    });

    getIncidentDetails();
  }, [incidentId, userId, selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setNewCollaborationData({
      ...newCollaborationData,
      end_date: e.target.value
    });
  };

  const fetchCollaborations = async () => {
    try {
        const response = await axios.get(`${config.url}/MapApi/collaboration`);
        setCollaborations(response.data);
    } catch (error) {
        console.error('Erreur lors de la récupération des collaborations : ', error);
    }
  };

  const createCollaboration = async () => {
    try {
        const response = await axios.post(`${config.url}/MapApi/collaboration/`, newCollaborationData, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        return response;
        // fetchCollaborations();
    } catch (error) {
      console.error('Erreur lors de la création de la collaboration : ', error.response.data);
      throw error;
    }
  };

  const getIncidentDetails = async () => {
    try {
        const url = `${config.url}/MapApi/incidentDetail/${incidentId}`;
        const token = sessionStorage.getItem("token");
        console.log("Requesting URL:", url);
        console.log("Using token:", token);

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        setUserDetails(response.data.user);
        console.log("Incident details", response.data);
    } catch (error) {
        console.error('Error fetching incident details:', error);
        throw error;
    }
  };

  const sendDate = async (e) => {
    if(selectedDate == ''){
      Swal.fire("Date",
        "La date de clôture de la collaboration est obligation.")
        return
    }
      try {
        setNewCollaborationData({
          incident: incident.id,
          user: userId,
          end_date: selectedDate
        });
          let response = await createCollaboration();
          if(response.status === 201){
            Swal.fire("Succès","La demande de collaboration a été envoyée !");
            setNewCollaborationData({
              incident: incident.id,
              user: userId,
              end_date: ''
            });
            setSelectedDate('')
          }else{
            Swal.fire("Erreur",
                "Une erreur s'est produite lors de l'envoi de la demande de collaboration. Veuillez réessayer plus tard.");
          }
      } catch (error) {
          console.error('Erreur lors de la création de la collaboration : ', error);
          Swal.fire("Erreur",
              "Une erreur s'est produite lors de l'envoi de la demande de collaboration. Veuillez réessayer plus tard.");
      }
  };


  // icon map color
  const iconHTMLBlue = ReactDOMServer.renderToString(
    <FaMapMarkerAlt color="blue" size={20} />
  );

  const customMarkerIconBlue = new L.DivIcon({
    html: iconHTMLBlue,
  });

  const iconHTMLRed = ReactDOMServer.renderToString(
    <FaMapMarkerAlt color="red" size={20} />
  );

  const customMarkerIconRed = new L.DivIcon({
    html: iconHTMLRed,
  });

  const iconHTMLOrange = ReactDOMServer.renderToString(
    <FaMapMarkerAlt color="orange" size={20} />
  );

  const customMarkerIconOrange = new L.DivIcon({
    html: iconHTMLOrange,
  });
  function RecenterMap({ lat, lon }) {
    const map = useMap();
    useEffect(() => {
      if (lat && lon) {
        map.setView([lat, lon], 13);
      }
    }, [lat, lon, map]);
    return null;
  }

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      <Grid
        templateColumns={{ sm: "1fr", lg: "2fr 1fr" }}
        templateRows={{ lg: "repeat(2, auto)" }}
        gap='20px'>

        <Card
          bg={colorMode === "dark" ? "navy.800" : "linear-gradient(81.62deg, #313860 2.25%, #151928 79.87%)"}
          p='0px'
          maxW={{ sm: "320px", md: "100%" }}>
          <Flex direction='column' mb='40px' p='28px 0px 0px 22px'>
            <Text color='#fff' fontSize='lg' fontWeight='bold' mb='6px'>
              Carte interactive
            </Text>
          </Flex>

          <Box minH="300px">
            {latitude !== 0 && longitude !== 0 ? (
              <Box height='600px' width='100%' p="0 8px 0 8px">
                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <RecenterMap lat={latitude} lon={longitude} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    className="icon-marker"
                    icon={
                      incident.etat === "resolved"
                        ? customMarkerIconBlue
                        : incident.etat === "taken_into_account"
                          ? customMarkerIconOrange
                          : customMarkerIconRed
                    }
                    position={position}
                  >
                    <Popup>{incident.title}</Popup>
                    <Circle center={position} radius={500} color="red" />
                  </Marker>
                </MapContainer>
              </Box>
            ) : (
              <Text className="danger" color="red.500">Coordonnees non renseignees</Text>
            )}
          </Box>
        </Card>
        <Card p='0px' maxW={{ sm: "320px", md: "100%" }}>
        <Flex direction='column'>
        <Flex align='center' justify='space-between' p='22px'>
          <Text fontSize='lg' color='textColor' fontWeight='bold'>
            Faire une demande de collaboration sur cet incident
          </Text>
        </Flex>
        <Box minH='100px' p='22px'>
          <Text fontSize='xs' p="10px" color='textColor' fontWeight='bold'>
            Déterminer la date de clôture de la collaboration.
          </Text>
          
          <Input
            type="date"
            onChange={handleDateChange}
            value={selectedDate}
            mb='10px'
            border='1px solid #ccc'
            borderRadius='15px'
            boxShadow='0 0 0 1px #2684FF'
          />
        </Box>
        <VStack align="start" spacing={4} p='22px'>
          <Text>Quelles sont vos motivations pour la demande de collaboration ?</Text>
            {items.map((item) => (
              <Checkbox
                key={item.id}
                isChecked={item.checked}
                onChange={() => handleCheck(item.id)}
              >
                {item.label}
              </Checkbox>
            ))}
          </VStack>
        <Box pl="25px">
          <Button onClick={() => sendDate()} colorScheme='blue' w="200px">Envoyer</Button>
        </Box>
      </Flex>
        </Card>
        <Card p='0px' maxW={{ sm: "320px", md: "100%" }}>
          <Flex direction='column' mb='40px' p='28px 0px 0px 22px'>
            <Text fontSize='lg' color={textColor} fontWeight='bold'>
              Image de l'incident
            </Text>
          </Flex>
          <Box minH='300px' p='8px'>
            {imgUrl ? <img src={imgUrl} alt="Incident" /> : "No image available"}
          </Box>
          <Flex direction='row' align='center' justifyContent='space-between' p="8px">
            <Text color='#ccc' fontWeight='bold' mb='6px' flexGrow={1}>
              Date : {date}
            </Text>
            <Text color='#ccc' fontWeight='bold' mb='6px'>
              Heure : {heure}
            </Text>
          </Flex>

        </Card>

        <Card p="0px" maxW={{ sm: "320px", md: "100%" }}>
          <Flex direction="column">
            <Box overflow={{ sm: "scroll", lg: "hidden" }} p="22px">
              <Heading size="md" mb="4">Organisation Détails</Heading>
              <Flex align="center" mb="4">
                <Avatar src={avatar} size="xl" mr="4" />
                <Box>
                  <Text fontWeight="bold" fontSize="xl">{userDetails.organisation}</Text>
                  <Text fontSize="sm">A pris en charge l'incident</Text>
                </Box>
              </Flex>
              <Box>
                <Text fontSize="lg" fontWeight="bold">Contact Information</Text>
                <Text>Email: {userDetails.email}</Text>
                <Text>Téléphone: {userDetails.phone}</Text>
              </Box>
            </Box>
          </Flex>
        </Card>
      </Grid>
    </Flex>
  );
}

