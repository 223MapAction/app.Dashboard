// Chakra imports
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
// Assets
import avatar5 from "assets/img/avatars/avatar5.png";
// connexion
import axios from "axios";
import { config } from "config";
// Custom components
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import React, {useState, useEffect} from "react";

function Profile() {
  //declarations
  const [user, setUser] = useState({});
  const { colorMode } = useColorMode();
  const avatar = config.url + user.avatar;
  
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${config.url}/MapApi/user_retrieve/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.token}`,
        },
      });
      console.log("User information", response.data.data);
      setUser(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur :', error.message);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const iconColor = useColorModeValue("blue.500", "white");
  const bgProfile = useColorModeValue("hsla(0,0%,100%,.8)", "navy.800");
  const borderProfileColor = useColorModeValue("white", "transparent");
  const emailColor = useColorModeValue("gray.400", "gray.300");

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px", lg: "100px" }}>
      <Flex
        direction={{ sm: "column", md: "row" }}
        mb='24px'
        maxH='330px'
        justifyContent={{ sm: "center", md: "space-between" }}
        align='center'
        backdropFilter='blur(21px)'
        boxShadow='0px 2px 5.5px rgba(0, 0, 0, 0.02)'
        border='1.5px solid'
        borderColor={borderProfileColor}
        bg={bgProfile}
        p='24px'
        borderRadius='20px'>
        <Flex
          align='center'
          mb={{ sm: "10px", md: "0px" }}
          direction={{ sm: "column", md: "row" }}
          w={{ sm: "100%" }}
          textAlign={{ sm: "center", md: "start" }}>
          <Avatar
            me={{ md: "22px" }}
            // src={avatar5}
            src={avatar}
            w='80px'
            h='80px'
            borderRadius='15px'
          />
          <Flex direction='column' maxWidth='100%' my={{ sm: "14px" }}>
            <Text
              fontSize={{ sm: "lg", lg: "xl" }}
              color={textColor}
              fontWeight='bold'
              ms={{ sm: "8px", md: "0px" }}>
              {/* Alec Thompson */}
              {user.first_name} {user.first_name}
            </Text>
            <Text
              fontSize={{ sm: "sm", md: "md" }}
              color={emailColor}
              fontWeight='semibold'>
              {/* alec@simmmple.com */}
              {user.email}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Card p='16px' my='24px'>
        <CardHeader p='12px 5px' mb='12px'>
          <Flex direction='column'>
            <Text fontSize='lg' color={textColor} fontWeight='bold'>
              Les informations du profil
            </Text>
            <Text fontSize='sm' color='gray.400' fontWeight='400'>
              {/* Architects design houses */}
              {user.organisation}
            </Text>
          </Flex>
        </CardHeader>
        <CardBody px='5px'>
          <Grid
            templateColumns={{ sm: "1fr", md: "1fr 1fr", xl: "repeat(4, 1fr)" }}
            templateRows={{ sm: "1fr 1fr 1fr auto", md: "1fr 1fr", xl: "1fr" }}
            gap='24px'>
            <Flex direction='column'>
              
              <Flex align='center' mb='18px'>
                <Text
                  fontSize='md'
                  color={textColor}
                  fontWeight='bold'
                  me='10px'>
                  Nom et Prénoms:{" "}
                </Text>
                <Text fontSize='md' color='gray.400' fontWeight='400'>
                  {/* Esthera Jackson */}
                  {user.first_name} {user.first_name}
                </Text>
              </Flex>
              <Flex align='center' mb='18px'>
                <Text
                  fontSize='md'
                  color={textColor}
                  fontWeight='bold'
                  me='10px'>
                  Téléphone:{" "}
                </Text>
                <Text fontSize='md' color='gray.400' fontWeight='400'>
                  {user.phone}
                </Text>
              </Flex>
              <Flex align='center' mb='18px'>
                <Text
                  fontSize='md'
                  color={textColor}
                  fontWeight='bold'
                  me='10px'>
                  Email:{" "}
                </Text>
                <Text fontSize='md' color='gray.400' fontWeight='400'>
                  {/* esthera@simmmple.com */}
                  {user.email}
                </Text>
              </Flex>
              <Flex align='center' mb='18px'>
                <Text
                  fontSize='md'
                  color={textColor}
                  fontWeight='bold'
                  me='10px'>
                  Location:{" "}
                </Text>
                <Text fontSize='md' color='gray.400' fontWeight='400'>
                  {user.address}
                </Text>
              </Flex>
            </Flex>
          </Grid>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default Profile;
