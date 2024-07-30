import React, { useState, useRef,useEffect } from "react";
import axios from 'axios';
import { config } from '../config';
import {  useParams, useHistory } from 'react-router-dom';
// import Chart from 'chart.js/auto';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import ApexCharts from 'react-apexcharts';
const monthsOptions = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
];

export const useIncidentData = () => {
    const navigate = useHistory();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [anonymousPercentage, setAnonymousPercentage] = useState(0);
    const [registeredPercentage, setRegisteredPercentage] = useState(0);
    const [percentageVs, setPercentageVs] = useState(0);
    const [percentageVsTaken, setPercentageVsTaken] = useState(0);
    const [percentageVsResolved, setPercentageVsResolved] = useState(0);
    const [taken, setTaken] = useState(0);
    const [countTake, setCountTake] = useState(0)
    const [collaboration, setCollaboration] = useState([]);
    const [incidents, setIncident] = useState([]);
    const [countActions, setCountActions] = useState(0);
    const [PercentageIncrease, setPercentageIncrease] = useState(0);
    const [countIncidents, setCountIncidents] = useState(0);
    const [resolus, setResolus] = useState(0);
    const [categoryData, setCategoryData] = useState({});
    const [zoneData, setZoneData] = useState({});
    const chartRef = useRef(null);
    const [showOnlyTakenIntoAccount, setShowOnlyTakenIntoAccount] = useState(false);
    const [showOnlyResolved, setShowOnlyResolved] = useState(false);
    const [showOnlyDeclared, setShowOnlyDeclared] = useState(false);
    const [preduct, setPreduct] = useState([])
    const [countCategory, setCountCategory] = useState('');
    const [data, setData] = useState([]);
    const handleMonthChange = (selectedOption) => {
        const monthValue = selectedOption.value;
        if (monthValue >= 1 && monthValue <= 12) {
            setSelectedMonth(monthValue);
        } else {
            console.error("Invalid month value:", monthValue);
        }
    };

    const _getAnonymous = async () => {
        var url = `${config.url}/MapApi/incidentByMonth/?month=${selectedMonth}`;
        try {
            let res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.token}`,
                    'Content-Type': 'application/json',
                },
            });
            let totalIncidents = res.data.data.length;
            let anonymousIncidents = res.data.data.filter(incident => incident.user_id === null).length;
            let percentageAnonymous = totalIncidents !== 0 ? ((anonymousIncidents / totalIncidents) * 100).toFixed(2) : 0;
            setAnonymousPercentage(percentageAnonymous);
            return percentageAnonymous;
        } catch (error) {
          console.error('Erreur lors de la requête API:', error.response ? error.response.data : error.message);
            setAnonymousPercentage(0);
        }
    };

    const _getRegistered = async () => {
        var url = `${config.url}/MapApi/incidentByMonth/?month=${selectedMonth}`;
        try {
            let res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.token}`,
                    'Content-Type': 'application/json',
                },
            });
            let totalIncidents = res.data.data.length;
            let registeredIncidents = res.data.data.filter(incident => incident.user_id !== null).length;
            let percentageRegistered = totalIncidents !== 0 ? ((registeredIncidents / totalIncidents) * 100).toFixed(2) : 0;
            setRegisteredPercentage(percentageRegistered);
            return percentageRegistered;
        } catch (error) {
            console.log(error.message);
            setRegisteredPercentage(0);
        }
    };

    const _getIndicateur = async () => {
        const userChartRef = chartRef.current.getContext('2d');
        if (window.myChart !== undefined) {
            window.myChart.destroy();
        }
        try {
            const anonymousPercentage = await _getAnonymous();
            const registeredPercentage = await _getRegistered();
            window.myChart = new Chart(userChartRef, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [anonymousPercentage, registeredPercentage],
                        backgroundColor: ['purple', 'orange']
                    }]
                },
                options: {}
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    const _getPercentage = async () => {
        var url = `${config.url}/MapApi/incidentByMonth/?month=${selectedMonth}`;
        try {
            let res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.token}`,
                    'Content-Type': 'application/json',
                },
            });
            let totalIncidents = res.data.data.length;
            let taken = res.data.data.filter(incident => incident.etat === "taken_into_account").length;
            let percentageTaken = totalIncidents !== 0 ? ((taken / totalIncidents) * 100).toFixed(2) : 0;
            setTaken(percentageTaken);
            console.log("Incidents pris en comptes", percentageTaken);
        } catch (error) {
            console.log(error.message);
        }
    };

    const _getPercentageVsPreviousMonth = async () => {
        try {
            const currentMonth = selectedMonth;
            const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const urlCurrent = `${config.url}/MapApi/incidentByMonth/?month=${currentMonth}`;
            const urlPrevious = `${config.url}/MapApi/incidentByMonth/?month=${previousMonth}`;

            const [responseCurrent, responsePrevious] = await Promise.all([
                axios.get(urlCurrent, { headers: { Authorization: `Bearer ${sessionStorage.token}`, 'Content-Type': 'application/json' } }),
                axios.get(urlPrevious, { headers: { Authorization: `Bearer ${sessionStorage.token}`, 'Content-Type': 'application/json' } })
            ]);

            const currentCount = responseCurrent.data.data.length;
            const previousCount = responsePrevious.data.data.length;
            const percentageVs = previousCount !== 0 ? (((currentCount - previousCount) / previousCount) * 100).toFixed(2) : 0;
            setPercentageVs(percentageVs);
            console.log("Variation en pourcentage par rapport au mois précédent:", percentageVs);
        } catch (error) {
            console.log(error.message);
        }
    };

    const _getPercentageVsTaken = async () => {
        try {
            const currentMonth = selectedMonth;
            const previousMonth = selectedMonth - 1;
            const urlCurrent = `${config.url}/MapApi/incidentByMonth/?month=${currentMonth}`;
            const urlPrevious = `${config.url}/MapApi/incidentByMonth/?month=${previousMonth}`;

            const [responseCurrent, responsePrevious] = await Promise.all([
                axios.get(urlCurrent, { headers: { Authorization: `Bearer ${sessionStorage.token}`, 'Content-Type': 'application/json' } }),
                axios.get(urlPrevious, { headers: { Authorization: `Bearer ${sessionStorage.token}`, 'Content-Type': 'application/json' } })
            ]);

            const currentTaken = responseCurrent.data.data.filter(incident => incident.etat === "taken_into_account").length;
            const previousTaken = responsePrevious.data.data.filter(incident => incident.etat === "taken_into_account").length;
            const percentageVsPreviousMonth = previousTaken !== 0 ? ((currentTaken / previousTaken) * 100).toFixed(2) : 0;
            setPercentageVsTaken(percentageVsPreviousMonth);
            console.log("Variation en pourcentage des incidents pris en compte par rapport au mois précédent:", percentageVsPreviousMonth);
        } catch (error) {
            console.log(error.message);
        }
    };
    const TakenOnMap = async () => {
      setShowOnlyTakenIntoAccount(!showOnlyTakenIntoAccount);
      setShowOnlyResolved(false);
      setShowOnlyDeclared(false)
    }

    const ResolvedOnMap = async () => {
        setShowOnlyResolved(!showOnlyResolved);
        setShowOnlyDeclared(false)
        setShowOnlyTakenIntoAccount(false);
    }

    const DeclaredOnMap = async () => {
        setShowOnlyDeclared(!showOnlyDeclared);
        setShowOnlyTakenIntoAccount(false);
        setShowOnlyResolved(false);
    }
    const _getPercentageVsResolved = async () => {
        try {
            const currentMonth = selectedMonth;
            const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const urlCurrent = `${config.url}/MapApi/incidentByMonth/?month=${currentMonth}`;
            const urlPrevious = `${config.url}/MapApi/incidentByMonth/?month=${previousMonth}`;

            const [responseCurrent, responsePrevious] = await Promise.all([
                axios.get(urlCurrent, { headers: { Authorization: `Bearer ${sessionStorage.token}`, 'Content-Type': 'application/json' } }),
                axios.get(urlPrevious, { headers: { Authorization: `Bearer ${sessionStorage.token}`, 'Content-Type': 'application/json' } })
            ]);

            const currentResolved = responseCurrent.data.data.filter(incident => incident.etat === "resolved").length;
            const previousResolved = responsePrevious.data.data.filter(incident => incident.etat === "resolved").length;
            const percentageVsResolved = previousResolved !== 0 ? (((currentResolved - previousResolved) / previousResolved) * 100).toFixed(2) : 0;
            setPercentageVsResolved(percentageVsResolved);
            console.log("Variation en pourcentage des incidents résolus par rapport au mois précédent:", percentageVsResolved);
        } catch (error) {
            console.log(error.message);
        }
    };
    const userId = sessionStorage.getItem('user_id');
    console.log('useeeeer', userId)

    const _getIncidents = async () => {
        var url = `${config.url}/MapApi/incidentByMonth/?month=${selectedMonth}`;
        try {
            let res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.token}`,
                    'Content-Type': 'application/json',
                },
            });
            setIncident(res.data.data);
            setCountIncidents(res.data.data.length);
        } catch (error) {
            console.log(error.message);
        }
    };
    const _getActions = async () => {
        const currentMonth = selectedMonth;
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const urlCurrent = `${config.url}/MapApi/incidentByMonth/?month=${currentMonth}`;
        const urlPrevious = `${config.url}/MapApi/incidentByMonth/?month=${previousMonth}`;
        var url = `${config.url}/MapApi/incidentByMonth/?month=${selectedMonth}`;
        try {
            const [responseCurrent, responsePrevious] = await Promise.all([
                axios.get(urlCurrent, { headers: { Authorization: `Bearer ${sessionStorage.token}`, 'Content-Type': 'application/json' } }),
                axios.get(urlPrevious, { headers: { Authorization: `Bearer ${sessionStorage.token}`, 'Content-Type': 'application/json' } })
            ]);
            const currentAct = responseCurrent.data.data.filter(incident => String(incident.taken_by) === String(userId)).length;
            const previousAct = responsePrevious.data.data.filter(incident => String(incident.taken_by) === String(userId)).length;
            
            setCountActions(currentAct);
            const percentageIncrease = previousAct > 0
                ? ((currentAct - previousAct) / previousAct) * 100
                : 0;
            setPercentageIncrease(percentageIncrease);

        } catch (error) {
            console.log(error.message);
        }
    };


    const _getIncidentsCollabor = async () => {
        var url = `${config.url}/MapApi/incidentByMonth/?month=${selectedMonth}`
        try {
            let res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer${sessionStorage.token}`,
                    'Content-Type': 'application/json',
                },
            })
            setCountTake(res.data.data.filter(incident => incident.etat === "taken_into_account").length);
            setData(res.data.data.filter(incident => incident.etat === "taken_into_account"));
        } catch (error) {
            console.log(error.message)
        }
    }
    const _getCollaboration = async () => {
        var url = `${config.url}/MapApi/collaboration/`
        try {
            let res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer${sessionStorage.token}`,
                    'Content-Type': 'application/json',
                },
            })
            setCollaboration(res.data.length)
            console.log("Les collaboration", res.data.length)
        } catch (error) {
            console.log(error.message)
        }
    }

    const _getIncidentsResolved = async () => {
        var url = `${config.url}/MapApi/incidentByMonth/?month=${selectedMonth}`;
        try {
            let res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.token}`,
                    'Content-Type': 'application/json',
                },
            });
            let resolved = res.data.data.filter(incident => incident.etat === "resolved").length;
            setResolus(resolved);
        } catch (error) {
            console.log(error.message);
        }
    };

    const _getCategory = async () => {
      try {
        const res = await axios.get(`${config.url}/MapApi/prediction/`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.token}`,
            },
          });
        console.log("Ici log", res.data);
        let predictions = res.data;

        let incidentCounts = predictions.reduce((acc, prediction) => {
            acc[prediction.incident_type] = (acc[prediction.incident_type] || 0) + 1;
            return acc;
        }, {});

        let totalIncidents = predictions.length;

        let incidentPercentages = Object.entries(incidentCounts).map(([type, count]) => {
            return {
                type,
                count,
                percentage: ((count / totalIncidents) * 100).toFixed(2) + '%'
            };
        });

        console.log('Nombre total d\'incidents:', totalIncidents);
        console.log('Détails des incidents:', incidentPercentages);

        setCountCategory(totalIncidents);
        setPreduct(incidentPercentages);
      } catch (error) {
        console.log(error.message);
      }
    };
    
    const onShowIncident = (id) => {
        const item = getIncidentById(id)
        console.log("Données d'incident dans onShowIncident :", item); 
        navigate.push(`/admin/incident_view/${id}`, { incident: item }, () => {
          console.log('State updated:', location.state); 
          setIncident(item);
        });
        if (item) {
            console.log('element à afficher ', item)
            setIncident(item);
        }
    }


    const onShowIncidentCollaboration = (id) => {
        const item = getIncidentById(id)
        console.log("Données d'incident dans onShowIncident :", item); 
        navigate.push(`/admin/incident_view_collaboration/${id}`, { incident: item }, () => {
          console.log('State updated:', location.state); 
          setIncident(item);
        });
        if (item) {
            console.log('element à afficher ', item)
            setIncident(item);
        }
    }

    const getIncidentById = (id) => {
        let incident = ''
        for (let index = 0; index < data.length; index++) {
            const element = data[index]
            if (element.id === id) {
                incident = element
            }
        }
        return incident
    }

    const filterIncidents = (incidents) => {
        let filteredIncidents = incidents;
        if (showOnlyTakenIntoAccount) {
            filteredIncidents = filteredIncidents.filter(incident => incident.etat === "taken_into_account");
        }
        if (showOnlyResolved) {
            filteredIncidents = filteredIncidents.filter(incident => incident.etat === "resolved");
        }
        if (showOnlyDeclared) {
            filteredIncidents = filteredIncidents.filter(incident => incident.etat === "declared");
        }
        return filteredIncidents;
    };

    const displayIcon = (incidentType) => {
        let iconHtml;
        switch (incidentType) {
            case 'feu':
                iconHtml = '<i class="fa fa-fire" style="color:red"></i>';
                break;
            case 'accident':
                iconHtml = '<i class="fa fa-car-crash" style="color:orange"></i>';
                break;
            case 'inondation':
                iconHtml = '<i class="fa fa-water" style="color:blue"></i>';
                break;
            default:
                iconHtml = '<i class="fa fa-question-circle" style="color:gray"></i>';
        }
        return L.divIcon({
            html: ReactDOMServer.renderToString(<div dangerouslySetInnerHTML={{ __html: iconHtml }} />),
            className: 'incident-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24],
        });
    };
    const IndicateurChart = () => {
      const [chartData, setChartData] = useState({
        series: [0, 0],
        options: {
          chart: {
            type: 'donut',
          },
          labels: ['Anonymes', 'Inscrits'],
          // fill: {
          //   colors: ['#a313eb', '#f07e0c']
          // },
          // colors: ['#a313eb', '#f07e0c'],
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
        }
      });
      useEffect(() => {
        let isMounted = true;
    
        if (isMounted) {
          setChartData(prevData => ({
            ...prevData,
            series: [parseFloat(anonymousPercentage), parseFloat(registeredPercentage)],
          }));
        }
    
        return () => {
          isMounted = false;
        };
      }, [anonymousPercentage, registeredPercentage]);
      
    
      return (
        <div>
          <ApexCharts 
            options={chartData.options} 
            series={chartData.series} 
            type="donut" 
            height={350} 
          />
        </div>
      );
    };
    
    

    return {
        selectedMonth,
        setSelectedMonth,
        anonymousPercentage,
        registeredPercentage,
        percentageVs,
        percentageVsTaken,
        percentageVsResolved,
        taken,
        incidents,
        setCountIncidents,
        setResolus,
        setRegisteredPercentage,
        setPercentageVs,
        setPercentageVsResolved,
        countIncidents,
        resolus,
        categoryData,
        zoneData,
        showOnlyTakenIntoAccount,
        setShowOnlyTakenIntoAccount,
        showOnlyResolved,
        setShowOnlyResolved,
        showOnlyDeclared,
        setShowOnlyDeclared,
        handleMonthChange,
        _getAnonymous,
        _getRegistered,
        _getIndicateur,
        _getPercentage,
        _getPercentageVsPreviousMonth,
        _getPercentageVsTaken,
        _getPercentageVsResolved,
        _getIncidents,
        _getIncidentsResolved,
        _getCategory,
        filterIncidents,
        displayIcon,
        chartRef,
        preduct,
        IndicateurChart,
        TakenOnMap,
        DeclaredOnMap,
        ResolvedOnMap,
        onShowIncident,
        onShowIncidentCollaboration,
        countTake,
        _getIncidentsCollabor,
        _getActions,
        countActions,
        PercentageIncrease,
        _getCollaboration,
        collaboration
    };
};
