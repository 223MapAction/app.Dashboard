import React, { useState, useEffect, useCallback } from "react";
import { config } from "config";
import { useParams, useHistory, useLocation } from "react-router-dom";
import "video-react/dist/video-react.css";
import axios from "axios";
import Swal from "sweetalert2";

export const IncidentData = () => {
    const { incidentId, userId } = useParams();
    const navigate = useHistory();
    const location = useLocation();
    const pictUrl = location.state ? location.state.pictUrl : "";

    const [user, setUser] = useState({});
    const [incident, setIncident] = useState({});
    const [prediction, setPredictions] = useState([]);
    const [videoIsLoading, setVideoIsLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [isChanged, setisChanged] = useState(false);
    const [inProgress, setProgress] = useState(false);
    const [changeState, setState] = useState(false);
    const [EditIncident, setEditIncident] = useState({
        title: "",
        zone: "",
        description: "",
        latitude: "",
        longitude: "",
        user_id: "",
        etat: "",
        indicateur_id: "",
        category_ids: [],
    });

    const optionstype = [
        // { label: "En attente", value: "declared" },
        { label: "Prendre en compte", value: "taken_into_account" },
        { label: "Résolu", value: "resolved" },
    ];

    const imgUrl =
        incident && incident.photo && incident.photo !== "null"
            ? `${config.url}${incident.photo}`
            : "";
    const audioUrl =
        incident && incident.audio && incident.audio !== "null"
            ? `${config.url}${incident.audio}`
            : "";
    const videoUrl =
        incident && incident.video && incident.video !== "null"
            ? `${config.url}${incident.video}`
            : "";

    const latitude = incident?.lattitude || 0;
    const longitude = incident?.longitude || 0;
    const zone = incident?.zone || "";
    const description = incident ? incident.description : "";
    const position = [latitude, longitude];
    const dataTostring = incident ? incident.created_at : "";
    const dateObject = new Date(dataTostring);
    const date = dateObject.toLocaleDateString();
    const heure = dateObject.toLocaleTimeString();

    // Pour l'analyse des prédictions
    const piste_solution = prediction ? prediction.piste_solution : "";
    const analysis = prediction ? prediction.analysis : "";
    const ndvi_heatmap = prediction ? prediction.ndvi_heatmap : "";
    const ndvi_ndwi_plot = prediction ? prediction.ndvi_ndwi_plot : "";
    const landcover_plot = prediction ? prediction.landcover_plot : "";
    const type_incident = prediction ? prediction.incident_type : "";

    // Récupérer les données utilisateur
    const fetchUserData = async () => {
        try {
            const response = await axios.get(
                `${config.url}/MapApi/user_retrieve/`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            console.log("User information", response.data.data);
            setUser(response.data.data);
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des informations utilisateur :",
                error.message
            );
        }
    };

    useEffect(() => {
        fetchUserData();
        const fetchIncident = async () => {
            try {
                const response = await axios.get(
                    `${config.url}/MapApi/incident/${incidentId}`
                );
                console.log("Incident response", response);
                setIncident(response.data);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des détails de l'incident :",
                    error
                );
            }
        };
        const fetchPredictionsEffect = async () => {
            try {
                const response = await axios.get(
                    `${config.url}/MapApi/Incidentprediction/${incidentId}`
                );
                console.log("Prédictions response", response);
                // Gérer les deux formats de réponse possibles :
                if (
                    response.data &&
                    Array.isArray(response.data) &&
                    response.data.length > 0
                ) {
                    setPredictions(response.data[0]);
                } else if (
                    response.data &&
                    response.data.data &&
                    Array.isArray(response.data.data) &&
                    response.data.data.length > 0
                ) {
                    setPredictions(response.data.data[0]);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des prédictions :",
                    error
                );
            }
        };
        if (incidentId) {
            fetchIncident();
            fetchPredictionsEffect();
        }
    }, [incidentId]);

    // Fonction exportable pour rafraîchir manuellement les prédictions
    const fetchPredictions = async () => {
        try {
            const response = await axios.get(
                `${config.url}/MapApi/Incidentprediction/${incidentId}`
            );
            console.log("Prédictions (manuelles)", response.data);
            if (
                response.data &&
                Array.isArray(response.data) &&
                response.data.length > 0
            ) {
                setPredictions(response.data[0]);
            } else if (
                response.data &&
                response.data.data &&
                Array.isArray(response.data.data) &&
                response.data.data.length > 0
            ) {
                setPredictions(response.data.data[0]);
            }
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des prédictions :",
                error
            );
        }
    };

    // Changement du type d'incident (appelé lors du changement de sélection)
    const handleSelectChange = async (selectedOption) => {
        console.log("Nouveau type sélectionné :", selectedOption.value);
        setEditIncident({ ...EditIncident, etat: selectedOption.value });
        try {
            await axios.post(
                `${config.url}/MapApi/changeIncidentType/${incidentId}`,
                { etat: selectedOption.value },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
        } catch (error) {
            console.error(
                "Erreur lors du changement de type d'incident :",
                error
            );
        }
    };

    // Changement de statut de l'incident
    const handleChangeStatus = async (e) => {
        e.preventDefault();
        setState(true);
        setProgress(true);

        const action = EditIncident.etat;
        const url = config.url + "/MapApi/hadleIncident/" + incidentId;
        const token = sessionStorage.getItem("token");

        if (!token) {
            Swal.fire("Token not found. Please log in.");
            setState(false);
            setisChanged(false);
            setProgress(false);
            return;
        }

        try {
            const response = await axios.post(
                url,
                { action },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Réponse changement de statut", response);
            setState(false);
            setisChanged(false);
            setEditIncident({
                title: "",
                zone: "",
                description: "",
                latitude: "",
                longitude: "",
                user_id: "",
                etat: "",
                indicateur_id: "",
                category_ids: [],
            });
            Swal.fire("Changement de status effectué avec succès");
        } catch (error) {
            if (
                error.response &&
                error.response.data.code === "token_not_valid"
            ) {
                try {
                    const refreshToken = localStorage.getItem("refresh_token");
                    const refreshResponse = await axios.post(
                        config.url + "/api/token/refresh/",
                        { refresh: refreshToken }
                    );
                    localStorage.setItem("token", refreshResponse.data.access);
                    const retryResponse = await axios.post(
                        url,
                        { action },
                        {
                            headers: {
                                Authorization: `Bearer ${refreshResponse.data.access}`,
                            },
                        }
                    );
                    console.log(
                        "Réponse après rafraîchissement",
                        retryResponse
                    );
                    setState(false);
                    setisChanged(false);
                    setEditIncident({
                        title: "",
                        zone: "",
                        description: "",
                        latitude: "",
                        longitude: "",
                        user_id: "",
                        etat: "",
                        indicateur_id: "",
                        category_ids: [],
                    });
                    Swal.fire("Changement de status effectué avec succès");
                } catch (refreshError) {
                    console.log(
                        "Erreur lors du rafraîchissement du token",
                        refreshError
                    );
                    // Ici, on renvoie le message attendu par le test pour un token expiré
                    Swal.fire("Session expired. Please log in again.");
                    sessionStorage.removeItem("token");
                }
            } else {
                setState(false);
                setisChanged(false);
                if (error.response) {
                    console.log(error.response.status);
                    console.log(error.response.data);
                    Swal.fire(
                        "Désolé",
                        "Cet incident est déjà pris en compte."
                    );
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log(error.message);
                }
            }
        } finally {
            setProgress(false);
        }
    };

    // Navigation vers d'autres pages
    const handleNavigate = async () => {
        const userIdLocal = user.id;
        navigate.push(`/admin/analyze/${incident.id}/${userIdLocal}`);
    };
    const handleNavigateLLM = async () => {
        navigate.push(`/admin/llm_chat/${incident.id}/${userId}`);
    };

    // Récupérer les structures sensibles à proximité via Overpass
    const fetchNearbySensitiveStructures = useCallback(
        async (latitude, longitude) => {
            try {
                const radius = 250;
                const overpassUrl = "https://overpass-api.de/api/interpreter";
                const overpassQuery = `
        [out:json];
        (
          // Infrastructures urbaines et autres
          way["highway"](around:${radius},${latitude},${longitude});
          node["amenity"~"hospital|school|public_building"](around:${radius},${latitude},${longitude});
          way["amenity"~"hospital|school|public_building"](around:${radius},${latitude},${longitude});
          node["man_made"~"sewer|drain"](around:${radius},${latitude},${longitude});
          way["man_made"~"sewer|drain"](around:${radius},${latitude},${longitude});
  
          // Ressources naturelles et écologiques
          way["waterway"~"river|stream|canal|drain|ditch"](around:${radius},${latitude},${longitude});
          node["natural"="water"](around:${radius},${latitude},${longitude});
          way["natural"="water"](around:${radius},${latitude},${longitude});
          node["natural"="wetland"](around:${radius},${latitude},${longitude});
          way["natural"="wetland"](around:${radius},${latitude},${longitude});
          way["waterway"="riverbank"](around:${radius},${latitude},${longitude});
          node["landuse"~"reservoir|basin"](around:${radius},${latitude},${longitude});
          way["landuse"~"reservoir|basin"](around:${radius},${latitude},${longitude});
          node["man_made"="reservoir_covered"](around:${radius},${latitude},${longitude});
          way["man_made"="reservoir_covered"](around:${radius},${latitude},${longitude});
          way["landuse"~"forest|park"](around:${radius},${latitude},${longitude});
          node["leisure"="park"](around:${radius},${latitude},${longitude});
          way["leisure"="park"](around:${radius},${latitude},${longitude});
  
          // Zones résidentielles et population
          way["landuse"="residential"](around:${radius},${latitude},${longitude});
          node["building"="residential"](around:${radius},${latitude},${longitude});
          way["building"="residential"](around:${radius},${latitude},${longitude});
          node["amenity"="marketplace"](around:${radius},${latitude},${longitude});
          way["amenity"="marketplace"](around:${radius},${latitude},${longitude});
  
          // Zones agricoles et de production
          way["landuse"~"farmland|orchard"](around:${radius},${latitude},${longitude});
  
          // Zones sensibles et réserves naturelles
          relation["boundary"="protected_area"](around:${radius},${latitude},${longitude});
  
          // Structures économiques et commerciales
          way["landuse"~"industrial|commercial"](around:${radius},${latitude},${longitude});
  
          // Gestion des déchets
          node["amenity"~"waste_disposal|recycling"](around:${radius},${latitude},${longitude});
          way["amenity"~"waste_disposal|recycling"](around:${radius},${latitude},${longitude});
  
          // Points d'accès à l'eau et infrastructures WASH
          node["amenity"="drinking_water"](around:${radius},${latitude},${longitude});
          node["man_made"~"water_well|wastewater_plant"](around:${radius},${latitude},${longitude});
          way["man_made"~"water_well|wastewater_plant"](around:${radius},${latitude},${longitude});
  
          // Infrastructures énergétiques
          node["power"~"plant|substation"](around:${radius},${latitude},${longitude});
          way["power"~"plant|substation|line"](around:${radius},${latitude},${longitude});
  
          // Transports publics et mobilité
          node["highway"="bus_stop"](around:${radius},${latitude},${longitude});
          node["railway"="station"](around:${radius},${latitude},${longitude});
          way["railway"="station"](around:${radius},${latitude},${longitude});
  
          // Risques naturels
          way["hazard"="flood"](around:${radius},${latitude},${longitude});
        );
        out center;
      `;

                const response = await axios.post(
                    overpassUrl,
                    `data=${encodeURIComponent(overpassQuery)}`
                );
                const nearbyElements = response.data.elements;

                // Traduction en français
                const translatedElements = nearbyElements.map((element) => {
                    const tags = element.tags;
                    if (tags.highway) return "Route";
                    if (tags.amenity === "hospital") return "Hôpital";
                    if (tags.amenity === "school") return "École";
                    if (tags.amenity === "public_building")
                        return "Bâtiment public";
                    if (tags.man_made === "sewer") return "Égout";
                    if (tags.man_made === "drain") return "Drain";
                    if (tags.waterway === "river") return "Rivière";
                    if (tags.waterway === "stream") return "Ruisseau";
                    if (tags.waterway === "canal") return "Canal";
                    if (tags.waterway === "drain") return "Drain";
                    if (tags.waterway === "ditch") return "Fossé";
                    if (tags.natural === "water") return "Plan d'eau";
                    if (tags.natural === "wetland") return "Zone humide";
                    if (tags.waterway === "riverbank")
                        return "Berge de rivière";
                    if (tags.landuse === "reservoir") return "Réservoir";
                    if (tags.landuse === "basin") return "Bassin";
                    if (tags.man_made === "reservoir_covered")
                        return "Réservoir couvert";
                    if (tags.landuse === "forest") return "Forêt";
                    if (tags.leisure === "park") return "Parc";
                    if (tags.landuse === "residential")
                        return "Zone résidentielle";
                    if (tags.building === "residential")
                        return "Bâtiment résidentiel";
                    if (tags.amenity === "marketplace") return "Marché";
                    if (tags.landuse === "farmland") return "Terre agricole";
                    if (tags.landuse === "orchard") return "Verger";
                    if (tags.boundary === "protected_area")
                        return "Zone protégée";
                    if (tags.landuse === "industrial")
                        return "Zone industrielle";
                    if (tags.landuse === "commercial")
                        return "Zone commerciale";
                    if (tags.amenity === "waste_disposal")
                        return "Site de gestion des déchets";
                    if (tags.amenity === "recycling")
                        return "Site de recyclage";
                    if (tags.amenity === "drinking_water")
                        return "Point d'eau potable";
                    if (tags.man_made === "water_well") return "Puits";
                    if (tags.man_made === "wastewater_plant")
                        return "Station d'épuration";
                    if (tags.power === "plant") return "Centrale électrique";
                    if (tags.power === "substation")
                        return "Sous-station électrique";
                    if (tags.power === "line") return "Ligne électrique";
                    if (tags.highway === "bus_stop") return "Arrêt de bus";
                    if (tags.railway === "station") return "Gare";
                    if (tags.hazard === "flood") return "Zone inondable";
                    return "Autre";
                });

                return translatedElements;
            } catch (error) {
                console.error(
                    "Error fetching structures and natural resources from Overpass API:",
                    error
                );
                return [];
            }
        },
        [latitude, longitude]
    );

    // Envoi des prédictions vers FastAPI
    const sendPrediction = useCallback(async () => {
        try {
            const fastapiUrl = config.url2;
            if (!incident?.photo) {
                console.error(
                    "Incident photo is undefined, skipping prediction."
                );
                return;
            }

            // Récupération des structures sensibles
            const sensitiveStructures = await fetchNearbySensitiveStructures(
                latitude,
                longitude
            );

            // Handle different photo formats (Supabase vs old format)
            let imageUrl;
            if (typeof incident.photo === "object" && incident.photo !== null) {
                // Supabase storage format
                imageUrl =
                    incident.photo.signedURL ||
                    incident.photo.signedUrl ||
                    incident.photo.url;
            } else if (typeof incident.photo === "string") {
                // Old format or direct URL
                imageUrl = incident.photo;
            } else {
                console.error("Invalid photo format:", incident.photo);
                return;
            }

            const payload = {
                image_name: imageUrl,
                sensitive_structures: sensitiveStructures,
                incident_id: incidentId,
                user_id: userId,
                zone: incident?.zone || "",
                latitude: latitude,
                longitude: longitude,
            };
            console.log("Les sites voisins:", sensitiveStructures);
            console.log("Payload being sent:", payload);

            // Envoi vers FastAPI
            await axios.post(fastapiUrl, payload, { timeout: 120000 });
        } catch (error) {
            console.error(
                "Error sending prediction (Axios error):",
                error.response || error.message || error
            );
            throw new Error(
                error.response?.data?.detail || "Error during API call"
            );
        }
    }, [
        incident,
        latitude,
        longitude,
        incidentId,
        userId,
        fetchNearbySensitiveStructures,
    ]);

    return {
        handleChangeStatus,
        latitude,
        longitude,
        videoUrl,
        imgUrl,
        audioUrl,
        optionstype,
        description,
        position,
        date,
        heure,
        videoIsLoading,
        handleNavigate,
        setVideoIsLoading,
        incident,
        analysis,
        ndvi_heatmap,
        ndvi_ndwi_plot,
        landcover_plot,
        piste_solution,
        type_incident,
        zone,
        EditIncident,
        handleSelectChange,
        fetchPredictions,
        handleNavigateLLM,
        sendPrediction,
        // Pour vérification dans les tests
        selectedMonth,
        isChanged,
        inProgress,
        changeState,
    };
};
