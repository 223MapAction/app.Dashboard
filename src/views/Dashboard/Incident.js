import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { config } from '../../config';
import { useHistory } from "react-router-dom";
import Swal from 'sweetalert2';
import { FaEye, FaTrash } from 'react-icons/fa';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';

const Incident = () => {
  const navigate = useHistory();
  const [dataReady, setDataReady] = useState(false);
  const [data, setData] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: "",
    zone: "",
    description: "",
    photo: "",
    video: "",
    audio: "",
    latitude: "",
    longitude: "",
    user_id: "",
    indicateur_id: "",
    category_ids: [],
    etat: "",
  });
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const fetchIncidents = async () => {
    const url = `${config.url}/MapApi/incident/`;
    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${sessionStorage.token}`,
          "Content-Type": "application/json",
        },
      });
      setData(res.data.results);
      setDataReady(true);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const deleteIncident = async (incidentId) => {
    setInProgress(true);
    const url = `${config.url}/MapApi/incident/${incidentId}`;
    try {
      await axios.delete(url);
      setInProgress(false);
      Swal.fire("Succès", "Incident supprimé", "success");
      fetchIncidents();
    } catch (error) {
      setInProgress(false);
      Swal.fire("Erreur", "Veuillez réessayer", "error");
      console.log(error.message);
    }
  };

  const onShowIncident = (id) => {
    const item = getIncidentById(id);
    navigate.push(`/admin/incident_view/${id}`, { state: { incident: item } });
  };

  const getIncidentById = (id) => {
    return data.find((incident) => incident.id === id);
  };

  const formatDate = (date) => {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [day, month, year].join("-");
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
        <CardHeader p="6px 0px 22px 0px">
          <Text fontSize="xl" color={textColor} fontWeight="bold">
            La Table des Incidents
          </Text>
        </CardHeader>

        <CardBody>
        {dataReady ? (
          <Table variant="simple" color={textColor}>
            <Thead>
              <Tr>
                <Th borderColor={borderColor}>Titre</Th>
                <Th borderColor={borderColor}>Zone</Th>
                <Th borderColor={borderColor}>Description</Th>
                <Th borderColor={borderColor}>Utilisateur</Th>
                <Th borderColor={borderColor}>Etat</Th>
                <Th borderColor={borderColor}>Date Création</Th>
                <Th borderColor={borderColor}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item) => {
                let userName = item.user_id ? `${item.user_id.first_name} ${item.user_id.last_name}` : "indefini";
                return (
                  <Tr key={item.id}>
                    <Td borderColor={borderColor} color="gray.400">{item.title}</Td>
                    <Td borderColor={borderColor} color="gray.400">{item.zone}</Td>
                    <Td borderColor={borderColor} color="gray.400">{item.description}</Td>
                    <Td borderColor={borderColor} color="gray.400">{userName}</Td>
                    <Td borderColor={borderColor} color="gray.400">{item.etat}</Td>
                    <Td borderColor={borderColor} color="gray.400">{formatDate(item.created_at)}</Td>
                    <Td borderColor={borderColor}>
                      <Button
                        size="sm"
                        onClick={() => onShowIncident(item.id)}
                        colorScheme="blue"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        ml="2"
                        onClick={() => deleteIncident(item.id)}
                        isLoading={inProgress}
                      >
                        <FaTrash />
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        ) : (
          <Spinner size="xl" />
        )}
        </CardBody>
      </Card>
        
    </Flex>
  );
};

export default Incident;
