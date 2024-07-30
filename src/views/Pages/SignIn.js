import React, { useState } from "react";
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import axios from "axios";
import signInImage from "assets/img/signInImage.png";
import { config } from "../../config";
import { useAuth } from 'context/AuthContext';
import Swal from "sweetalert2";

function SignIn() {
  const {login} = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const bgForm = useColorModeValue("white", "navy.800");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const user = { email, password };

    try {
      // Authentification
      const authResponse = await axios.post(config.url + "/MapApi/login/", user);
      sessionStorage.setItem("token", authResponse.data.access);

      // Récupération des informations de l'utilisateur
      const userResponse = await axios.get(config.url + "/MapApi/user_retrieve/", {
        headers: { Authorization: `Bearer ${authResponse.data.access}` },
      });

      const userData = userResponse.data.data;
      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("user_id", userData.id);
      sessionStorage.setItem("first_name", userData.first_name);
      sessionStorage.setItem("zone", userData.adress);
      sessionStorage.setItem("user_type", userData.user_type);
      login();
      // Redirection basée sur le type d'utilisateur
      if (userData.user_type === "admin") {
        window.location.href = "/dashboardAdmin";
      } else if (userData.user_type === "elu") {
        if (userData.password_reset_count === "0") {
          setChangepwd(true);
        } else {
          window.location.href = "/admin/elu-dashboard";
        }
      } else {
        Swal.fire(
          "Attention",
          "Vous ne pouvez pas accéder au dashboard, veuillez contacter l'administrateur",
          "warning"
        );
      }
    } catch (err) {
      setError("Login ou mot de passe incorrect! Veuillez réessayer.");
      console.error(err);
      Swal.fire(
        "Erreur",
        "Login ou mot de passe incorrect! Veuillez réessayer",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Flex position='relative' mb='40px'>
      <Flex
        minH={{ md: "1000px" }}
        h={{ sm: "initial", md: "75vh", lg: "85vh" }}
        w='100%'
        maxW='1044px'
        mx='auto'
        justifyContent='space-between'
        mb='30px'
        pt={{ md: "0px" }}>
        <Flex
          w='100%'
          h='100%'
          alignItems='center'
          justifyContent='center'
          mb='60px'
          mt={{ base: "50px", md: "20px" }}>
          <Flex
            zIndex='2'
            direction='column'
            w='445px'
            background='transparent'
            borderRadius='15px'
            p='40px'
            mx={{ base: "100px" }}
            m={{ base: "20px", md: "auto" }}
            bg={bgForm}
            boxShadow={useColorModeValue(
              "0px 5px 14px rgba(0, 0, 0, 0.05)",
              "unset"
            )}>
            <Text
              fontSize='xl'
              color={textColor}
              fontWeight='bold'
              textAlign='center'
              mb='22px'>
              S'authentifier
            </Text>
            {error && (
              <Alert status='error' mb='24px'>
                <AlertIcon />
                {error}
              </Alert>
            )}
            <FormControl>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Email
              </FormLabel>
              <Input
                variant='auth'
                fontSize='sm'
                ms='4px'
                type='text'
                placeholder='Votre email'
                mb='24px'
                size='lg'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Mot de passe
              </FormLabel>
              <Input
                variant='auth'
                fontSize='sm'
                ms='4px'
                type='password'
                placeholder='Votre mot de passe'
                mb='24px'
                size='lg'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                fontSize='10px'
                variant='dark'
                fontWeight='bold'
                w='100%'
                h='45'
                mb='24px'
                isLoading={isLoading}
                loadingText='Chargement'
                onClick={handleSubmit}>
                Se connecter
              </Button>
            </FormControl>
          </Flex>
        </Flex>
        <Box
          overflowX='hidden'
          h='100%'
          w='100%'
          left='0px'
          position='absolute'
          bgImage={signInImage}>
          <Box
            w='100%'
            h='100%'
            bgSize='cover'
            bg='blue.500'
            opacity='0.8'></Box>
        </Box>
      </Flex>
    </Flex>
  );
}

export default SignIn;
