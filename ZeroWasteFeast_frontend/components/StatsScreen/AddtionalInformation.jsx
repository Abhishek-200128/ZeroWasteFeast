import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Svg, {
  Text as SvgText,
  G,
  Polygon,
  Line,
  Circle,
  Path,
} from "react-native-svg";
import * as d3 from "d3";
import { Ionicons } from "@expo/vector-icons";
import jsonData from "../../data/basic_food.json";
import changeData from "../../data/change.json";
import { Feather } from "@expo/vector-icons";

// Utility functions
const generateColors = (numColors) =>
  Array.from(
    { length: numColors },
    () => `hsl(${Math.random() * 360}, 70%, 60%)`
  );

const processData = (data) => {
  const labels = Object.keys(data[0]).slice(2);
  const datasets = data.map((item) => ({
    label: item["Food item "].trim(),
    values: labels.map((year) => ({
      year,
      value: parseFloat(item[year]),
    })),
  }));
  return { labels, datasets };
};

const processChangeData = (data) =>
  data.map((item) => ({
    foodGroup: item["Food group"],
    annualChange: parseFloat(item["Annual change to 2022-23 (%)"]),
    fiveYearChange: parseFloat(item["Five-year change to 2022-23 (%)"]),
  }));

const AdditionalInformation = ({ closeModal }) => {
  const [chartData, setChartData] = useState(null);
  const [changeChartData, setChangeChartData] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [datasetColors, setDatasetColors] = useState([]);
  const [showLineDescription, setShowLineDescription] = useState(false);
  const [showRadarDescription, setShowRadarDescription] = useState(false);
  const [showDataSources, setShowDataSources] = useState(false);
  const [radarColors, setRadarColors] = useState({
    annual: "rgba(0, 123, 255, 0.7)",
    fiveYear: "rgba(255, 99, 132, 0.7)",
  });
  const scrollViewRef = useRef(null);

  useEffect(() => {
    try {
      const { labels, datasets } = processData(jsonData);
      setChartData({ labels, datasets });
      setDatasetColors(generateColors(datasets.length));
      setChangeChartData(processChangeData(changeData));
    } catch (error) {
      console.error("Error processing data:", error);
    }
  }, []);

  const handleDataPointPress = (type, data, x, y) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.measure((fx, fy, width, height, px, py) => {
        setActiveTooltip(
          activeTooltip && activeTooltip.data === data
            ? null
            : {
                type,
                data,
                x,
                y: y + py,
              }
        );
      });
    }
  };

  if (!chartData || !changeChartData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get("window").width;
  const graphWidth = screenWidth - 40;
  const graphHeight = 250;
  const margin = { top: 20, right: 30, bottom: 50, left: 50 };

  const xScale = d3
    .scalePoint()
    .domain(chartData.labels)
    .range([0, graphWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(chartData.datasets.flatMap((d) => d.values.map((v) => v.value))),
    ])
    .range([graphHeight, 0]);

  const radarRadius = screenWidth / 2 - 40;
  const radarCenterX = screenWidth / 2;
  const radarCenterY = radarRadius + 20;

  const calculateRadarPoints = (data, scale) => {
    const total = data.length;
    return data.map((d, i) => {
      const angle = (Math.PI * 2 * i) / total;
      return {
        x: radarCenterX + Math.cos(angle) * scale(d),
        y: radarCenterY + Math.sin(angle) * scale(d),
        data: d,
      };
    });
  };

  const maxChange = d3.max(
    changeChartData.flatMap((d) => [d.annualChange, d.fiveYearChange])
  );
  const radarScale = d3
    .scaleLinear()
    .domain([0, maxChange])
    .range([0, radarRadius]);

  const annualChangePoints = calculateRadarPoints(
    changeChartData.map((d) => d.annualChange),
    radarScale
  );
  const fiveYearChangePoints = calculateRadarPoints(
    changeChartData.map((d) => d.fiveYearChange),
    radarScale
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollContainer}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="flex-1"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={styles.mainTitle}
        >
          Australian Food Consumption{" "}
        </Text>
        <Feather
          name="chevron-down"
          size={32}
          color="#4A5568"
          onPress={closeModal}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Food Consumption Trends</Text>
        <LineChart
          graphWidth={graphWidth}
          graphHeight={graphHeight}
          margin={margin}
          xScale={xScale}
          yScale={yScale}
          chartData={chartData}
          datasetColors={datasetColors}
          handleDataPointPress={handleDataPointPress}
        />
        <Legend data={chartData.datasets} colors={datasetColors} />
        <TouchableOpacity
          style={styles.descriptionToggle}
          onPress={() => setShowLineDescription(!showLineDescription)}
        >
          <Text style={styles.descriptionToggleText}>
            {showLineDescription ? "Hide" : "Show"} Description
          </Text>
          <Ionicons
            name={showLineDescription ? "chevron-up" : "chevron-down"}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>
        {showLineDescription && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Key Points:</Text>
            <View style={styles.descriptionList}>
              <Text style={styles.descriptionPoint}>
                • Visualizes Australian food consumption trends from 2018 to
                2023
              </Text>
              <Text style={styles.descriptionPoint}>
                • Each line represents average serves consumed per person
              </Text>
              <Text style={styles.descriptionPoint}>
                • Allows comparison of consumption patterns over time
              </Text>
              <Text style={styles.descriptionPoint}>
                • Shows differences between various food categories
              </Text>
              <Text style={styles.descriptionPoint}>
                • Helps identify changing dietary habits in Australia
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Food Group Changes</Text>
        <RadarChart
          screenWidth={screenWidth}
          radarRadius={radarRadius}
          radarCenterX={radarCenterX}
          radarCenterY={radarCenterY}
          changeChartData={changeChartData}
          annualChangePoints={annualChangePoints}
          fiveYearChangePoints={fiveYearChangePoints}
          radarColors={radarColors}
          handleDataPointPress={handleDataPointPress}
        />
        <Legend
          data={[{ label: "Annual Change" }, { label: "Five-Year Change" }]}
          colors={[radarColors.annual, radarColors.fiveYear]}
        />
        <TouchableOpacity
          style={styles.descriptionToggle}
          onPress={() => setShowRadarDescription(!showRadarDescription)}
        >
          <Text style={styles.descriptionToggleText}>
            {showRadarDescription ? "Hide" : "Show"} Description
          </Text>
          <Ionicons
            name={showRadarDescription ? "chevron-up" : "chevron-down"}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>
        {showRadarDescription && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Key Points:</Text>
            <View style={styles.descriptionList}>
              <Text style={styles.descriptionPoint}>
                • Illustrates changes in apparent consumption by weight for food
                groups
              </Text>
              <Text style={styles.descriptionPoint}>
                • Compares annual changes to five-year changes up to 2022-23
              </Text>
              <Text style={styles.descriptionPoint}>
                • Provides a comprehensive view of food group consumption
                evolution
              </Text>
              <Text style={styles.descriptionPoint}>
                • Allows easy identification of trends in dietary habits
              </Text>
              <Text style={styles.descriptionPoint}>
                • Highlights differences between short-term and long-term
                consumption changes
              </Text>
            </View>
          </View>
        )}
      </View>

      {activeTooltip && <Tooltip tooltip={activeTooltip} />}
    </ScrollView>
  );
};

