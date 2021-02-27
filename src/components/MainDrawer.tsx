import React, { useEffect, useState } from "react";
import clsx from "clsx";
import AppBar from "@material-ui/core/AppBar";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuIcon from "@material-ui/icons/Menu";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme, Theme, createStyles } from "@material-ui/core/styles";
import { CalendarToday } from "./Icons";
import DashboardIcon from "@material-ui/icons/Dashboard";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import PageOne from "./PageOne";
import Axios from "axios";
import { BwCounterData } from "../types";
import { bwCounterApi } from "../config";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    drawer: {
      [theme.breakpoints.up("sm")]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    appBar: {
      [theme.breakpoints.up("sm")]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        display: "none",
      },
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      boxSizing: "border-box",
      width: drawerWidth,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    title: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(1, 2),
    },
  })
);

const pageOne: {
  text: string;
  Icon: Function;
  Comp: Function;
} = {
  text: "流量视图",
  Icon: CalendarToday,
  Comp: PageOne,
};

const initBwCounterDataArray: BwCounterData[] = [];

export default function MainDrawer() {
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subPageIndex, setSubPageIndex] = useState(0);
  const [bwCounterDataArray, setBwCounterDataArray] = useState(initBwCounterDataArray);

  const isMobileDevice = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleClickSubItem = (index: number) => {
    setSubPageIndex(index);

    if (isMobileDevice) {
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await Axios.get(bwCounterApi);
      setBwCounterDataArray(
        result.data.data.reverse().map((item: BwCounterData) => ({ ...item, bw_adjacent_diff_b: 0 }))
      );
    };
    fetchData();
  }, []);

  const drawer = (
    <div>
      <div className={clsx(classes.toolbar, classes.title)}>
        <ListItemIcon style={{ minWidth: theme.spacing(4) }}>
          <DashboardIcon />
        </ListItemIcon>
        <Typography variant="h6">JMS 流量统计</Typography>
      </div>
      <Divider />
      <List>
        <ListItem button key={0} selected={0 === subPageIndex} onClick={() => handleClickSubItem(0)}>
          <ListItemIcon>
            {(() => {
              const Icon = pageOne.Icon;
              return <Icon />;
            })()}
          </ListItemIcon>
          <ListItemText primary={pageOne.text}></ListItemText>
        </ListItem>
      </List>
    </div>
  );

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {pageOne.text}
          </Typography>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden smUp>
          <Drawer
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden smDown>
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {(() => {
          if (subPageIndex === 0) {
            const PageComp = pageOne.Comp;
            return <PageComp data={bwCounterDataArray} />;
          }
        })()}
      </main>
    </div>
  );
}
