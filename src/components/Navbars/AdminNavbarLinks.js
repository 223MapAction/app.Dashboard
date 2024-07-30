// Chakra Icons
import { BellIcon } from "@chakra-ui/icons";
// Chakra Imports
import {
  Box, Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList, Stack, Text, useColorMode,
  useColorModeValue
} from "@chakra-ui/react";
// Assets
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
// Custom Icons
import { ArgonLogoDark, ArgonLogoLight, ChakraLogoDark, ChakraLogoLight, ProfileIcon, SettingsIcon } from "components/Icons/Icons";
import appLogoLight from "../../assets/img/logo.png"; 
// Custom Components
import { ItemContent } from "components/Menu/ItemContent";
import { SearchBar } from "components/Navbars/SearchBar/SearchBar";
import { SidebarResponsive } from "components/Sidebar/Sidebar";
import React, {useEffect, useState} from "react";
import { NavLink } from "react-router-dom";
import routes from "routes.js";

// axios
import axios from "axios";
import { config } from "config";
import { useAuth } from "context/AuthContext";

export default function HeaderLinks(props) {
  const {
    variant,
    children,
    fixed,
    scrolled,
    secondary,
    onOpen,
    ...rest
  } = props;

  const { colorMode } = useColorMode();
  const [notifications, setNotifications] = useState([]);
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${config.url}/MapApi/notifications/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Notifications response:', response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  const {logout} = useAuth();
  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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
      flexDirection='row'>
      <SearchBar me='18px' />
      <SidebarResponsive
        hamburgerColor={"white"}
        logo={
          <Stack direction='row' spacing='12px' align='center' justify='center'>
            <Box
              as='img'
              src={appLogoLight}
              alt='App Logo'
              w='74px'
              h='27px'
            />
          </Stack>
        }
        colorMode={colorMode}
        secondary={props.secondary}
        routes={routes}
        {...rest}
      />
      <SettingsIcon
        cursor='pointer'
        ms={{ base: "16px", xl: "0px" }}
        me='16px'
        onClick={handleLogout}
        color={navbarIcon}
        w='18px'
        h='18px'
      />
      <Menu>
        <MenuButton>
          <BellIcon color={navbarIcon} w='18px' h='18px' />
        </MenuButton>
        <MenuList p="16px 8px" bg={menuBg}>
        <Flex flexDirection="column">
          {notifications.map((notification, index) => (
            <MenuItem borderRadius="8px" mb="10px" key={index}>
              <ItemContent
                time={new Date(notification.created_at).toLocaleString()} 
                info={notification.message || "No message available"} 
                boldInfo={notification.read ? "" : "New "} 
                aName={typeof notification.user === 'string' ? notification.user : "User"}
                aSrc={notification.avatarSrc || avatar1}
              />
            </MenuItem>
          ))}
        </Flex>
      </MenuList>
      </Menu>
    </Flex>
  );
}