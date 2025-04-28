import React, { useState, useEffect } from "react";
import axios from "axios";
import { config } from "../../config";
import Swal from "sweetalert2";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spinner,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useDisclosure,
    useColorModeValue,
} from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

export default function Tables(){
  const [data, setData] = useState([]);
  const [dataReady, setDataReady] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [editUser, setEditUser] = useState(null);
  
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    user_type: "",
    password: "",
    organisation: ""
  });
  const { isOpen: isNewUserModalOpen, onOpen: onNewUserModalOpen, onClose: onNewUserModalClose } = useDisclosure();
  const { isOpen: isEditUserModalOpen, onOpen: onEditUserModalOpen, onClose: onEditUserModalClose } = useDisclosure();
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${config.url}/MapApi/user/?limit=1000`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.token}`,
        },
      });
      let donne = response.data.results.filter(user => user.user_type === "elu")
      console.log(donne)
      setData(donne);
      setDataReady(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur :', error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  const handleFileChange = (e) => {
    setNewUser({ ...newUser, avatar: e.target.files[0] });
  };
  const handleEditUser = (user) => {
    setEditUser(user);  // Remplit les données de l'utilisateur dans l'état
    setNewUser({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      user_type: user.user_type,
      organisation: user.organisation,
      avatar: null,  
    });
    onEditUserModalOpen();  
  };
  
  const addUser = async (e) => {
    e.preventDefault();
    setInProgress(true);

    const formData = new FormData();
    formData.append("first_name", newUser.first_name);
    formData.append("last_name", newUser.last_name);
    formData.append("email", newUser.email);
    formData.append("phone", newUser.phone);
    formData.append("address", newUser.address);
    formData.append("user_type", newUser.user_type);
    formData.append("organisation", newUser.organisation);
    formData.append("password", "mapaction2025");
    if (newUser.avatar) {
      formData.append("avatar", newUser.avatar);
    }
  
    try {
      const response = await axios.post(`${config.url}/MapApi/user/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${sessionStorage.token}`
        },
      });
      console.log("Réponse création:", response.data);

      setData([...data, response.data]);
      setInProgress(false);
      onNewUserModalClose();
      setNewUser({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        user_type: "",
        password: "",
        organisation: "",
        avatar: null,
      });
      console.log("Nouvel utilisateur à créer:", newUser);

      Swal.fire("Succès", "Utilisateur ajouté avec succès", "success");
    } catch (error) {
      setInProgress(false);
      console.error("Erreur création utilisateur:", error);
      if (error.response) {
        console.log("Response status:", error.response.status);
        console.log("Response data:", error.response.data);
      } else {
        console.log("Erreur inconnue:", error.message);
      }
      handleError(error);
    }
  };
  

  const handleError = (error) => {
    if (error.response) {
      Swal.fire("Erreur", "Veuillez réessayer", "error");
      console.log(error.response.status);
      console.log(error.response.data);
    } else if (error.request) {
      Swal.fire("Erreur", "Veuillez réessayer", "error");
      console.log(error.request.data);
    } else {
      Swal.fire("Erreur", "Veuillez réessayer", "error");
      console.log(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSelectChange = (e) => {
    setNewUser({ ...newUser, user_type: e.target.value });
  };
  const onUpdateUser = async (e) => {
    e.preventDefault();
    setInProgress(true);

    const new_data = {
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      user_type: newUser.user_type,
      organisation: newUser.organisation,
      avatar:newUser.avatar,
      password: "mapaction2020",
    };

    const url = `${config.url}/MapApi/user/${newUser.id}/`;

    try {
      const response = await axios.put(url, new_data);
      setData((prevData) =>
        prevData.map((user) => (user.id === newUser.id ? response.data : user))
      );
      setInProgress(false);
      setNewUser({
        id: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        user_type: "",
        password: "",
      });
      Swal.fire("Succès", "Utilisateur mis à jour avec succès", "success");
      fetchUserData();
    } catch (error) {
      setInProgress(false);
      handleError(error);
    }
  };
  const renderNewUserModal = () => (
    <Modal isOpen={isNewUserModalOpen} onClose={onNewUserModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Nouvel Utilisateur</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Prenom</FormLabel>
            <Input name="first_name" value={newUser.first_name} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Nom</FormLabel>
            <Input name="last_name" value={newUser.last_name} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input name="email" value={newUser.email} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Téléphone</FormLabel>
            <Input name="phone" value={newUser.phone} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Adresse</FormLabel>
            <Input name="address" value={newUser.address} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Type Utilisateur</FormLabel>
            <Select name="user_type" value={newUser.user_type} onChange={handleSelectChange} placeholder="Choisissez un type d'utilisateur">
              <option value="elu">Organisation</option>
              {/* <option value="citizen">Utilisateur de l'application mobile</option> */}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Organisation</FormLabel>
            <Input name="organisation" value={newUser.organisation} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Logo de l'organisation</FormLabel>
            <Input type="file" name="avatar" accept="image/*" onChange={handleFileChange} />
          </FormControl>

        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={addUser} isLoading={inProgress}>
            Ajouter
          </Button>
          <Button variant="ghost" onClick={onNewUserModalClose}>
            Annuler
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  const renderEditUserModal = () => (
    <Modal isOpen={isEditUserModalOpen} onClose={onEditUserModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modifier Utilisateur</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Prenom</FormLabel>
            <Input name="first_name" value={newUser.first_name} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Nom</FormLabel>
            <Input name="last_name" value={newUser.last_name} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input name="email" value={newUser.email} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Téléphone</FormLabel>
            <Input name="phone" value={newUser.phone} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Adresse</FormLabel>
            <Input name="address" value={newUser.address} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Type Utilisateur</FormLabel>
            <Select name="user_type" value={newUser.user_type} onChange={handleSelectChange} placeholder="Choisissez un type d'utilisateur">
              <option value="elu">Organisation</option>
              <option value="citizen">Utilisateur de l'application mobile</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Organisation</FormLabel>
            <Input name="organisation" value={newUser.organisation} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Logo de l'organisation</FormLabel>
            <Input type="file" name="avatar" accept="image/*" onChange={handleFileChange} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onUpdateUser} isLoading={inProgress}>
            Modifier
          </Button>
          <Button variant="ghost" onClick={onEditUserModalClose}>
            Annuler
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
  const onDeleteUser = (item) => {
    Swal.fire({
      title: "Etes-vous sûr?",
      text: "La suppression est définitive",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Non, annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${config.url}/MapApi/user/${item.id}/`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.token}`,
          },
        }).then(() => {
          Swal.fire("Supprimé!", "L'utilisateur a été supprimé.", "success");
          fetchUserData();
        }).catch((error) => {
          handleError(error);
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("Annulé", "La suppression a été annulée", "error");
      }
    });
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
            <CardHeader p="6px 0px 22px 0px">
            <Button onClick={onNewUserModalOpen}>
                Nouvel utilisateur
            </Button>
            </CardHeader>
            <CardBody>
                {dataReady ? (
                <Table variant="simple" color={textColor}>
                    <Thead>
                    <Tr>
                        <Th borderColor={borderColor}>Prenom</Th>
                        <Th borderColor={borderColor}>Nom</Th>
                        <Th borderColor={borderColor}>Email</Th>
                        <Th borderColor={borderColor}>Téléphone</Th>
                        <Th borderColor={borderColor}>Organisation</Th>
                        <Th borderColor={borderColor}>Actions</Th>
                    </Tr>
                    </Thead>
                    <Tbody>
                    {data.map((item) => (
                        <Tr key={item.id}>
                        <Td borderColor={borderColor} color="gray.400">{item.first_name}</Td>
                        <Td borderColor={borderColor} color="gray.400">{item.last_name}</Td>
                        <Td borderColor={borderColor} color="gray.400">{item.email}</Td>
                        <Td borderColor={borderColor} color="gray.400">{item.phone}</Td>
                        <Td borderColor={borderColor} color="gray.400">{item.organisation}</Td>
                        <Td borderColor={borderColor} >
                            <Button size="sm" onClick={() => handleEditUser(item)} data-testid='edit'>
                                <FaEdit />
                            </Button>
                            <Button size="sm"  ml="2" onClick={() => onDeleteUser(item)}>
                                <FaTrash />
                            </Button>
                        </Td>
                        </Tr>
                    ))}
                    </Tbody>
                </Table>
                ) : (
                  <Spinner size="xl" />
                )}
            </CardBody>
      </Card>
      {renderNewUserModal()}
      {renderEditUserModal()}
    </Flex>
  );
}  