const LineChart = ({
  graphWidth,
  graphHeight,
  margin,
  xScale,
  yScale,
  chartData,
  datasetColors,
  handleDataPointPress,
}) => {
  const lineGenerator = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.value));

  return (
    <Svg
      width="100%"
      height={graphHeight + margin.top + margin.bottom}
      viewBox={`0 0 ${graphWidth + margin.left + margin.right} ${
        graphHeight + margin.top + margin.bottom
      }`}
    >
      <G x={margin.left} y={margin.top}>
        <SvgText
          x={graphWidth / 2}
          y={graphHeight + 40}
          textAnchor="middle"
          fontSize="12"
          fill="#666"
        >
          Years
        </SvgText>
        {chartData.labels.map((label, index) => (
          <SvgText
            key={index}
            x={xScale(label)}
            y={graphHeight + 20}
            fontSize="10"
            textAnchor="middle"
            fill="#666"
          >
            {label}
          </SvgText>
        ))}

        <SvgText
          x={-30}
          y={graphHeight / 2}
          textAnchor="middle"
          fontSize="12"
          fill="#666"
          transform={`rotate(-90, -30, ${graphHeight / 2})`}
        >
          Serves
        </SvgText>
        {yScale.ticks(5).map((tick, index) => (
          <G key={index}>
            <Line
              x1={0}
              y1={yScale(tick)}
              x2={graphWidth}
              y2={yScale(tick)}
              stroke="#e0e0e0"
              strokeWidth={1}
            />
            <SvgText
              x={-10}
              y={yScale(tick)}
              fontSize="10"
              textAnchor="end"
              fill="#666"
            >
              {tick}
            </SvgText>
          </G>
        ))}

        {chartData.datasets.map((dataset, datasetIndex) => (
          <G key={datasetIndex}>
            <Path
              d={lineGenerator(dataset.values)}
              fill="none"
              stroke={datasetColors[datasetIndex]}
              strokeWidth={2}
            />
            {dataset.values.map((d, i) => (
              <Circle
                key={i}
                cx={xScale(d.year)}
                cy={yScale(d.value)}
                r={4}
                fill={datasetColors[datasetIndex]}
                onPress={(event) => {
                  if (event && event.nativeEvent) {
                    handleDataPointPress(
                      "line",
                      { ...d, label: dataset.label },
                      event.nativeEvent.locationX,
                      event.nativeEvent.locationY
                    );
                  }
                }}
              />
            ))}
          </G>
        ))}
      </G>
    </Svg>
  );
};

