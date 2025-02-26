import { useParams } from "react-router-dom"; // Ensure this import is present
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import "./styles.css";
import RealtimeAlert from "./RealTimeAlert";

// MapComponent avec validation des coordonnées
const MapComponent = ({ latitude, longitude }) => {
  const isValidLatitude = typeof latitude === "number" && latitude >= -90 && latitude <= 90;
  const isValidLongitude = typeof longitude === "number" && longitude >= -180 && longitude <= 180;

  if (!isValidLatitude || !isValidLongitude) {
    return <div>Données de localisation non disponibles.</div>;
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[latitude, longitude]}>
        <Popup>Position actuelle</Popup>
      </Marker>
    </MapContainer>
  );
};

const ReportGenerator = () => {
  const { childid } = useParams(); // Ensure this is used correctly
  const [reports, setReports] = useState([]);
  const [chartData, setChartData] = useState([]); // État pour les données historiques des graphiques
  const [measurementId, setMeasurementId] = useState(null);
  const handleNewMeasurement = (id) => {
    setMeasurementId(id);
  };

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:3001/api/sensors/sensors/realtime/${childid}`);

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      console.log("Received sensor data:", newData); // Debugging

      if (newData && typeof newData === "object") {
        // Mettre à jour reports avec la dernière donnée reçue
        const newReport = {
          id: reports.length + 1,
          timestamp: new Date().toLocaleString(),
          data: [newData],
        };
        setReports([newReport]);
      } else {
        console.error("Données reçues invalides :", newData);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Erreur SSE :", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [childid, reports]); // On ne met plus `chartData` comme dépendance

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/sensors/history/${childid}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données historiques");
        }
        const data = await response.json();
        console.log("Received historical data:", data); // Debugging
  
        // Formater les données pour recharts
        const formattedData = data.map((measurement) => ({
          id: measurement.id,
          name: new Date(measurement.timestamp).toLocaleString(),
          heart_beat: measurement.heart_beat,
          temperature: measurement.temperature,
        }));
  
        console.log("Formatted chartData:", formattedData); // Debugging
        setChartData(formattedData);
      } catch (error) {
        console.error("Erreur :", error);
      }
    };
  
    fetchHistoricalData();
  }, [childid]);

  const getEmotionalState = (heartBeat, temperature) => {
    if (heartBeat > 100 && temperature > 37) return "Stressé";
    if (heartBeat < 60 && temperature < 36) return "Détendu";
    if (heartBeat >= 60 && heartBeat <= 70 && temperature >= 36 && temperature <= 37) return "Joyeux";
    if (heartBeat > 70 && heartBeat <= 80 && temperature > 37) return "Triste";
    if (heartBeat >= 60 && heartBeat <= 80 && temperature < 36) return "Seul";
    return "Normal";
  };

  const getHealthStatus = (heartBeat, temperature) => {
    if (heartBeat > 100 || temperature > 38) return "État critique : Consulter un médecin";
    if (heartBeat > 90 || temperature > 37.5) return "État préoccupant : Surveiller de près";
    if (heartBeat < 60 || temperature < 36) return "État faible : Prendre des précautions";
    return "État stable : Tout va bien";
  };

  return (
    <DashboardLayout>
      <DashboardNavbar id={measurementId} />
      <RealtimeAlert idChild={childid} onNewMeasurement={handleNewMeasurement} />
      <div className="container mx-auto p-4 dark-background">
        <h2 className="text-2xl font-bold white-text mb-8">Rapport en temps réel</h2>

        {reports.length > 0 && reports[0].data && reports[0].data[0] ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cadre pour le texte animé */}
            <Card className="dark-background">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={reports[0].id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                    <motion.div
                      className="text-xl font-medium text-center white-text"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      Date: {reports[0].timestamp}
                    </motion.div>

                    <div className="space-y-6">
                      <motion.div
                        className="text-4xl font-bold text-center white-text"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        {reports[0].data[0].heart_beat}
                        <span className="text-xl ml-2">bpm</span>
                      </motion.div>

                      <motion.div
                        className="text-3xl font-semibold text-center white-text"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        {reports[0].data[0].temperature}
                        <span className="text-xl ml-2">°C</span>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Cadre pour l'état émotionnel */}
            <Card className="dark-background">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={reports[0].id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                    <motion.div
                      className="text-2xl font-bold text-center white-text"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      État Émotionnel
                    </motion.div>

                    <motion.div
                      className="text-4xl font-bold text-center white-text"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {getEmotionalState(
                        reports[0].data[0].heart_beat,
                        reports[0].data[0].temperature
                      )}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Cadre pour l'état de santé */}
            <Card className="dark-background">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={reports[0].id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                    <motion.div
                      className="text-2xl font-bold text-center white-text"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      État de Santé
                    </motion.div>

                    <motion.div
                      className="text-4xl font-bold text-center white-text"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {getHealthStatus(
                        reports[0].data[0].heart_beat,
                        reports[0].data[0].temperature
                      )}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Cadre pour la carte OpenStreetMap */}
            <Card className="col-span-1 md:col-span-2">
              <CardContent className="p-8">
                <h4 style={{ color: "white" }} className="graph-title" color="white">Localisation</h4>
                <MapComponent
                  latitude={reports[0].data[0].Latitude}
                  longitude={reports[0].data[0].Longitude}
                />
              </CardContent>
            </Card>

            {/* Cadre pour le graphique des battements de cœur */}
            <Card className="col-span-1 md:col-span-2">
              <CardContent className="p-8">
                <h4 style={{ color: "white" }} className="graph-title">Battements de cœur</h4>
                <BarChart
                  width={600}
                  height={300}
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="heart_beat" fill="#8884d8" />
                </BarChart>
              </CardContent>
            </Card>

            {/* Cadre pour le graphique de la température */}
            <Card className="col-span-1 md:col-span-2">
              <CardContent className="p-8">
                <h4 style={{ color: "white" }} className="graph-title">Température</h4>
                <LineChart
                  width={600}
                  height={300}
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="#82ca9d" />
                </LineChart>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-white">En attente de données...</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportGenerator;