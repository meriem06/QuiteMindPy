import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import Badge from "@mui/material/Badge";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";
import { useVisionUIController, setTransparentNavbar, setMiniSidenav, setOpenConfigurator } from "context";
import team2 from "assets/images/notification-icon.png";
import RealtimeAlert from "child/RealTimeAlert";

const DashboardNavbar = ({ absolute, light, isMini, id }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [navbarType, setNavbarType] = useState("static");
  const [controller, dispatch] = useVisionUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator } = controller;
  const [openMenu, setOpenMenu] = useState(null);
  const [pageTitle, setPageTitle] = useState("QuietMind"); // Titre par défaut
  const location = useLocation();
  const route = location.pathname.split("/").slice(1);

  // Fonction pour gérer les nouvelles alertes
  const handleNewAlert = (alert) => {
    console.log("New alert received:", alert); // Vérifiez les données reçues
    setNotifications((prevNotifications) => {
      const newNotifications = [alert, ...prevNotifications];
      console.log("Updated notifications:", newNotifications); // Vérifiez l'état mis à jour
      return newNotifications;
    });
    setNotificationCount((prevCount) => prevCount + 1);
  };

  // Se connecter à la route SSE pour recevoir les alertes en temps réel
  useEffect(() => {
    if (!id) return; // Ne pas se connecter si l'ID est manquant

    const eventSource = new EventSource(`http://localhost:3001/api/alerts/realtime/${id}`);

    eventSource.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      handleNewAlert(newAlert); // Mettre à jour les notifications
    };

    eventSource.onerror = (error) => {
      console.error("Erreur de connexion SSE :", error);
      eventSource.close();
    };

    return () => {
      eventSource.close(); // Fermer la connexion SSE lors du démontage du composant
    };
  }, [id]);

  // Charger les notifications existantes
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/sensors/alerts/${id}`);
        console.log("New alert received1", response);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des notifications");
        }
        const data = await response.json();
        console.log("New alert received:", data);
        setNotifications(data);
        setNotificationCount(data.length);
      } catch (error) {
        console.error("Erreur :", error);
      }
    };

    fetchNotifications();
  }, [id]);

  // Gestion de la barre de navigation transparente
  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(null);

  // Supprimer une notification
  const handleDeleteNotification = async (alertId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/sensors/alerts/${alertId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la notification");
      }

      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== alertId)
      );
      setNotificationCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  console.log("Rendering notifications:", notifications); // Vérifiez les données

  // Rendu du menu des notifications
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      {notifications.map((notification) => (
        <MenuItem key={notification.id} onClick={handleCloseMenu}>
          <NotificationItem
            image={<img src={team2 || "/placeholder.svg"} alt="person" />}
            title={[notification.type, notification.message]}
            date={new Date(notification.created_at).toLocaleString()}
          />
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNotification(notification.id);
            }}
          >
            <Icon>delete</Icon>
          </IconButton>
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <>
      <RealtimeAlert idChild={id} onNewAlert={handleNewAlert} />
      <AppBar
        position={absolute ? "absolute" : navbarType}
        color="inherit"
        sx={(theme) => navbar(theme, { transparentNavbar, absolute, light })}
      >
        <Toolbar sx={(theme) => navbarContainer(theme)}>
          <VuiBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
            <Breadcrumbs icon="home" title={pageTitle} route={route} light={light} />
          </VuiBox>
          {isMini ? null : (
            <VuiBox sx={(theme) => navbarRow(theme, { isMini })}>
              <VuiBox pr={1}>
                <VuiInput
                  placeholder="Type here..."
                  icon={{ component: "search", direction: "left" }}
                  sx={({ breakpoints }) => ({
                    [breakpoints.down("sm")]: {
                      maxWidth: "80px",
                    },
                    [breakpoints.only("sm")]: {
                      maxWidth: "80px",
                    },
                    backgroundColor: "info.main !important",
                  })}
                />
              </VuiBox>
              <VuiBox color={light ? "white" : "inherit"}>
                <Link to="/authentication/sign-in">
                  <IconButton sx={navbarIconButton} size="small">
                    <Icon
                      sx={({ palette: { dark, white } }) => ({
                        color: light ? white.main : dark.main,
                      })}
                    >
                      account_circle
                    </Icon>
                    <VuiTypography variant="button" fontWeight="medium" color={light ? "white" : "dark"}>
                      Sign in
                    </VuiTypography>
                  </IconButton>
                </Link>
                <IconButton size="small" color="inherit" sx={navbarMobileMenu} onClick={handleMiniSidenav}>
                  <Icon className={"text-white"}>{miniSidenav ? "menu_open" : "menu"}</Icon>
                </IconButton>
                <IconButton size="small" color="inherit" sx={navbarIconButton} onClick={handleConfiguratorOpen}>
                  <Icon>settings</Icon>
                </IconButton>
                <IconButton
                  size="small"
                  color="inherit"
                  sx={navbarIconButton}
                  aria-controls="notification-menu"
                  aria-haspopup="true"
                  onClick={handleOpenMenu}
                >
                  <Badge badgeContent={notificationCount} color="error">
                    <Icon className={light ? "text-white" : "text-dark"}>notifications</Icon>
                  </Badge>
                </IconButton>
                {renderMenu()}
              </VuiBox>
            </VuiBox>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  id: PropTypes.string,
};

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
  id: null,
};

export default DashboardNavbar;