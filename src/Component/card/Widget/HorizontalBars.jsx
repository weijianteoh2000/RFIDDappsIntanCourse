import * as React from "react";
import { BarChart, Bar } from "@mui/x-charts/BarChart";
import { Tooltip } from "@mui/material"; // Or whichever tooltip library you're using

export function HorizontalBars({ dailyMovement }) {
  // Preprocess data to ensure integer counts
  const processedData = dailyMovement.map((item) => ({
    ...item,
    count: Math.round(item.count),
  }));

  // Calculate max for the x-axis range
  const counts = processedData.map((item) => item.count);
  const maxCount = Math.max(...counts);
  console.log(processedData);

  return (
    <BarChart
      width={500}
      height={400}
      dataset={processedData}
      xAxis={[ 
        {
          scaleType: "band", // For band scale on x-axis (categorical data)
          dataKey: "location",
          label: "Lokasi",
          bandPadding: 0.2, // Add some padding to avoid overlap
        },
      ]}
      yAxis={[ 
        {
          scaleType: "linear", // For continuous scale on y-axis
          dataKey: "count",
          label: "Bilangan Pergerakan",
          min: 0, // Explicitly set the y-axis to start from 0
          max: maxCount,
          tickLabelInterval: (value) => Number.isInteger(value), // Display only integer ticks
          valueFormatter: (value) => value.toFixed(0), // Ensure integer formatting
          tickPlacement: "inside", // Optional: Adjust tick placement
          tickLabelPlacement: "middle", // Optional: Center tick labels
        },
      ]}
      series={[ 
        {
          dataKey: "count",
          label: "Pergerakan Harian",
          // Customizing the bars to show values on top
          // label: ({ x, y, value }) => (
          //   <text x={x} y={y - 10} textAnchor="middle" fill="#000" fontSize={12}>
          //     {value}
          //   </text>
          // ),
        },
      ]}
      layout="vertical" // Change layout to vertical
      tooltip={({ active, payload }) => {
        if (active && payload && payload.length) {
          const { location, count } = payload[0].payload;
          return (
            <Tooltip>
              <div>{`${location}: ${count}`}</div>
            </Tooltip>
          );
        }
        return null;
      }}
    />
  );
}
