// Analyze.jsx

import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Button,
    Flex,
    Grid,
    Text,
    Heading,
    Spinner,
    useColorModeValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Image,
    useDisclosure,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import { IncidentData } from "Fonctions/Incident_fonction";
import {
    MapContainer,
    TileLayer,
    Popup,
    Marker,
    Circle,
    useMap,
} from "react-leaflet";
import { FaMapMarkerAlt } from "react-icons/fa";
import ReactDOMServer from "react-dom/server";
import L from "leaflet"; // Import Leaflet
import { useParams } from "react-router-dom"; // Import useParams to get incidentId
import "./Chat.css";
import QuotesCarousel from "./QuotesCarousel"; // Import QuotesCarousel from the same directory
import ReactMarkdown from "react-markdown"; // Add this import
import { config } from "config";
import Slider from "react-slick"; // Import react-slick for carousel
import "slick-carousel/slick/slick.css"; // Import slick carousel styles
import "slick-carousel/slick/slick-theme.css"; // Import slick carousel theme

export default function Analyze() {
    const { incidentId } = useParams(); // Get incidentId from the URL parameters
    const {
        latitude,
        longitude,
        imgUrl,
        date,
        heure,
        incident,
        handleNavigateLLM,
        context,
        piste_solution,
        impact_potentiel,
        type_incident,
        zone,
        sendPrediction,
    } = IncidentData();
    const textColor = useColorModeValue("gray.700", "white");

    const [expanded, setExpanded] = useState(false);
    const [prediction, setPrediction] = useState(null); // State to store the prediction
    const [isLoadingContext, setIsLoadingContext] = useState(true); // State to track context loading
    const [predictionError, setPredictionError] = useState(null); // State to track prediction errors
    const predictionSentRef = useRef(false); // Ref to track if prediction has been sent
    const refreshTimerRef = useRef(null); // Ref to store the refresh timer

    const { isOpen, onOpen, onClose } = useDisclosure();

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    // Function to handle page refresh
    const refreshPage = () => {
        console.log("Auto-refreshing page to check for prediction data...");
        window.location.reload();
    };

    // Function to fetch predictions by incident ID
    const fetchPredictionsByIncidentId = async (incidentId) => {
        try {
            const response = await fetch(
                `${config.url}/MapApi/Incidentprediction/${incidentId}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch predictions");
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json(); // Parse the JSON response
                return data; // Return the prediction data
            } else {
                throw new Error("Received non-JSON response");
            }
        } catch (error) {
            console.error("Error fetching predictions:", error);
            return null; // Return null if there is an error
        }
    };

    // Add this function to determine if we should show the report
    const shouldShowReport = () => {
        return type_incident !== "Aucun problème environnemental";
    };

    // Modify the useEffect for fetching predictions
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Only fetch prediction if we should show the report
                if (shouldShowReport()) {
                    const existingPrediction = await fetchPredictionsByIncidentId(
                        incidentId
                    );

                    console.log("Existing prediction:", existingPrediction);

                    const predictionExists =
                        (Array.isArray(existingPrediction) &&
                            existingPrediction.length > 0) ||
                        (typeof existingPrediction === "object" &&
                            existingPrediction !== null &&
                            Object.keys(existingPrediction).length > 0);

                    if (predictionExists) {
                        const validPrediction = Array.isArray(
                            existingPrediction
                        )
                            ? existingPrediction[0]
                            : existingPrediction;
                        setPrediction(validPrediction);
                        setPredictionError(null); // Clear any previous errors

                        // Clear any pending refresh timer
                        if (refreshTimerRef.current) {
                            clearTimeout(refreshTimerRef.current);
                            refreshTimerRef.current = null;
                        }
                    } else if (
                        imgUrl &&
                        !predictionSentRef.current &&
                        incidentId
                    ) {
                        // Only try to send prediction once and only if we have both an image URL and an incident ID
                        try {
                            await sendPrediction();
                            predictionSentRef.current = true;

                            // Set a refresh timer to check for new prediction data after 30 seconds
                            refreshTimerRef.current = setTimeout(
                                refreshPage,
                                30000
                            );
                        } catch (error) {
                            console.error("Failed to send prediction:", error);
                            // Set error state with meaningful message
                            setPredictionError(
                                "Échec de l'envoi de la prédiction. Problème de connexion au serveur d'analyse."
                            );
                            // Mark as sent even on error to prevent retries
                            predictionSentRef.current = true;
                        }
                    } else if (
                        Array.isArray(existingPrediction) &&
                        existingPrediction.length === 0
                    ) {
                        // If the API returned an empty array and we're not in the process of sending a prediction,
                        // set a refresh timer to check again after 30 seconds
                        if (
                            !refreshTimerRef.current &&
                            !predictionSentRef.current
                        ) {
                            console.log(
                                "No predictions found, setting refresh timer..."
                            );
                            refreshTimerRef.current = setTimeout(
                                refreshPage,
                                30000
                            );
                        }
                    }
                }
                setIsLoadingContext(false);
            } catch (error) {
                console.error("Error fetching or sending prediction:", error);
                setPredictionError(
                    "Erreur lors de la récupération des données d'analyse."
                );
                setIsLoadingContext(false);
                // Mark as sent on error to prevent infinite retries
                predictionSentRef.current = true;
            }
        };

        // Only run fetchData if predictionSentRef is false
        if (!predictionSentRef.current) {
            fetchData();
        }

        // Cleanup function to clear timer on unmount
        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
            }
        };
    }, [incident, incidentId, imgUrl]);

    // Modified console logging to avoid repetitive messages
    useEffect(() => {
        if (prediction) {
            if (prediction.ndvi_heatmap) {
                console.log("NDVI Heatmap URL:", prediction.ndvi_heatmap);
            } else {
                // Log only once
                console.log(
                    "Prediction found but ndvi_heatmap is not available."
                );
            }
        }
        // No else case to avoid repetitive logs
    }, [prediction]);

    // Create a custom marker icon based on the incident state
    const iconHTML = ReactDOMServer.renderToString(
        <FaMapMarkerAlt
            color={
                incident.etat === "resolved"
                    ? "blue"
                    : incident.etat === "taken_into_account"
                    ? "orange"
                    : "red"
            }
            size={20}
        />
    );

    const customMarkerIcon = new L.DivIcon({ html: iconHTML });

    // Component to recenter the map when latitude or longitude changes
    function RecenterMap({ lat, lon }) {
        const map = useMap();
        useEffect(() => {
            if (lat && lon) {
                map.setView([lat, lon], 13);
            }
        }, [lat, lon, map]);
        return null;
    }

    const MarkdownComponents = {
        h1: (props) => <Heading as="h1" size="xl" my={4} {...props} />,
        h2: (props) => <Heading as="h2" size="lg" my={4} {...props} />,
        h3: (props) => <Heading as="h3" size="md" my={3} {...props} />,
        p: (props) => <Text my={2} {...props} />,
        // Add more custom components as needed
    };

    // Settings for the carousel
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
            <Grid
                templateColumns={{ sm: "1fr", lg: "2fr 1fr" }}
                templateRows={{ lg: "repeat(2, auto)" }}
                gap="20px"
            >
                {/* Card for the Incident Report */}
                <Card p="0px" maxW={{ sm: "320px", md: "100%" }}>
                    <Flex direction="column">
                        <Box
                            overflow={{ sm: "scroll", lg: "hidden" }}
                            justify="space-between"
                            p="22px"
                        >
                            {isLoadingContext ? (
                                <Box textAlign="center">
                                    <Heading size="md" mb="4">
                                        L'analyse est en cours et le rapport
                                        sera fourni dans quelques instants...
                                    </Heading>
                                    <Flex
                                        justify="center"
                                        align="center"
                                        mb="4"
                                    >
                                        <Spinner
                                            data-testid="loading-indicator"
                                            size="lg"
                                        />
                                    </Flex>
                                    <QuotesCarousel />
                                </Box>
                            ) : type_incident ===
                              "Aucun problème environnemental" ? (
                                <Box mb="4" minH="200px">
                                    <Heading as="h6" size="md" mb="4">
                                        Rapport d'Analyse
                                    </Heading>
                                    <Text mb="4" fontWeight="bold">
                                        Notre modèle a analysé l'image de
                                        l'incident mais n'a détecté aucun
                                        problème environnemental. Par
                                        conséquent, aucun rapport détaillé n'a
                                        été généré.
                                    </Text>
                                    <Text
                                        mb="4"
                                        fontWeight="bold"
                                        color="gray.600"
                                    >
                                        Note: Notre modèle utilise
                                        l'intelligence artificielle et peut donc
                                        ne pas être parfait. Si vous pensez
                                        qu'il s'est trompé, vous pouvez toujours
                                        poursuivre l'analyse de l'incident via
                                        MapChat.
                                    </Text>
                                    <Flex gap="4">
                                        <Button
                                            onClick={handleNavigateLLM}
                                            colorScheme="teal"
                                        >
                                            MapChat
                                        </Button>
                                    </Flex>
                                </Box>
                            ) : (
                                // Existing report display code
                                <Box mb="4" minH="200px">
                                    <Heading as="h6" size="md" mb="4">
                                        Rapport d'Analyse
                                    </Heading>
                                    <Text>
                                        <strong>Zone:</strong>{" "}
                                        {zone || "Zone non renseignée"}
                                    </Text>
                                    <Text>
                                        <strong>Coordonnées:</strong> {latitude}
                                        , {longitude}
                                    </Text>
                                    <Text>
                                        <strong>Type d'incident:</strong>{" "}
                                        {type_incident}
                                    </Text>
                                    <Text mt="2">
                                        {predictionError ? (
                                            <Box
                                                p={4}
                                                bg="red.50"
                                                color="red.600"
                                                borderRadius="md"
                                            >
                                                <Heading size="sm" mb={2}>
                                                    Erreur d'analyse
                                                </Heading>
                                                <Text>{predictionError}</Text>
                                                <Text mt={2}>
                                                    Veuillez réessayer plus tard
                                                    ou contacter le support
                                                    technique.
                                                </Text>
                                            </Box>
                                        ) : expanded ? (
                                            <>
                                                <ReactMarkdown
                                                    components={
                                                        MarkdownComponents
                                                    }
                                                >
                                                    {prediction?.analysis ||
                                                        "Analyse non disponible"}
                                                </ReactMarkdown>
                                                <ReactMarkdown
                                                    components={
                                                        MarkdownComponents
                                                    }
                                                >
                                                    {prediction?.piste_solution ||
                                                        "Non disponible"}
                                                </ReactMarkdown>
                                            </>
                                        ) : (
                                            // Show a snippet of the context with an option to expand
                                            <ReactMarkdown
                                                components={MarkdownComponents}
                                            >
                                                {`${
                                                    prediction?.analysis
                                                        ? prediction?.analysis.substring(
                                                              0,
                                                              310
                                                          )
                                                        : "Analyse en cours ou non disponible. Si cette situation persiste, veuillez réessayer plus tard ou contacter le support."
                                                }${
                                                    prediction?.analysis
                                                        ? "..."
                                                        : ""
                                                }`}
                                            </ReactMarkdown>
                                        )}
                                        {prediction?.analysis &&
                                            prediction.analysis.length >
                                                300 && (
                                                <Button
                                                    onClick={toggleExpanded}
                                                    variant="link"
                                                    mt="2"
                                                >
                                                    {expanded
                                                        ? "Voir moins"
                                                        : "Voir plus"}
                                                </Button>
                                            )}
                                    </Text>
                                    <br />
                                    <Flex gap="4">
                                        <Button
                                            onClick={handleNavigateLLM}
                                            colorScheme="teal"
                                        >
                                            MapChat
                                        </Button>
                                        <Button
                                            onClick={onOpen}
                                            colorScheme="teal"
                                        >
                                            Visualiser
                                        </Button>
                                    </Flex>
                                    <Modal isOpen={isOpen} onClose={onClose}>
                                        <ModalOverlay />
                                        <ModalContent maxW="80vw" maxH="80vh">
                                            <ModalHeader>
                                                Graphiques
                                            </ModalHeader>
                                            <ModalCloseButton />
                                            <ModalBody>
                                                <Slider {...sliderSettings}>
                                                    <div>
                                                        <Image
                                                            src={
                                                                prediction?.ndvi_heatmap
                                                            }
                                                            alt="NDVI Heatmap"
                                                            mb={4}
                                                            maxW="100%"
                                                            maxH="60vh"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Image
                                                            src={
                                                                prediction?.ndvi_ndwi_plot
                                                            }
                                                            alt="NDVI NDWI Plot"
                                                            mb={4}
                                                            maxW="100%"
                                                            maxH="60vh"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Image
                                                            src={
                                                                prediction?.landcover_plot
                                                            }
                                                            alt="Landcover Plot"
                                                            maxW="100%"
                                                            maxH="60vh"
                                                        />
                                                    </div>
                                                </Slider>
                                            </ModalBody>
                                            <ModalFooter>
                                                <Button
                                                    colorScheme="blue"
                                                    mr={3}
                                                    onClick={onClose}
                                                >
                                                    Fermer
                                                </Button>
                                            </ModalFooter>
                                        </ModalContent>
                                    </Modal>
                                </Box>
                            )}
                        </Box>
                    </Flex>
                </Card>

                {/* Card for Interactive Map */}
                <Card p="0px" maxW={{ sm: "320px", md: "100%" }}>
                    <Flex direction="column" mb="40px" p="28px 0px 0px 22px">
                        <Text
                            color={textColor}
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
                                    center={[latitude, longitude]}
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
                                        position={[latitude, longitude]}
                                        icon={customMarkerIcon}
                                    >
                                        <Popup>{incident.title}</Popup>
                                        <Circle
                                            center={[latitude, longitude]}
                                            radius={500}
                                            color="red"
                                        />
                                    </Marker>
                                </MapContainer>
                            </Box>
                        ) : (
                            <Text color="red.500">
                                Coordonnées non renseignées
                            </Text>
                        )}
                    </Box>
                </Card>

                {/* Card for Incident Image */}
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
                        <Text color="#ccc" fontWeight="bold" flexGrow={1}>
                            Date : {date}
                        </Text>
                        <Text color="#ccc" fontWeight="bold">
                            Heure : {heure}
                        </Text>
                    </Flex>
                </Card>
            </Grid>
        </Flex>
    );
}
