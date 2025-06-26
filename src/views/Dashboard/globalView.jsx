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
    Spinner,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import { IncidentData } from "Fonctions/Incident_fonction";
import { Player } from "video-react";
import {
    MapContainer,
    TileLayer,
    useMap,
    Popup,
    Marker,
    Circle,
} from "react-leaflet";
import { FaMapMarkerAlt, FaEye } from "react-icons/fa";
import ReactDOMServer from "react-dom/server";
import Select from "react-select";
import L from "leaflet"; // Import Leaflet
export default function GlobalView() {
    const {
        optionstype,
        latitude,
        longitude,
        videoUrl,
        imgUrl,
        audioUrl,
        description,
        position,
        date,
        heure,
        handleNavigate,
        videoIsLoading,
        setVideoIsLoading,
        incident,
        EditIncident,
        handleSelectChange,
        handleChangeStatus,
    } = IncidentData();
    console.log(videoUrl);
    console.log(audioUrl);
    console.log("L'image de l'incident", imgUrl);

    const { colorMode } = useColorMode();
    const textColor = useColorModeValue("gray.700", "white");
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
        <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
            <Grid
                templateColumns={{ sm: "1fr", lg: "2fr 1fr" }}
                templateRows={{ lg: "repeat(2, auto)" }}
                gap="20px"
            >
                <Card
                    bg={
                        colorMode === "dark"
                            ? "navy.800"
                            : "linear-gradient(81.62deg, #313860 2.25%, #151928 79.87%)"
                    }
                    p="0px"
                    maxW={{ sm: "320px", md: "100%" }}
                >
                    <Flex direction="column" mb="40px" p="28px 0px 0px 22px">
                        <Text
                            color="#fff"
                            fontSize="lg"
                            fontWeight="bold"
                            mb="6px"
                        >
                            Carte interactive
                        </Text>
                    </Flex>
                    <Box minH="300px">
                        {latitude !== 0 && longitude !== 0 ? (
                            <Box height="600px" width="100%" p="0 8px 0 8px">
                                <MapContainer
                                    center={position}
                                    zoom={13}
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    <RecenterMap
                                        lat={latitude}
                                        lon={longitude}
                                    />
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker
                                        className="icon-marker"
                                        icon={
                                            incident.etat === "resolved"
                                                ? customMarkerIconBlue
                                                : incident.etat ===
                                                  "taken_into_account"
                                                ? customMarkerIconOrange
                                                : customMarkerIconRed
                                        }
                                        position={position}
                                    >
                                        <Popup>{incident.title}</Popup>
                                        <Circle
                                            center={position}
                                            radius={500}
                                            color="red"
                                        />
                                    </Marker>
                                </MapContainer>
                            </Box>
                        ) : (
                            <Text className="danger" color="red.500">
                                Coordonnees non renseignees
                            </Text>
                        )}
                    </Box>
                </Card>

                <Card p="0px" maxW={{ sm: "320px", md: "100%" }}>
                    <Flex direction="column" mb="40px" p="28px 0px 0px 22px">
                        <Text fontSize="lg" color={textColor} fontWeight="bold">
                            Image de l'incident
                        </Text>
                    </Flex>
                    <Box minH="300px" p="8px">
                        {imgUrl ? (
                            <img src={imgUrl} alt="Incident" />
                        ) : (
                            "No image available"
                        )}
                    </Box>
                    <Flex
                        direction="row"
                        align="center"
                        justifyContent="space-between"
                        p="8px"
                    >
                        <Text
                            color="#ccc"
                            fontWeight="bold"
                            mb="6px"
                            flexGrow={1}
                        >
                            Date : {date}
                        </Text>
                        <Text color="#ccc" fontWeight="bold" mb="6px">
                            Heure : {heure}
                        </Text>
                    </Flex>
                </Card>

                <Card p="0px" maxW={{ sm: "320px", md: "100%" }}>
                    <Flex direction="column">
                        <Box
                            overflow={{ sm: "scroll", lg: "hidden" }}
                            justify="space-between"
                            p="22px"
                        >
                            {videoUrl && !videoUrl.includes("null") && (
                                <Box mb="4" position="relative">
                                    <Heading as="h6" size="xs" mb="2">
                                        Vidéo
                                    </Heading>
                                    <Player
                                        fluid={false}
                                        width={537}
                                        height={400}
                                        onLoadStart={() =>
                                            setVideoIsLoading(true)
                                        }
                                        onLoadedData={() =>
                                            setVideoIsLoading(false)
                                        }
                                        onError={() => setVideoIsLoading(false)}
                                        src={videoUrl}
                                    />
                                    {videoIsLoading && (
                                        <Flex
                                            justify="center"
                                            align="center"
                                            position="absolute"
                                            top="0"
                                            left="0"
                                            right="0"
                                            bottom="0"
                                            bg="rgba(0,0,0,0.5)"
                                        >
                                            <Spinner />
                                        </Flex>
                                    )}
                                </Box>
                            )}

                            {audioUrl && !audioUrl.includes("null") && (
                                <Box mb="4">
                                    <Heading as="h6" size="xs" mb="2">
                                        Note Vocal
                                    </Heading>
                                    <audio controls src={audioUrl}>
                                        Your browser does not support the
                                        <code>audio</code> element.
                                    </audio>
                                </Box>
                            )}

                            <Box mb="4">
                                <Heading as="h6" size="xs" mb="2">
                                    Description
                                </Heading>
                                <Text>{description}</Text>
                            </Box>

                            <Button onClick={handleNavigate} colorScheme="teal">
                                Analyses Avancées
                            </Button>
                        </Box>
                    </Flex>
                </Card>

                <Card p="0px" maxW={{ sm: "320px", md: "100%" }}>
                    <Flex direction="column">
                        <Flex align="center" justify="space-between" p="22px">
                            <Text
                                fontSize="lg"
                                color={textColor}
                                fontWeight="bold"
                            >
                                Actions
                            </Text>
                        </Flex>
                        <Box minH="100px">
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                value={
                                    optionstype.filter(
                                        (option) =>
                                            option.value === EditIncident.etat
                                    )[0]
                                }
                                name="etat"
                                options={optionstype}
                                onChange={handleSelectChange}
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        border: "1px solid #ccc",
                                        borderRadius: "15px",
                                        boxShadow: state.isFocused
                                            ? "0 0 0 1px #2684FF"
                                            : null,
                                        margin: "15px",
                                    }),
                                }}
                            />
                        </Box>
                        <Box p="10px">
                            <Button
                                className="etat"
                                onClick={handleChangeStatus}
                                colorScheme="teal"
                                w="200px"
                            >
                                Valider
                            </Button>
                        </Box>
                    </Flex>
                </Card>
            </Grid>
        </Flex>
    );
}