const RadarChart = ({
  screenWidth,
  radarRadius,
  radarCenterX,
  radarCenterY,
  changeChartData,
  annualChangePoints,
  fiveYearChangePoints,
  radarColors,
  handleDataPointPress,
}) => {
  const levels = 5;
  const maxValue = Math.max(
    d3.max(changeChartData, (d) => Math.abs(d.annualChange)),
    d3.max(changeChartData, (d) => Math.abs(d.fiveYearChange))
  );

  const angleSlice = (Math.PI * 2) / changeChartData.length;

  const rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radarRadius]);

  const getPathCoordinates = (dataPoints) => {
    return dataPoints.map((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      return {
        x: radarCenterX + rScale(Math.abs(d)) * Math.cos(angle),
        y: radarCenterY + rScale(Math.abs(d)) * Math.sin(angle),
        value: d,
      };
    });
  };

  const annualPath = getPathCoordinates(
    changeChartData.map((d) => d.annualChange)
  );
  const fiveYearPath = getPathCoordinates(
    changeChartData.map((d) => d.fiveYearChange)
  );

  return (
    <Svg
      width="100%"
      height={radarRadius * 2 + 40}
      viewBox={`0 0 ${screenWidth} ${radarRadius * 2 + 40}`}
    >
      <G>
        {/* Circular grid */}
        {[...Array(levels)].map((_, i) => (
          <Circle
            key={i}
            cx={radarCenterX}
            cy={radarCenterY}
            r={((i + 1) * radarRadius) / levels}
            stroke="#e0e0e0"
            strokeWidth={1}
            fill="none"
          />
        ))}

        {/* Axis lines */}
        {changeChartData.map((_, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          return (
            <Line
              key={i}
              x1={radarCenterX}
              y1={radarCenterY}
              x2={radarCenterX + radarRadius * Math.cos(angle)}
              y2={radarCenterY + radarRadius * Math.sin(angle)}
              stroke="#e0e0e0"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis labels */}
        {changeChartData.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const labelRadius = radarRadius + 20;
          return (
            <SvgText
              key={i}
              x={radarCenterX + labelRadius * Math.cos(angle)}
              y={radarCenterY + labelRadius * Math.sin(angle)}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
              alignmentBaseline="central"
            >
              {d.foodGroup}
            </SvgText>
          );
        })}

        {/* Data polygons */}
        <Polygon
          points={annualPath.map((p) => `${p.x},${p.y}`).join(" ")}
          fill={radarColors.annual}
          fillOpacity={0.3}
          stroke={radarColors.annual}
          strokeWidth={2}
        />
        <Polygon
          points={fiveYearPath.map((p) => `${p.x},${p.y}`).join(" ")}
          fill={radarColors.fiveYear}
          fillOpacity={0.3}
          stroke={radarColors.fiveYear}
          strokeWidth={2}
        />

        {/* Data points */}
        {annualPath.map((point, index) => (
          <Circle
            key={`annual-${index}`}
            cx={point.x}
            cy={point.y}
            r={5}
            fill={radarColors.annual}
            onPress={() =>
              handleDataPointPress(
                "radar",
                {
                  label: "Annual Change",
                  value: point.value,
                  foodGroup: changeChartData[index].foodGroup,
                },
                point.x,
                point.y
              )
            }
          />
        ))}
        {fiveYearPath.map((point, index) => (
          <Circle
            key={`fiveYear-${index}`}
            cx={point.x}
            cy={point.y}
            r={5}
            fill={radarColors.fiveYear}
            onPress={() =>
              handleDataPointPress(
                "radar",
                {
                  label: "Five-Year Change",
                  value: point.value,
                  foodGroup: changeChartData[index].foodGroup,
                },
                point.x,
                point.y
              )
            }
          />
        ))}
      </G>
    </Svg>
  );
};

