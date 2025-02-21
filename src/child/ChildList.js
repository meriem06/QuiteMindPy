import { useEffect, useState } from "react";
import { getChildren, deleteChild } from "../services/api";
import { useHistory } from "react-router-dom";

// Vision UI components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import Table from "examples/Tables/Table";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Card from "@mui/material/Card";

const ChildList = () => {
  const [children, setChildren] = useState([]);
  const history = useHistory();

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const childrenData = await getChildren();
      setChildren(childrenData);
    } catch (error) {
      console.error("Erreur lors de la récupération des enfants :", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet enfant ?")) {
      try {
        await deleteChild(id);
        fetchChildren();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'enfant :", error);
      }
    }
  };

  // Define columns for the table
  const columns = [
    { name: "enfant", align: "left" },
    { name: "genre", align: "left" },
    { name: "actions", align: "center" },
  ];

  // Define rows for the table
  const rows = children.map((child) => ({
    enfant: `${child.FirstName} ${child.LastName}`,
    genre: child.Gender,
    actions: (
      <VuiBox display="flex" gap={2}>
        <VuiTypography
          component="a"
          href="#"
          variant="caption"
          color="info"
          fontWeight="medium"
          onClick={(e) => {
            e.preventDefault();
            history.push(`/detail/${child.id}`);
          }}
          sx={{ cursor: "pointer" }}
        >
          Voir
        </VuiTypography>
        <VuiTypography
          component="a"
          href="#"
          variant="caption"
          color="warning"
          fontWeight="medium"
          onClick={(e) => {
            e.preventDefault();
            history.push(`/edit/${child.id}`);
          }}
          sx={{ cursor: "pointer" }}
        >
          Modifier
        </VuiTypography>
        <VuiTypography
          component="a"
          href="#"
          variant="caption"
          color="error"
          fontWeight="medium"
          onClick={(e) => {
            e.preventDefault();
            handleDelete(child.id);
          }}
          sx={{ cursor: "pointer" }}
        >
          Supprimer
        </VuiTypography>
      </VuiBox>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        <VuiBox mb={3}>
          <Card>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb="22px">
              <VuiTypography variant="lg" color="white">
                Liste des enfants
              </VuiTypography>
              <VuiTypography
                component="a"
                href="#"
                variant="caption"
                color="text"
                fontWeight="medium"
                onClick={(e) => {
                  e.preventDefault();
                  history.push("/add");
                }}
                sx={{ cursor: "pointer", textDecoration: "underline" }}
              >
                Ajouter un enfant
              </VuiTypography>
            </VuiBox>
            <VuiBox
              sx={{
                "& th": {
                  borderBottom: ({ borders: { borderWidth }, palette: { grey } }) =>
                    `${borderWidth[1]} solid ${grey[700]}`,
                },
                "& .MuiTableRow-root:not(:last-child)": {
                  "& td": {
                    borderBottom: ({ borders: { borderWidth }, palette: { grey } }) =>
                      `${borderWidth[1]} solid ${grey[700]}`,
                  },
                },
              }}
            >
              <Table columns={columns} rows={rows} />
            </VuiBox>
          </Card>
        </VuiBox>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
};

export default ChildList;