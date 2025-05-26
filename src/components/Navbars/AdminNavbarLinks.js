
// Chakra Icons
import { BellIcon } from "@chakra-ui/icons";
// Chakra Imports
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  FormControl
} from "@chakra-ui/react";
// Custom Icons
import appLogoLight from "../../assets/img/logo.png"; 
// Custom Components
import { ItemContent } from "components/Menu/ItemContent";
import { SearchBar } from "components/Navbars/SearchBar/SearchBar";
import { SidebarResponsive } from "components/Sidebar/Sidebar";
import React, { useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import routes from "routes.js";
// axios
import axios from "axios";
import { config } from "config";
import { useAuth } from "context/AuthContext";
import Swal from "sweetalert2";
import { IoLogOutOutline } from "react-icons/io5";
import { components } from 'react-select';
// import Select from 'react-select';
import { useIncidentData } from "Fonctions/Dash_fonction";
import  { DateRange } from 'react-date-range';
import { fr } from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useDateFilter } from "Fonctions/YearMonth";


const CustomOption = (props) => {
    return (
        <components.Option {...props}>
            <div>{props.data.label}</div>
        </components.Option>
    );
};

export default function HeaderLinks(props) {
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState([])
  const history = useHistory();
  const { filterType, customRange, handleFilterChange,handleDateChange, applyCustomRange, showDatePicker } = useDateFilter();
  const {
    variant,
    children,
    fixed,
    scrolled,
    secondary,
    onOpen : onOpenProp,
    ...rest
  } = props;
  const { colorMode } = useColorMode();
  const [notifications, setNotifications] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNotification, setSelectedNotification] = useState(null);
  const {
    monthsOptions
  } = useIncidentData();
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allIncident, setAllIncident] = useState([]);

  const searchIncidents = async (searchTerm) => {
    try {
      const response = await axios.get(`${config.url}/MapApi/Search/`, {
        params: { search_term: searchTerm },
        headers: {
          Authorization: `Bearer ${sessionStorage.token}`,
          'Content-Type': 'application/json',
        },
      });
      setAllIncident(response.data);
    } catch (error) {
      console.error('Error searching incidents:', error);
      return [];
    }
  };
  
  const handleSearch = async () => {
    const results = await searchIncidents(searchTerm);
    setSearchResults(results);
  };
  const handleSearchResultClick = (incident) => {
    setSearchTerm(incident.title);
    history.push(`/admin/incident?highlight=${incident.id}`);
  };
  const filteredIncident = allIncident.filter(incident=> {
    return incident.title.toLowerCase().includes(searchTerm.toLowerCase())
  })
  
  const handleClick = (notification) => {
    setSelectedNotification(notification);
    onOpen();
  };

  const handleAccept = async () => {
    try {
      // Utilisez selectedNotification pour obtenir l'ID de la collaboration
      const collaborationId = selectedNotification?.colaboration;
      console.log("collllllalllla", collaborationId);
      
      if (!collaborationId) {
        throw new Error("Aucune collaboration sélectionnée.");
      }
      const response = await axios.post(`${config.url}/MapApi/collaborations/accept/`, {
        collaboration_id: collaborationId,
      });
      
      Swal.fire({
        icon: "success",
        title: "Demande de collaboration acceptée",
        text: response.data.message,
      });
      
      setNotifications(notifications.filter((n) => n !== selectedNotification));
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la collaboration", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response?.data?.error || "Erreur lors de l'acceptation de la collaboration",
      });
    }
  };
  const handleDecline = async (collaborationId) => {
    try {
        const url = `${config.url}/MapApi/collaboration/decline/`;
        console.log("URL:", url);
        console.log("Données envoyées:", { collaboration_id: collaborationId });

        const response = await axios.post(
            url,
            {
              collaboration_id: collaborationId
            },
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            }
        );
        Swal.fire("Demande de collaboration declinée");
        setNotifications(
          notifications.filter((n) => n !== selectedNotification)
        );
        onClose();    
      } catch (error) {
        console.error("Error accepting collaboration:", error.response ? error.response.data : error.message);
      }
  };
  
  const fetchNotifications = async () => {
    try {
        const notificationResponse = await axios.get(
            `${config.url}/MapApi/notifications/`,
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Réponse des notifications :", notificationResponse.data);

        const collaborationsResponse = await axios.get(`${config.url}/MapApi/collaboration/`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
        });

        const collaborationsMap = collaborationsResponse.data.reduce((acc, collaboration) => {
          acc[collaboration.id] = {
            motivation: collaboration.motivation, 
            other_option: collaboration.other_option || "",
          };
          return acc;
        }, {});

        const notificationsWithMotivation = notificationResponse.data.map(notification => {
          const collaborationDetails = collaborationsMap[notification.colaboration] || {};
          return {
              ...notification,
              motivation: collaborationDetails.motivation || "Aucune motivation fournie",
              other_option: collaborationDetails.other_option || "Aucune autre option fournie",
          };
        });
      

        console.log("Notifications avec motivations :", notificationsWithMotivation);

        setNotifications(notificationsWithMotivation);
        const unreadCount = notificationsWithMotivation.filter(n => !n.read).length;
        setUnreadNotificationsCount(unreadCount);
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
    }
  };

    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
        window.location.href = "/";
    };

    useEffect(() => {
      const fetchNotificationsData = async () => {
        await fetchNotifications();
      };
      fetchNotificationsData();
      const intervalId = setInterval(fetchNotificationsData, 30000); 
      return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
      const fetchData = async () => {
        await searchIncidents(searchTerm);
      };
      fetchData();
    }, [searchTerm]);
  
