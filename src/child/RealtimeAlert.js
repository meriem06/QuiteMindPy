import { useEffect } from "react";

const RealtimeAlert = ({ idChild, onNewMeasurement }) => {
  const homeLocation = { latitude: 48.8566, longitude: 2.3522 };

  const sendAlertToBackend = async (message, type, id_mesure) => {
    if (!id_mesure) {
      console.error("ID de mesure invalide :", id_mesure);
      return;
    }

    try {
      console.log("Envoi de l'alerte au backend :", { message, type, id_mesure });

      const response = await fetch("http://localhost:3001/api/sensors/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          type,
          id_mesure,
        }),
      });

      if (!response.ok) {
        console.error("Erreur lors de l'enregistrement de l'alerte :", response.statusText);
      } else {
        const responseData = await response.json();
        console.log("Alerte enregistrée avec succès :", responseData);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la requête :", error);
    }
  };

  const isWithinSafeZone = (lat, lon) => {
    const latThreshold = 0.05;
    const lonThreshold = 0.05;

    return (
      Math.abs(lat - homeLocation.latitude) <= latThreshold &&
      Math.abs(lon - homeLocation.longitude) <= lonThreshold
    );
  };

  useEffect(() => {
    if (!("Notification" in window)) {
      console.warn("Ce navigateur ne prend pas en charge les notifications.");
      return;
    }

    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          console.warn("Permission de notification refusée.");
        return;
        }
      });
    }

    let eventSource = new EventSource(`http://localhost:3001/api/sensors/realtime/${idChild}`);

    eventSource.onopen = () => {
      console.log("Connexion SSE établie");
    };

    eventSource.onmessage = (event) => {
     // console.log("Données reçues :", event.data);
      if (!event.data) {
        console.error("Aucune donnée reçue ou valeur invalide :", event.data);
        return;
      }

      try {
        const data = JSON.parse(event.data);
        const { id, heart_beat, temperature, Latitude, Longitude } = data;

        if (
          id === undefined ||
          heart_beat === undefined ||
          temperature === undefined ||
          Latitude === undefined ||
          Longitude === undefined
        ) {
          console.error("Données SSE incomplètes :", data);
          return;
        }

       // console.log("Nouvelle mesure reçue :", { id, heart_beat, temperature, Latitude, Longitude });

        if (onNewMeasurement) {
          onNewMeasurement(id);
        }

        if (heart_beat > 140 || temperature > 38.5) {
          const message = `⚠️ Crise détectée ! FC: ${heart_beat} bpm | Temp: ${temperature}°C`;
          sendAlertToBackend(message, "crise", id);
        }

        if (!isWithinSafeZone(Latitude, Longitude)) {
          const message = `⚠️ Enfant hors zone sécurisée ! 📍 Localisation : ${Latitude}, ${Longitude}`;
          sendAlertToBackend(message, "hors_zone", id);
        }
      } catch (error) {
        console.error("Erreur lors de l'analyse JSON des données SSE :", error, event.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Erreur de connexion au serveur SSE :", error);
      eventSource.close();

      setTimeout(() => {
        console.log("Tentative de reconnexion au serveur SSE...");
        eventSource = new EventSource(`http://localhost:3001/api/sensors/realtime/${idChild}`);
      }, 5000);
    };

    return () => {
      eventSource.close();
      console.log("Connexion SSE fermée");
    };
  }, [idChild, onNewMeasurement]);

  return null;
};

export default RealtimeAlert;