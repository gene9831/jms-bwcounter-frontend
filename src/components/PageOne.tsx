import {
  Container,
  createStyles,
  Grid,
  makeStyles,
  Paper,
  styled,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import React from "react";
import { Line, Pie } from "react-chartjs-2";
import "chartjs-plugin-datalabels";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import { BwCounterData } from "../types";

const roundTo = (value: number, n: number) => {
  return parseFloat(value.toFixed(n));
};

const MyFiberManualRecordIcon = styled(FiberManualRecordIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginRight: theme.spacing(1),
}));

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    piePaper: {
      padding: theme.spacing(1),
      height: 250,
    },
    barPaper: {
      padding: theme.spacing(1),
      height: 500,
    },
  })
);

const generaterPieData = (bwCounterData: BwCounterData) => {
  return {
    labels: ["已用流量", "剩余流量"],
    datasets: [
      {
        label: "流量饼状视图",
        data: [bwCounterData.bw_counter_b, bwCounterData.monthly_bw_limit_b - bwCounterData.bw_counter_b],
        backgroundColor: ["#ff4081", "#ffb74d"],
      },
    ],
  };
};

const generaterPieOptions = (downLg: boolean) => {
  return {
    maintainAspectRatio: false,
    legend: {
      position: downLg ? "top" : "left",
    },
    plugins: {
      datalabels: {
        color: "#fff",
        formatter: (value: number) => {
          return `${value} G`;
        },
        font: {
          size: 14,
        },
      },
    },
  };
};

const generaterBarData = (bwCounterData: BwCounterData[]) => {
  return {
    labels: bwCounterData.map((item) => item.update_time).map((item) => `${new Date(item).getHours()}:00`),
    datasets: [
      {
        label: "已用流量",
        backgroundColor: "rgb(63,81,181)",
        borderColor: "rgb(63,81,181,0.5)",
        data: bwCounterData.map((item) => item.bw_counter_b),
        fill: false,
      },
      {
        label: "小时流量",
        backgroundColor: "rgb(245,0,87)",
        borderColor: "rgb(245,0,87,0.5)",
        data: bwCounterData.map((item) => (item.bw_adjacent_diff_b > 0 ? item.bw_adjacent_diff_b : 0)),
        fill: false,
      },
    ],
  };
};

const generaterBarOptins = (bwCounterData: BwCounterData) => {
  return {
    maintainAspectRatio: false,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            // max: bwCounterData.monthly_bw_limit_b,
            min: 0,
          },
        },
      ],
    },
    plugins: {
      datalabels: {
        display: false,
      },
    },
  };
};

interface PageOneProps {
  data: BwCounterData[];
}

// const initComputed: BwCounterData[] = [];

export default function PageOne(props: PageOneProps) {
  const { data } = props;
  const classes = useStyles();
  // const [computed, setComputed] = useState(initComputed);

  const theme = useTheme();
  const downLg = useMediaQuery(theme.breakpoints.down("lg"));

  const computed: BwCounterData[] = React.useMemo(
    () =>
      data
        .map((item) => ({
          ...item,
          bw_counter_b: roundTo(item.bw_counter_b / 1000 / 1000 / 1000, 2),
          monthly_bw_limit_b: roundTo(item.monthly_bw_limit_b / 1000 / 1000 / 1000, 2),
        }))
        .map((item, index, arr) => ({
          ...item,
          bw_adjacent_diff_b: index === 0 ? 0 : roundTo(item.bw_counter_b - arr[index - 1].bw_counter_b, 2),
        })),
    [data]
  );

  const pieOptions = React.useMemo(() => generaterPieOptions(downLg), [downLg]);

  const latestData: BwCounterData | undefined = React.useMemo(() => {
    if (computed.length > 0) {
      return computed.slice(-1)[0];
    } else {
      return;
    }
  }, [computed]);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper style={{ padding: theme.spacing(1) }}>
                <Typography
                  variant="body1"
                  style={{ color: "rgba(0, 0, 0, 0.54)", display: "flex", alignItems: "center" }}
                >
                  <MyFiberManualRecordIcon style={{ fontSize: "0.75rem" }} />
                  本月流量：<b>{`${latestData?.bw_counter_b}/`}</b>
                  <b>{`${latestData?.monthly_bw_limit_b} GB`}</b>
                </Typography>
                <Typography
                  variant="body1"
                  style={{ color: "rgba(0, 0, 0, 0.54)", display: "flex", alignItems: "center" }}
                >
                  <MyFiberManualRecordIcon style={{ fontSize: "0.75rem" }} />
                  流量重置日：每月<b>{latestData?.bw_reset_day_of_month}</b>日
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={2} className={classes.piePaper}>
                {latestData ? <Pie data={generaterPieData(latestData)} options={pieOptions} /> : null}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper elevation={2} className={classes.barPaper}>
            {latestData ? <Line data={generaterBarData(computed)} options={generaterBarOptins(latestData)} /> : null}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
