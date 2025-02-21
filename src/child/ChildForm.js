import React, { useEffect, useState } from "react";
import { addChild, getChildById, updateChild } from "../services/api";
import { useHistory, useParams } from "react-router-dom";
import "./ChildForm.css"; // Importez le fichier CSS
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";

const ChildForm = () => {
  const { id } = useParams();
  const history = useHistory();
  const [formData, setFormData] = useState({
    LastName: "",
    FirstName: "",
    Age: "",
    Gender: "Male",
    AutonomyLevel: "Low",
    SensoryPreferences: "",
    FavoriteInterests: "",
    ModeOfCommunication: "Verbal",
    CalmingStrategies: "",
    AllergiesOrDietaryRestrictions: "",
    id_userParent: 10,
    image: null // Ajouter un champ pour l'image
  });

  useEffect(() => {
    if (id) {
      console.log("ID détecté, chargement des données...");
      fetchChild(id);
    }
  }, [id]);

  const fetchChild = async (childId) => {
    try {
      const response = await getChildById(childId);
      console.log("Réponse de l'API :", response);
      console.log("Données reçues :", response.data);

      if (response && response.data) {
        setFormData({
          LastName: response.data.LastName || "",
          FirstName: response.data.FirstName || "",
          Age: response.data.Age || "",
          Gender: response.data.Gender || "Male",
          AutonomyLevel: response.data.AutonomyLevel || "Low",
          SensoryPreferences: response.data.SensoryPreferences || "",
          FavoriteInterests: response.data.FavoriteInterests || "",
          ModeOfCommunication: response.data.ModeOfCommunication || "Verbal",
          CalmingStrategies: response.data.CalmingStrategies || "",
          AllergiesOrDietaryRestrictions: response.data.AllergiesOrDietaryRestrictions || "",
          id_userParent: response.data.id_userParent || 10,
          image: response.data.image || null // Si l'image est présente
        });
      } else {
        console.error("Aucune donnée trouvée dans la réponse de l'API");
        setFormData({
          LastName: "",
          FirstName: "",
          Age: "",
          Gender: "Male",
          AutonomyLevel: "Low",
          SensoryPreferences: "",
          FavoriteInterests: "",
          ModeOfCommunication: "Verbal",
          CalmingStrategies: "",
          AllergiesOrDietaryRestrictions: "",
          id_userParent: 10,
          image: null
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'enfant :", error);
      alert("Erreur lors du chargement des données de l'enfant. Veuillez réessayer.");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
    } else if (name === "Age" && value > 18) {
      alert("L'âge doit être inférieur à 18 ans.");
      return;
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation pour l'âge
    if (formData.Age > 18) {
      alert("L'âge doit être inférieur à 18 ans.");
      return;
    }

    // Créer un FormData pour gérer l'envoi de l'image et des autres données
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      if (id) {
        await updateChild(id, formDataToSend);
      } else {
        await addChild(formDataToSend);
      }
      history.push("/");
    } catch (error) {
      console.error("Erreur lors de l'ajout ou modification de l'enfant", error);
      alert("Erreur lors de l'ajout ou de la modification de l'enfant. Veuillez réessayer.");
    }
  };

  useEffect(() => {
    console.log("FormData mis à jour :", formData);
  }, [formData]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card sx={{ maxWidth: 800, margin: "auto", mt: 4, p: 3 }}>
        <div className="container">
          <div className="text">
            {id ? "Modifier un enfant" : "Ajouter un enfant"}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-data">
                <input
                  type="text"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  required
                />
                <div className="underline"></div>
                <label>Nom</label>
              </div>
              <div className="input-data">
                <input
                  type="text"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  required
                />
                <div className="underline"></div>
                <label>Prénom</label>
              </div>
            </div>
            <div className="form-row">
              <div className="input-data">
                <input
                  type="number"
                  name="Age"
                  value={formData.Age}
                  onChange={handleChange}
                  required
                />
                <div className="underline"></div>
                <label>Âge</label>
              </div>
              <div className="input-data">
                <select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                  required
                >
                  <option value="Male">Garçon</option>
                  <option value="Female">Fille</option>
                </select>
                <div className="underline"></div>
                <label>Genre</label>
              </div>
            </div>
            <div className="form-row">
              <div className="input-data">
                <select
                  name="AutonomyLevel"
                  value={formData.AutonomyLevel}
                  onChange={handleChange}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <div className="underline"></div>
                <label>Niveau d'autonomie</label>
              </div>
              <div className="input-data">
                <input
                  type="text"
                  name="SensoryPreferences"
                  value={formData.SensoryPreferences}
                  onChange={handleChange}
                  required
                />
                <div className="underline"></div>
                <label>Préférences sensorielles</label>
              </div>
            </div>
            <div className="form-row">
              <div className="input-data">
                <input
                  type="text"
                  name="FavoriteInterests"
                  value={formData.FavoriteInterests}
                  onChange={handleChange}
                  required
                />
                <div className="underline"></div>
                <label>Centres d'intérêt favoris</label>
              </div>
              <div className="input-data">
                <select
                  name="ModeOfCommunication"
                  value={formData.ModeOfCommunication}
                  onChange={handleChange}
                  required
                >
                  <option value="Verbal">Verbal</option>
                  <option value="Pictograms">Pictograms</option>
                  <option value="Sign Language">Sign Language</option>
                  <option value="PECS">PECS</option>
                </select>
                <div className="underline"></div>
                <label>Mode de communication</label>
              </div>
            </div>
            <div className="form-row">
              <div className="input-data">
                <input
                  type="text"
                  name="CalmingStrategies"
                  value={formData.CalmingStrategies}
                  onChange={handleChange}
                  required
                />
                <div className="underline"></div>
                <label>Stratégies de régulation</label>
              </div>
              <div className="input-data">
                <input
                  type="text"
                  name="AllergiesOrDietaryRestrictions"
                  value={formData.AllergiesOrDietaryRestrictions}
                  onChange={handleChange}
                  required
                />
                <div className="underline"></div>
                <label>Allergies ou restrictions alimentaires</label>
              </div>
            </div>
            <div className="form-row">
              <div className="input-data">
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  required
                />
                <div className="underline"></div>
                <label>Image</label>
              </div>
            </div>
            <div className="form-row submit-btn">
              <div className="input-data">
                <div className="inner"></div>
                <input type="submit" value={id ? "Modifier" : "Ajouter"} />
              </div>
            </div>
          </form>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default ChildForm;