const Legend = ({ data, colors }) => (
  <View style={styles.legendContainer}>
    {data.map((item, index) => (
      <View key={index} style={styles.legendItem}>
        <View
          style={[styles.legendColor, { backgroundColor: colors[index] }]}
        />
        <Text style={styles.legendText}>{item.label}</Text>
      </View>
    ))}
  </View>
);

const Tooltip = ({ tooltip }) => {
  return (
    <View
      style={[
        styles.tooltip,
        {
          position: "absolute",
          left: tooltip.x,
          top: tooltip.y,
          transform: [{ translateX: -50 }, { translateY: -100 }],
        },
      ]}
    >
      <Text style={styles.tooltipText}>{`${tooltip.data.label}`}</Text>
      {tooltip.type === "line" && (
        <>
          <Text style={styles.tooltipText}>{`Year: ${tooltip.data.year}`}</Text>
          <Text
            style={styles.tooltipText}
          >{`Value: ${tooltip.data.value}`}</Text>
        </>
      )}
      {tooltip.type === "radar" && (
        <>
          <Text
            style={styles.tooltipText}
          >{`Food Group: ${tooltip.data.foodGroup}`}</Text>
          <Text
            style={styles.tooltipText}
          >{`Value: ${tooltip.data.value}`}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 7,
    paddingBottom: 40,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  description: {
    fontSize: 16,
    paddingHorizontal: 10,
    textAlign: "left",
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    paddingHorizontal: 10,
    paddingTop: 10,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    marginRight: 8,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#666",
  },
  tooltip: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 5,
    maxWidth: 200,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
  },
  descriptionToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  descriptionToggleText: {
    fontSize: 16,
    color: "#007AFF",
    marginRight: 5,
  },
  descriptionContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  descriptionList: {
    marginLeft: 10,
  },
  descriptionPoint: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
});

export default AdditionalInformation;
