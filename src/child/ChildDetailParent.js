import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // Chemin correct
import Card from "@mui/material/Card";
import { Box, Button, Typography } from "@mui/material";
import "./ChildDetail.css"; // Import du fichier CSS
import RealtimeAlert from "./RealTimeAlert";

const ChildDetail = () => {
  const history = useHistory();
  const [children, setChildren] = useState([]);
  const [measurementId, setMeasurementId] = useState(null);
  const childId = 10;

  const handleNewMeasurement = (id) => {
    setMeasurementId(id);
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const url = `http://localhost:3001/api/child/parent/${childId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des données");
      }
      const childrenData = await response.json();
      console.log("Données des enfants :", childrenData);
      setChildren(childrenData);
    } catch (error) {
      console.error("Erreur lors du chargement des enfants :", error);
    }
  };

  if (children.length === 0) {
    return <p className="white-text">Chargement...</p>;
  }

  return (
    <DashboardLayout>
<DashboardNavbar id={measurementId} />
      <Card sx={{ maxWidth: 800, margin: "auto", mt: 4, p: 3 }}>
        <div className="max-w-2xl mx-auto p-4">
          <Typography variant="h5" className="text-2xl font-bold mb-4 white-text">
            Détails des enfants
          </Typography>

          {/* Cartes pour chaque enfant */}
          <div className="child-cards-container">
            {children.map((child) => (
              <div key={child.id}>
                <RealtimeAlert idChild={child.id} onNewMeasurement={handleNewMeasurement} />
                <Card
                  sx={{
                    marginBottom: 3,
                    padding: 2,
                    backgroundColor: "#f4f6f8",
                    boxShadow: 3,
                    borderRadius: 2,
                  }}
                  className="child-card"
                >
                  <Typography  className="white-text">
                    <strong>Nom :</strong> {child.LastName}
                  </Typography>
                  <Typography className="white-text">
                    <strong>Prénom :</strong> {child.FirstName}
                  </Typography>
                  <Typography className="white-text">
                    <strong>Âge :</strong> {child.Age} ans
                  </Typography>
                  <Typography className="white-text">
                    <strong>Genre :</strong> {child.Gender}
                  </Typography>
                  <Typography className="white-text">
                    <strong>Niveau d'autonomie :</strong> {child.AutonomyLevel}
                  </Typography>
                  <Typography className="white-text">
                    <strong>Préférences sensorielles :</strong> {child.SensoryPreferences}
                  </Typography>
                  <Typography className="white-text">
                    <strong>Intérêts favoris :</strong> {child.FavoriteInterests}
                  </Typography>
                  <Typography className="white-text">
                    <strong>Mode de communication :</strong> {child.ModeOfCommunication}
                  </Typography>
                  <Typography className="white-text">
                    <strong>Stratégies calmantes :</strong> {child.CalmingStrategies}
                  </Typography>
                  <Typography className="white-text">
                    <strong>Allergies ou restrictions alimentaires :</strong> {child.AllergiesOrDietaryRestrictions}
                  </Typography>

                  {/* Modifier button */}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => history.push(`/edit/Parent/${child.id}/${childId}`)}
                    >
                      Modifier
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => history.push(`/rapport/${child.id}`)}
                    >
                      Etat
                    </Button>
                  </Box>
                </Card>
              </div>
            ))}
          </div>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => history.push("/child/ChildList")}
            >
              ⬅ Retour
            </Button>
          </Box>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default ChildDetail;