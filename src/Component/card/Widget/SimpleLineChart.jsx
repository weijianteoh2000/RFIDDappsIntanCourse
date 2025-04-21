import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";

export function SimpleLineChart(popUpProps) {
  const { dates } = popUpProps;
  const chartData = dates.map((dateObj) => ({
    x: dateObj.date,
    y: dateObj.value,
  }));
  chartData.reverse();

  return (
    <LineChart
      width={1000}
      height={500}
      series={[
        {
          curve: "linear",
          data: chartData.map((d) => d.y),
          label: "Pergerakan Harian",
        },
      ]}
      xAxis={[
        { scaleType: "point", data: chartData.map((d) => d.x), label: "Date" },
      ]}
      yAxis={[{ scaleType: "linear", label: "Bilangan Pergerakan" }]}
    />
  );
}