// Chakra Color Mode
  let navbarIcon =
    fixed && scrolled
      ? useColorModeValue("gray.700", "gray.200")
      : useColorModeValue("white", "gray.200");
  let menuBg = useColorModeValue("white", "navy.800");
  if (secondary) {
    navbarIcon = "white";
  }

  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems='center'
      flexDirection='row' data-testid="search">
     <SearchBar
        me='18px'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onSearch={handleSearch}
      />
        {searchTerm && (
          <Box
            position="absolute"
            top="60px"  
            bg="white"
            borderRadius="md"
            boxShadow="md"
            width="300px"  
            maxHeight="200px"  
            overflowY="auto"  
            zIndex="10"
          >
            {filteredIncident.length > 0 ? (
              <Stack spacing={2} p={2}>
                {filteredIncident.map((incident) => (
                  <Box 
                    key={incident.id} 
                    mb="2" 
                    p={2} 
                    borderBottom="1px solid #eaeaea" 
                    onClick={() => handleSearchResultClick(incident)} 
                    cursor="pointer"
                  >
                    <Text fontWeight="bold" color="black">{incident.title}</Text>
                    <Text color="gray.600">{incident.description}</Text>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text p={2}>Aucun incident trouvé</Text>
            )}
          </Box>
        )}
      <SidebarResponsive
        hamburgerColor={"white"}
        logo={
          <Stack direction='row' spacing='12px' align='center' justify='center'>
            <NavLink to="/admin/dashboard"> 
              <Box
                as='img'
                src={appLogoLight}
                alt='App Logo'
                w='74px'
                h='27px'
                cursor="pointer"
              />
            </NavLink>
          </Stack>
        }
        colorMode={colorMode}
        secondary={props.secondary}
        routes={routes}
        {...rest}
      />
      
      <Select
          value={filterType}
          onChange={(e) => handleFilterChange(e.target.value)}
          background="white"
        >
          <option value="all">Tous les incidents</option>
          <option value="today">Aujourd'hui</option>
          <option value="yesterday">Hier</option>
          <option value="last_7_days">Les 7 derniers jours</option>
          <option value="last_30_days">Les 30 derniers jours</option>
          <option value="custom_range">Choix personnalisé</option>
        </Select>
        {filterType === 'custom_range' && showDatePicker && customRange.length > 0 && (
          <Flex ml={4} alignItems="center">
            <DateRange
              ranges={customRange}
              onChange={handleDateChange}
              locale={fr}
            />
            <Button ml={4} colorScheme="blue" onClick={applyCustomRange} data-testid="appliquer">
              Appliquer
            </Button>
          </Flex>
        )}

      <Menu>
      <MenuButton>
          <BellIcon color={navbarIcon} w='18px' h='18px' ms="12px" data-testid="notifications-icon"/>
          {unreadNotificationsCount > 0 && (
            <Box
                position="absolute"
                top="20px"
                right="100px"
                backgroundColor="red.500"
                color="white"
                borderRadius="full"
                width="10px"
                height="10px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="smaller"
            >
                {unreadNotificationsCount}
            </Box>
          )}
        </MenuButton>
        <MenuList p="16px 8px" bg={menuBg} maxHeight="300px" overflowY="auto">
          <Flex flexDirection="column">
            {notifications.map((notification, index) => (
              <MenuItem
                borderRadius="8px"
                mb="10px"
                key={index}
                onClick={() => handleClick(notification)}
              >
                <ItemContent
                  time={new Date(notification.created_at).toLocaleString()}
                  info={notification.message || "Pas de message disponible"}
                  boldInfo={notification.read ? "" : " Nouveau "}
                  aName={typeof notification.motivation  ? notification.motivation : "User"}
                  aSrc={notification.avatarSrc || ""}
                />
                
              </MenuItem>
            ))}
          </Flex>
        </MenuList>
      </Menu>
      {selectedNotification && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Notification</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <ItemContent
                time={new Date(selectedNotification.created_at).toLocaleString()}
                info={selectedNotification.message || "Pas de message disponible"}
                boldInfo={selectedNotification.read ? "" : " Nouveau "}
              />
              <Flex flexDirection="column" mt={2}>
                <Text fontSize="sm" color="gray.500" fontWeight="bold">
                  Détails de la collaboration:
                </Text>
                <ul style={{ paddingLeft: "20px", margin: "0" }}>
                    {Array.isArray(selectedNotification.motivation)
                      ? selectedNotification.motivation.map((motivation, index) => (
                          <li key={index}>
                            <Text fontSize="sm" color="gray.500" fontStyle="italic">
                              {motivation}
                            </Text>
                          </li>
                        ))
                      : (selectedNotification.motivation
                          ? selectedNotification.motivation.split(',').map((motivation, index) => (
                              <li key={index}>
                                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                  {motivation.trim()}
                                </Text>
                              </li>
                            ))
                          : <Text fontSize="sm" color="gray.500" fontStyle="italic">
                              Aucune motivation fournie
                            </Text>
                    )}
                  <li>
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                      {selectedNotification.other_option || ""}
                    </Text>
                  </li>
                </ul>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={() => handleAccept(selectedNotification.colaboration)}>
                Accepter
              </Button>
              <Button variant="ghost" onClick={() => handleDecline(selectedNotification.colaboration)}>
                Décliner
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      <Flex me='16px' ms={{ base: "16px", xl: "20px" }} data-testid="logout-icon">
        <IoLogOutOutline
          data-testid="logout-icon-inner"
          color={navbarIcon}
          size={22}
          onClick={handleLogout}
          cursor='pointer'
        />
      </Flex>
      
    </Flex>
  );
}