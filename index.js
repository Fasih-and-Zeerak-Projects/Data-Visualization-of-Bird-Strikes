// javascript
"use strict";
let airportName = "Airport Name";
let aircraftMake = "Aircraft Make Model";
let effectAmountOfDamage = "Effect Amount of damage";
let flightDate = "Flight Date";
let aircraftAirlineOperator = "Aircraft Airline Operator";
let originState = "Origin State";
let phaseOfFlight = "Phase of flight";
let wildlifeSize = "Wildlife Size";
let wildlifeSpecies = "Wildlife Species";
let timeOfDay = "Time of day";
let costOther = "Cost Other";
let costRepair = "Cost Repair";
let costTotal = "Cost Total $";
let speedIASInKnots = "Speed IAS in knots";

let globalData = [];

let selectedState = [];
let trendDataArrGlobal = [];
let globalTreeRoot;

let stateWisefrequencyPreference = false;
let preferedState = "Ohio";

// let selectedAirports = [];

let selectedDataYears = [];

let forceDirectedNodesGlobal;

d3.csv("birdstrikes.csv", function (data) {
  globalData.push(data);
}).then(() => {
  // console.log(globalData);
  initZoom();
  // barchartSvg(globalData);
  // trendSVG(globalData);
  hierarchySvg(globalData);
  forceDirectedLayout(globalData);
  yearBarChart(globalData);
  // costBarchartSvg(globalData);
  // brush(globalData);
  diagram3SVG(globalData);
});

let zoom = d3.zoom().on("zoom", handleZoom);
let zoomTrend = d3.zoom().on("zoom", handleZoomTrend);
// .translateExtent([0, 0], [320, 670]);
let zoomBarChart = d3.zoom().on("zoom", handleZoomBarChart);
let zoomForce = d3.zoom().on("zoom", handleForceZoom);

function handleForceZoom(e) {
  d3.select(".force").attr("transform", e.transform);
}

function handleZoomTrend(e) {
  d3.select(".diagram3 > g").attr("transform", e.transform);
  console.log(e.transform);
}

function handleZoom(e) {
  d3.select(".diagram4 > g").attr("transform", e.transform);
}

function handleZoomBarChart(e) {
  d3.select(".diagram1 > g").attr("transform", e.transform);
}

function initZoom() {
  // d3.select(".diagram1").call(zoomBarChart);
  d3.select(".diagram3").call(zoomTrend);
  d3.select(".diagram4").call(zoom);
  d3.select(".diagram2").call(zoomForce);

  d3.select(".diagram3").call(zoomTrend.scaleBy, 0.9);
}

// d3.select(".diagram4").call(zoom);

// let d3TreeLayout = d3.tree().size([600, 380]).nodeSize([10, 150]);

let d3TreeLayout = d3.cluster().size([360, 8400]);

//todo: updated
function hierarchySvg(data) {
  let diagram4 = d3.select(".diagram4");

  let groupedData = d3.rollup(
    data,
    calculateLeafValue,
    (d) => {
      return d[originState];
    },
    (d) => {
      return d[airportName];
    },
    (d) => {
      return d[flightDate];
    }
  );
  // console.log(groupedData);

  let root = d3.hierarchy(groupedData);
  // console.log(root);
  root.sum(function (d) {
    return d[1];
  });

  let radius = 4;

  globalTreeRoot = root;

  d3TreeLayout(root);

  var nodeIsSelected = 0;
  let lastSelected = [];

  //tooltip 1
  let t1 = diagram4
    .select(".d4g")
    .append("text")
    .attr("class", "tree-tooltip1")
    .attr("x", 8500)
    .attr("y", 500);

  let text2 = diagram4
    .select(".d4g")
    .append("text")
    .attr("class", "tree-tooltip2")
    .attr("x", 8500)
    .attr("y", 500 + 1000);

  let treeNodes = d3
    .select(".treeNode")
    .selectAll("circle")
    .data(root.descendants())
    .join("circle")
    .classed("treeNodeCircle", true)
    .attr("cx", function (d) {
      return 0;
    })
    .attr("cy", function (d) {
      return -d.y;
    })
    .attr("transform", (d) => `rotate(${d.x}, 0, 0)`)
    .attr("r", (d) => {
      let r = 4;
      if (d.height > 0) {
        r = radius + d.height * 50;
      }
      d.setHeight = r;
      d.childrenSum = 0;

      let sum = 0;
      if (d.height == 1) {
        let children = d.children;
        // console.log(children);
        children.forEach((element) => {
          sum += element.data[1];
        });
        d.childrenSum = sum;
      }

      if (d.height == 2) {
        // added code here
        // console.log(d);
        if (d.children != undefined) {
          let children = d.children;
          let sum = 0;
          children.forEach((c) => {
            let gChild = c.children;
            gChild.forEach((b) => {
              sum += b.data[1];
            });
          });
          d.childrenSum = sum;
        }
      }

      if (d.height == 2) {
        // added code here
        // console.log(d);
        if (d.children != undefined) {
          let children = d.children;
          let sum = 0;
          children.forEach((c) => {
            if (c.children != undefined) {
              let gChild = c.children;
              gChild.forEach((b) => {
                sum += b.data[1];
              });
            }
          });
          d.childrenSum = sum;
        }
      }
      if (d.height == 3) {
        if (d.children != undefined) {
          let children = d.children;
          let sum = 0;
          children.forEach((c) => {
            if (c.children != undefined) {
              let gChild = c.children;
              gChild.forEach((b) => {
                if (b.children != undefined) {
                  let ggChild = b.children;
                  ggChild.forEach((a) => {
                    sum += a.data[1];
                  });
                }
              });
            }
          });
          d.childrenSum = sum;
        }
      }
      return r;
    })
    .attr("fill", (d) => {
      let colors = ["#250001", "#27187e", "#82a3a1", "#f4ac45"];
      // colors.reverse();
      d.setColor = colors[d.height];
      d.isSelected = false;
      return d.setColor;
    })
    .on("mouseover", function (event, d) {
      // svg.select(".tooltip").text(d.data.name);
      // console.log(event.clientX + "," + event.clientY);

      if (nodeIsSelected == 0) {
        let text = "";
        if (d.height === 0) {
          text = "Date: " + d.data[0];
          text2.text(" Frequency: " + d.data[1]);
        } else if (d.height === 1) {
          text = "Airport: " + d.data[0];
          text2.text(" Frequency: " + d.childrenSum);
        } else if (d.height === 2) {
          text = "State: " + d.data[0];
          console.log(d.childrenSum);
          text2.text("Frequency: " + d.childrenSum);
          // text2.text(" Frequency: " + d.childrenSum);
        } else {
          text = "Total Data";
          text2.text("Frequency: " + d.childrenSum);
          // text2.text(" Frequency: " + d.childrenSum);
        }

        t1.text(text);
      }

      d3.select(this).style("fill", "red");
      d3.select(this).style("r", d.setHeight + (50 * d.height + 2));
    })
    .on("mouseout", function (event, d) {
      // svg.select(".tooltip").text(d.data.name);
      if (d.isSelected == false) {
        d3.select(this).style("fill", d.setColor);
        d3.select(this).style("r", d.setHeight);
      }
    })
    .on("click", function (e, d) {
      let cur = d3.select(this);
      console.log(d);
      d.isSelected = !d.isSelected;
      if (d.isSelected === false) {
        nodeIsSelected--;
        cur.style("fill", d.setColor);
        let temp = [];
        for (let i = 0; i < selectedState.length; i++) {
          if (d.data[0] == selectedState[i]) continue;
          temp.push(selectedState[i]);
        }
        let diagram1 = d3.select(".diagram1");
        diagram1.select(".d1g").remove();
        diagram1.append("g").attr("class", "d1g");
        selectedState = temp;
        if (selectedState.length === 0) {
          preferedState = "";
          stateWisefrequencyPreference = false;
        } else {
          preferedState = selectedState.pop();
          stateWisefrequencyPreference = true;
        }
        yearBarChart(globalData);
        updateTrendSelection();
        updateForceDirected();
        // if (d.height === 0) cur.attr("r", d.setHeight);
      } else {
        cur.style("fill", "red");
        // if (d.height === 0) cur.attr("r", 20);
        d.isSelected = true;
        setNodeText(d);
        nodeIsSelected++;
        if (d.height === 2) {
          preferedState = d.data[0];
          stateWisefrequencyPreference = true;
          let diagram1 = d3.select(".diagram1");
          diagram1.select(".d1g").remove();
          diagram1.append("g").attr("class", "d1g");
          // call function to redraw timeline barchart
          yearBarChart(globalData);
          selectedState.unshift(d.data[0]);
          updateTrendSelection();
          updateForceDirected();
        }
      }
    });

  var radialLines = d3
    .lineRadial()
    .angle((d) => (d.x * Math.PI) / 180)
    .radius((d) => d.y);

  // console.log(root.links());

  d3.select(".link")
    .selectAll("line.link")
    .data(root.links())
    .join("path")
    .classed("link", true)
    .attr("d", (d) => {
      /*here*/
      return radialLines([d.source, d.target]);
    })
    .attr("stroke-width", (d) => {
      let width = 1;

      if (d.target.height > 0) {
        width = 1 + d.target.height * 20;
      }
      // console.log(width);
      return width;
    })
    .on("mouseover", function (event, d) {
      // svg.select(".tooltip").text(d.data.name);
      // d3.select(this).style("stroke-width", "5px");
      d3.select(this).style("stroke", "red");
    })
    .on("mouseout", function (event, d) {
      // svg.select(".tooltip").text(d.data.name);
      // d3.select(this).style("stroke-width", "1px");
      d3.select(this).style("stroke", "gray");
    });

  diagram4
    .select(".d4g")
    .append("text")
    .attr("class", "treeLegend")
    .attr("x", -10500 - 400)
    .attr("y", 500)
    .text("Root");

  diagram4
    .select(".d4g")
    .append("text")
    .attr("class", "treeLegend")
    .attr("x", -10500 - 400)
    .attr("y", 500 + 1250)
    .text("State");

  diagram4
    .select(".d4g")
    .append("text")
    .attr("class", "treeLegend")
    .attr("x", -10500 - 400)
    .attr("y", 500 + 1250 * 2)
    .text("Airport");

  diagram4
    .select(".d4g")
    .append("text")
    .attr("class", "treeLegend")
    .attr("x", -10500 - 400)
    .attr("y", 500 + 1250 * 3)
    .text("Frequency");

  diagram4
    .select(".d4g")
    .append("text")
    .attr("class", "treeLegend")
    .attr("x", -10500 - 2000)
    .attr("y", -1000)
    .text("Hierarchy");

  // diagram4
  //   .select(".d4g")
  //   .append("rect")
  //   .attr("fill", "#f4ac45")
  //   .attr("x", -11800 - 400)
  //   .attr("y", -200)
  //   .attr("width", 1000)
  //   .attr("height", 1000)
  //   .text("root");
  // "#250001", "#27187e", "#82a3a1"

  let colors = ["#250001", "#27187e", "#82a3a1", "#f4ac45"];
  diagram4
    .select(".d4g")
    .append("rect")
    .attr("fill", colors[3])
    .attr("x", -11800 - 400)
    .attr("y", -200)
    .attr("width", 1000)
    .attr("height", 1000);

  diagram4
    .select(".d4g")
    .append("rect")
    .attr("fill", colors[2])
    .attr("x", -11800 - 400)
    .attr("y", -200 + 1000 + 250)
    .attr("width", 1000)
    .attr("height", 1000);

  diagram4
    .select(".d4g")
    .append("rect")
    .attr("fill", colors[1])
    .attr("x", -11800 - 400)
    .attr("y", -200 + 2500)
    .attr("width", 1000)
    .attr("height", 1000);

  diagram4
    .select(".d4g")
    .append("rect")
    .attr("fill", colors[0])
    .attr("x", -11800 - 400)
    .attr("y", -200 + 2500 + 1250)
    .attr("width", 1000)
    .attr("height", 1000);
}

function updateTrendSelection() {
  let trendTooltipState = d3.select(".trend-tooltip1");
  let trendTooltipCost = d3.select(".trend-tooltip2");

  d3.select(".d3g")
    .selectAll("circle")
    .data(trendDataArrGlobal)
    .join("circle")
    .transition()
    .duration(250)
    .attr("fill", (d) => {
      for (let i = 0; i < selectedState.length; i++) {
        if (d[0] == selectedState[i]) {
          trendTooltipState.text("State: " + d[0]);
          trendTooltipCost.text("Cost: $" + d[1]);
          return "aqua";
        }
      }
      return d.setColor;
    })
    .attr("stroke", (d) => {
      for (let i = 0; i < selectedState.length; i++) {
        if (d[0] == selectedState[i]) return "black";
      }
      return d.setColor;
    })
    .attr("r", (d) => {
      for (let i = 0; i < selectedState.length; i++) {
        if (d[0] == selectedState[i]) return 8;
      }
      return 3;
    });
}

function updateTreeSelection() {
  // console.log(globalTreeRoot);
  let treeNodes = d3
    .selectAll(".treeNodeCircle")
    .data(globalTreeRoot.descendants())
    .join("treeNodeCircle")
    .style("fill", function (d) {
      if (d.height == 2) {
        let curState = d.data[0];
        for (let i = 0; i < selectedState.length; i++) {
          if (curState === selectedState[i]) {
            d3.select(".tree-tooltip1").text("State: " + d.data[0]);
            d3.select(".tree-tooltip2").text("");
            return "red";
          }
        }
      }
      if (d.height != 0) return d.setColor;
      for (let i = 0; i < selectedDataYears.length; i++) {
        // console.log(getDatefromString(d.data[0]).getFullYear());
        // console.log(selectedDataYears[i]);
        if (
          getDatefromString(d.data[0]).getFullYear() === selectedDataYears[i]
        ) {
          return "purple";
        }
      }

      return d.setColor;
    })
    .style("r", function (d) {
      if (d.height != 0) return d.setHeight;
      for (let i = 0; i < selectedDataYears.length; i++) {
        // console.log(getDatefromString(d.data[0]).getFullYear());
        // console.log(selectedDataYears[i]);
        if (getDatefromString(d.data[0]).getFullYear() === selectedDataYears[i])
          return 100;
      }
      return d.setHeight;
    });
  // hierarchySvg(globalData);
}

function trendSVG(data, type) {
  let totalWidth = 590;
  let totalHeight = 330;

  let margins = { top: 10, right: 20, left: 40, bottom: 20 },
    width = totalWidth - margins.left - margins.right,
    height = totalHeight - margins.top - margins.bottom;

  let svg = d3
    .select(".d3g")
    .append("g")
    .attr("transform", `translate(${margins.left + 20}, ${margins.top})`)
    .attr("class", "trendSVG");

  let trendSVGSelect = svg;

  let groupedData;

  if (type === 1)
    groupedData = d3.rollup(data, calculateCost, (d) => d[originState]);
  else if (type === 2)
    groupedData = d3.rollup(data, calculateCostRepair, (d) => d[originState]);
  else if (type === 3)
    groupedData = d3.rollup(data, calculateCostOther, (d) => d[originState]);

  let dataArr = [];
  dataArr = Array.from(groupedData);
  // console.log(dataArr);
  let statesArr = [];
  let costArr = [];
  for (let i = 0; i < dataArr.length; i++) {
    statesArr.push(dataArr[i][0]);
    costArr.push(dataArr[i][1]);
  }

  trendDataArrGlobal = dataArr;

  statesArr = Array.from(statesArr);
  // console.log(statesArr);
  // console.log(costArr);

  // console.log(Math.max(...costArr));
  let toAdd = 0;
  if (type === 1) toAdd = 1000000;
  else toAdd = 100000;

  let xScale = d3.scaleBand().domain(statesArr).range([0, width]);
  let yScale = d3
    .scaleLinear()
    .domain([Math.min(...costArr), Math.max(...costArr) + toAdd])
    .range([height, 0]);

  // console.log(yScale(10));

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "translate(-15,10) rotate(-90)")
    .style("text-anchor", "end");

  svg.append("g").call(d3.axisLeft(yScale));

  let colorScale = d3
    .scaleSequential()
    .domain([0, 28])
    .interpolator(d3.interpolateRgb("red", "blue"));

  // d3.select(".d3g")
  svg
    .append("text")
    .attr("class", "trend-tooltip1")
    // .attr("border", "1px silver")
    // .attr("background-color", "silver")
    .attr("x", width / 2)
    .attr("y", 50);

  // d3.select(".d3g")
  svg
    .append("text")
    .attr("class", "trend-tooltip2")
    // .style("border", "1px silver")
    // .style("background-color", "silver")
    .attr("x", width / 2)
    .attr("y", 50 + 20);

  // d3.select(".d3g")
  svg
    .append("text")
    .attr("class", "title")
    // .style("border", "1px silver")
    // .style("background-color", "silver")
    .attr("x", width / 2 - 50)
    .attr("y", 20)
    .text("Trend of costs per state");

  // d3.select(".d3g")
  svg
    .append("text")
    .attr("class", "label")
    // .style("border", "1px silver")
    // .style("background-color", "silver")
    .attr("x", width / 2 + 30)
    .attr("y", 380)
    .text("State");

  // d3.select(".d3g")
  svg
    .append("text")
    .attr("class", "label")
    // .style("border", "1px silver")
    // .style("background-color", "silver")
    .attr("x", 10)
    .attr("y", 20)
    .text("Cost$");

  let trendTooltipState = d3.select(".trend-tooltip1");
  let trendTooltipCost = d3.select(".trend-tooltip2");

  var nodeIsSelected = 0;

  // d3.select(".d3g")

  var line = d3
    .line()
    .x((d) => {
      return xScale(d[0]);
    })
    .y((d) => {
      return yScale(d[1]) + margins.top;
    })
    .curve(d3.curveMonotoneX);

  // dataArr.unshift(["Louisiana", 0]);

  svg
    .selectAll()
    .data(dataArr)
    .enter()
    .append("path")
    .transition()
    .duration(750)
    .attr("d", line(dataArr))
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("transform", "translate(10,-10)");

  svg
    .selectAll("circle")
    .data(dataArr)
    .join("circle")
    .attr("cx", (d) => {
      // console.log(xScale(d[0]));
      return xScale(d[0]);
    })
    .attr("cy", (d) => {
      // console.log(d[1]);
      // console.log(yScale(d[1]));
      return yScale(d[1]) + margins.top;
    })
    .attr("r", 3)
    .attr("stroke", (d) => {
      let state = d[0];
      let index = 0;
      for (let i = 0; i < statesArr.length; i++) {
        if (statesArr[i] === state) {
          index = i;
          break;
        }
      }
      d.setColor = colorScale(index);
      // console.log(colorScale(index));
      return "" + colorScale(index);
    })
    .attr("fill", (d) => {
      d.isSelected = false;
      return d.setColor;
      // return "" + colorScale(statesArr.findIndex(state));
    })
    .attr("transform", "translate(10,-10)")
    .on("mouseover", function (event, d) {
      if (d.isSelected == true) return;
      let cur = d3.select(this);
      cur.style("fill", d.setColor);
      cur.style("r", 5);
      trendTooltipState.text("State: " + d[0]);
      trendTooltipCost.text("Cost: $" + d[1]);
    })
    .on("mouseout", function (event, d) {
      if (d.isSelected == true) return;
      let cur = d3.select(this);
      // cur.style("fill", "none");
      cur.style("r", 3);
    })
    .on("click", function (e, d) {
      let cur = d3.select(this);
      d.isSelected = !d.isSelected;
      if (d.isSelected === false) {
        nodeIsSelected--;
        cur.style("fill", d.setColor);
        selectedState.pop();
        if (selectedState.length === 0) {
          preferedState = "";
          stateWisefrequencyPreference = false;
        } else {
          preferedState = selectedState.pop();
          stateWisefrequencyPreference = true;
        }
        let diagram1 = d3.select(".diagram1");
        diagram1.select(".d1g").remove();
        diagram1.append("g").attr("class", "d1g");
        yearBarChart(globalData);
        updateForceDirected();
        updateTreeSelection();
        // for (let i = 0; i < selectedState.length; i++) {
        //   if (d.data[0] == selectedState[i]) continue;
        //   temp.push(selectedState[i]);
        // }
        // selectedState = temp;
        // updateTreeSelection();
        // if (d.height === 0) cur.attr("r", d.setHeight);
      } else {
        cur.style("fill", "pink");
        selectedState.push(d[0]);
        preferedState = d[0];
        stateWisefrequencyPreference = true;
        let diagram1 = d3.select(".diagram1");
        diagram1.select(".d1g").remove();
        diagram1.append("g").attr("class", "d1g");
        // if (d.height === 0) cur.attr("r", 20);
        d.isSelected = true;
        // setNodeText(d);
        nodeIsSelected++;
        yearBarChart(globalData);
        updateTreeSelection();
        updateForceDirected();
        // if (d.height === 2) {
        //   selectedState.unshift(d.data[0]);
        //   // updateTreeSelection();
        // }
      }
    });
}

function barchartSvg(data) {
  const groupedData = d3.rollup(
    //we are counting birdstrikes based on the flight
    data,
    calculateLeafValue,
    (d) => {
      return d[flightDate];
    }
  );
  console.log(groupedData);
  //console.log("The grouped data based on flights: "+groupedData.get('12/01/1990'));
  const length = d3.count(globalData, (d) => flightDate);
  //console.log("How many flights there are: "+length);
  //console.log(groupedData); // this counts the number of bird strikes for each day

  const objectArray = Array.from(groupedData); //successful

  //console.log("Complete objects: "+objectArray);
  console.log(objectArray[0]);

  const groupedDataValues = Array.from(groupedData.values());
  //console.log("Only grouped values: "+groupedDataValues);

  const maxGroupDataValue = d3.max(groupedDataValues);
  //console.log("Maximum frequency: "+maxGroupDataValue);

  const groupedDataKeys = Array.from(groupedData.keys());
  const groupedDataKeysLength = d3.count(groupedDataKeys);
  //console.log("Only grouped keys: "+groupedDataKeys);

  const margin = 40;
  const width = 500;
  const height = 300;
  //how to count maxFlightCount;

  const chart = d3
    .select(".d1g")
    .attr("transform", `translate(${margin}, ${margin})`)
    .call(zoom);

  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, maxGroupDataValue]);
  chart.append("g").call(d3.axisLeft(yScale));

  const monthScale = d3
    .scaleSequential()
    .domain([0, 11])
    .interpolator(d3.interpolateOranges);
  const xScale = d3
    .scaleTime()
    .range([0, width])
    .domain([
      new Date(getDatefromString(groupedDataKeys[0])),
      new Date(getDatefromString(groupedDataKeys[groupedDataKeys.length - 1])),
    ]);
  //const xScale = d3.scaleOrdinal().domain(groupedDataKeys).range(['black', '#ccc', '#ccc']);
  chart
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  chart
    .selectAll()
    .data(objectArray)
    .enter()
    .append("rect")
    .attr("x", (s) => xScale(getDatefromString(s[0])))
    .attr("y", (s) => yScale(s[1]))
    .attr("height", (s) => height - yScale(s[1]))
    .attr("width", width / groupedDataKeys.length)
    .attr("fill", (s) => {
      let date = getDatefromString(s[0]);
      return "" + monthScale(date.getMonth());
    });

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2 - 100)
    .attr("y", -10)
    .text("Timeline of frequency of bird strikes");

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2 - 35)
    .attr("y", height + 40)
    .text("Time in years");

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", 0 - 35)
    .attr("y", -15)
    .text("Frequency");
}

/*function costBarchartSvg(data) {
  const groupedData = d3.rollup(
    //we are counting birdstrikes based on the flight
    data,
    calculateLeafValue,
    (d) => {
      return d[costTotal];
    }
  );
  console.log(groupedData);
  //console.log("The grouped data based on flights: "+groupedData.get('12/01/1990'));
  const length = d3.count(globalData, (d) => flightDate);
  //console.log("How many flights there are: "+length);
  //console.log(groupedData); // this counts the number of bird strikes for each day

  const objectArray = Array.from(groupedData); //successful

  //console.log("Complete objects: "+objectArray);
  console.log(objectArray[0]);

  const groupedDataValues = Array.from(groupedData.values());
  //console.log("Only grouped values: "+groupedDataValues);

  const maxGroupDataValue = d3.max(groupedDataValues);
  //console.log("Maximum frequency: "+maxGroupDataValue);

  const groupedDataKeys = Array.from(groupedData.keys());
  const groupedDataKeysLength = d3.count(groupedDataKeys);
  //console.log("Only grouped keys: "+groupedDataKeys);

  const margin = 40;
  const width = 500;
  const height = 300;
  //how to count maxFlightCount;

  const chart = d3
    .select(".d1g")
    .attr("transform", `translate(${margin}, ${margin})`)
    .call(zoom);

  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, maxGroupDataValue]);
  chart.append("g").call(d3.axisLeft(yScale));

  const monthScale = d3
    .scaleSequential()
    .domain([0, 11])
    .interpolator(d3.interpolateOranges);
  const xScale = d3
    .scaleTime()
    .range([0, width])
    .domain([
      new Date(getDatefromString(groupedDataKeys[0])),
      new Date(getDatefromString(groupedDataKeys[groupedDataKeys.length - 1])),
    ]);
  //const xScale = d3.scaleOrdinal().domain(groupedDataKeys).range(['black', '#ccc', '#ccc']);
  chart
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  chart
    .selectAll()
    .data(objectArray)
    .enter()
    .append("rect")
    .attr("x", (s) => xScale(getDatefromString(s[0])))
    .attr("y", (s) => yScale(s[1]))
    .attr("height", (s) => height - yScale(s[1]))
    .attr("width", width / groupedDataKeys.length)
    .attr("fill", (s) => {
      let date = getDatefromString(s[0]);
      return "" + monthScale(date.getMonth());
    });

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2 - 100)
    .attr("y", -10)
    .text("Timeline of frequency of bird strikes");

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2 - 35)
    .attr("y", height + 40)
    .text("Time in years");

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", 0 - 35)
    .attr("y", -15)
    .text("Frequency");
}*/

/*
function patternSvg(data) {
  // let totalWidth = 620;
  // let totalHeight = 390;

  // let margins = { top: 10, right: 20, left: 40, bottom: 20 },
  //   width = totalWidth - margins.left - margins.right,
  //   height = totalHeight - margins.top - margins.bottom;

  // let svg = d3
  //   .select(".diagram3")
  //   .append("g")
  //   .attr("transform", `translate(${margins.left}, ${margins.top})`);

  // console.log(data);

  data.forEach((d) => {
    d.count = 1;
  });

  // console.log(data);

  let groupedData = d3.rollup(data, calculateCost, (d) => d[originState]);

  // console.log(groupedData);

  let statesArr = new Set();
  let statesArr2 = new Set();
  let datesArr = new Set();
  let c = 1;
  data.forEach((d) => {
    if (statesArr.has(d[originState]) === false) {
      statesArr2.add(Number(c++));
      statesArr.add(d[originState]);
    }
    const [day, month, year] = d[flightDate].split("/");
    let date = new Date(+year, +month - 1, +day);
    d.date = date;
    if (datesArr.has(date) === false) datesArr.add(date);
  });

  // console.log(data);

  statesArr = Array.from(statesArr);
  statesArr2 = Array.from(statesArr2);
  datesArr = Array.from(datesArr);

  datesArr.sort((a, b) => {
    return a - b;
  });

  let stackXaxis = d3
    .scaleTime()
    .domain([datesArr[0], datesArr[datesArr.length - 1]])
    .range([0, width]);

  console.log(groupedData);

  // let dataCat = colorScale.domain();
  let dataStack = d3.stack().keys(statesArr);

  let stackedData = dataStack(data);

  let stackYaxis = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(stackedData, (d, i) => {
        return d[i].data[costTotal];
      }),
    ])
    .range([height, 0]);

  let areas = d3
    .area()
    .x((d) => {
      // console.log(d.data[flightDate]);
      return stackXaxis(d.data.date);
    })
    .y0((d) => {
      // console.log(d);
      return 0;
    })
    .y1((d) => {
      console.log(d);
      return stackYaxis(d.data[costTotal]);
    });

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(stackXaxis));

  svg.append("g").call(d3.axisLeft(stackYaxis));

  let colors = d3
    .scaleLinear()
    .domain([0, statesArr.length - 1])
    .range(["blue", "purple"]);

  svg
    .selectAll("areaLayer")
    .data(stackedData)
    .join("circle")
    .style("fill", function (d, i) {
      return colors(i);
    })
    .attr("cx", (d, i) => {
      // console.log(d[i].data.date);
      return stackXaxis(d[i].data.date);
    })
    .attr("cy", (d, i) => {
      return stackYaxis(d[i].data[costTotal]);
    })
    .attr("r", 5);
}*/

function calculateLeafValueBar(group) {
  let count = 0;
  if (stateWisefrequencyPreference === false) {
    count = d3.count(group, (d) => {
      return d[costTotal];
    });
  } else {
    count = d3.count(group, (d) => {
      if (d[originState] === preferedState) {
        return d[costTotal];
      } else {
        return undefined;
      }
    });
  }
  // d.countLeaf = count;
  // console.log(count);
  return count;
}

function calculateLeafValue(group) {
  let count = 0;
  // if (stateWisefrequencyPreference === false) {
  count = d3.count(group, (d) => {
    return d[costTotal];
  });
  // d.countLeaf = count;
  // console.log(count);
  return count;
}

function calculateStrikes(group) {
  let count = d3.sum(group, (d) => {
    return d["count"];
  });
  // d.countLeaf = count;
  // console.log(count);
  return count;
}

function calculateCost(group) {
  let count = d3.sum(group, (d) => {
    return d[costTotal];
  });
  // d.countLeaf = count;
  // console.log(count);
  return count;
}

function calculateCostRepair(group) {
  let count = d3.sum(group, (d) => {
    return d[costRepair];
  });
  // d.countLeaf = count;
  // console.log(count);
  return count;
}

function calculateCostOther(group) {
  let count = d3.sum(group, (d) => {
    return d[costOther];
  });
  // d.countLeaf = count;
  // console.log(count);
  return count;
}

function setNodeText(d) {
  let text = "";
  if (d.height === 0) {
    text = "Date: " + d.data[0] + " Count: " + d.data[1];
  } else if (d.height === 1) {
    text = "Airport: " + d.data[0];
  } else if (d.height === 2) {
    text = "Sate: " + d.data[0];
  } else text = "Hover over a child node";

  d3.select(".tooltip1").text(text);
}

function getDatefromString(dateString) {
  const [day, month, year] = dateString.split("/").slice();
  let date = new Date(+year, +month - 1, +day);
  return date;
}

const drag = (simulation) => {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

function updateForceDirected() {
  // console.log("updated");
  const node = d3
    .select(".diagram2")
    .selectAll(".forceNodeCircle")
    .data(forceDirectedNodesGlobal)
    .join("forceNodeCircle")
    .attr("fill", (d) => {
      if (d.height != 1) return d.setColor;

      for (let i = 0; i < selectedState.length; i++) {
        console.log(d.data[0]);
        if (d.data[0] === selectedState[i]) return "#FFEC1F";
      }
      return d.setColor;
    })
    .attr("stroke", (d) => {
      if (d.height != 1) return d.setColor;

      for (let i = 0; i < selectedState.length; i++) {
        console.log(d.data[0]);
        if (d.data[0] === selectedState[i]) return "#FFEC1F";
      }
      return d.setColor;
    })
    .attr("r", (d) => {
      if (d.height != 1) return 3.5;

      for (let i = 0; i < selectedState.length; i++) {
        console.log(d.data[0]);
        if (d.data[0] === selectedState[i]) return 10;
      }
      return 3.5;
    });
}

//zeerak'
function forceDirectedLayout(data) {
  const groupedData = d3.rollup(
    //we are counting birdstrikes based on the flight
    data,
    calculateLeafValue,
    (d) => {
      return d[originState];
    },
    (d) => {
      return d[wildlifeSpecies];
    }
  );
  // console.log(groupedData);

  const root = d3.hierarchy(groupedData);
  // console.log(root);
  const links = root.links();
  const nodes = root.descendants();
  forceDirectedNodesGlobal = nodes;

  const margin = 40;
  const width = 500;
  const height = 300;
  //how to count maxFlightCount;

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(10)
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force("x", d3.forceX(300))
    .force("y", d3.forceY(200));

  const svg = d3
    .select(".diagram2")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("class", "force");
  // .attr("viewBox", [0, 0, width, height]);

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line");

  const node = svg
    .append("g")
    .attr("fill", "#fff")
    .attr("stroke", "#000")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .classed("forceNodeCircle", true)
    // .attr("fill", (d) => (d.children ? null : "#000"))
    .attr("fill", (d) => {
      let colors = ["#18a999", "#18a999", "#44355B", "#E89005"];
      d.setColor = colors[d.height + 1];
      return d.setColor;
    })
    // .attr("stroke", (d) => (d.children ? null : "#fff"))
    .attr("stroke", (d) => {
      return d.setColor;
    })
    //.attr("r", d => d.data[1]/100);
    .attr("r", 3.5)
    .on("mouseover", function (e, d) {
      let curNode = d3.select(this);
      if (curNode.style("fill") != "red") {
        curNode.style("fill", "aqua");
      }
    })
    .on("mouseout", function (e, d) {
      let curNode = d3.select(this);
      if (curNode.style("fill") != "red") {
        curNode.style("fill", d.setColor);
      }
    })
    .on("click", function (e, d) {
      let curNode = d3.select(this);
      if (curNode.style("fill") != "red") {
        curNode.style("fill", "red");
        if (d.height === 1) {
          let stateNode = d.data[0];
          selectedState.push(stateNode);
          preferedState = stateNode;
          stateWisefrequencyPreference = true;
          updateTreeSelection();
          updateTrendSelection();
          let diagram1 = d3.select(".diagram1");
          diagram1.select(".d1g").remove();
          diagram1.append("g").attr("class", "d1g");
          yearBarChart(globalData);
        }
      } else {
        selectedState.pop();
        if (selectedState.length === 0) {
          stateWisefrequencyPreference = false;
          preferedState = "";
        } else {
          stateWisefrequencyPreference = true;
          preferedState = selectedState.pop();
        }
        curNode.style("fill", d.setColor);
        updateTreeSelection();
        updateTrendSelection();
        let diagram1 = d3.select(".diagram1");
        diagram1.select(".d1g").remove();
        diagram1.append("g").attr("class", "d1g");
        yearBarChart(globalData);
      }
    })
    .call(drag(simulation));
  // .call(zoomForce);

  node.append("title").text((d) => {
    let stringToPrint = "";
    // console.log(d);
    if (d.height == 0) {
      stringToPrint = stringToPrint + "Species: " + d.data[0];
      stringToPrint = stringToPrint + " Frequency: " + d.data[1];
      return stringToPrint;
    }
    if (d.height == 1) {
      d.countSum = 0;
      // console.log(d);
      if (d.children != undefined) {
        let children = d.children;
        let sum = 0;
        children.forEach((c) => {
          sum += c.data[1];
        });
        stringToPrint = stringToPrint + "State: " + d.data[0];
        stringToPrint = stringToPrint + " Frequency: " + sum;
        return stringToPrint;
      }
      return d.data[1];
    }
  });

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  let lengthRec = 40;
  let toAdd2 = 35;
  let toSub = -20;
  let legendX = -300;
  let yOffest = 300;
  d3.select(".diagram2")
    .append("text")
    .attr("class", "force-tooltip")
    .attr("x", legendX + 20)
    .attr("y", height / 2 + toAdd2 + yOffest)
    .text("Root");

  d3.select(".diagram2")
    .append("text")
    .attr("class", "force-tooltip")
    .attr("x", legendX + 20)
    .attr("y", height / 2 + 50 + toAdd2 + yOffest)
    .text("State");

  d3.select(".diagram2")
    .append("text")
    .attr("class", "force-tooltip")
    .attr("x", legendX + 20)
    .attr("y", height / 2 + 50 + 50 + toAdd2 + yOffest)
    .text("Wildlife Species");

  d3.select(".diagram2")
    .append("text")
    .attr("class", "force-tooltip")
    .attr("x", -300)
    .attr("y", -150)
    .text("Wildlife Species Force Directed Layout");

  let colors = ["#18a999", "#18a999", "#44355B", "#E89005"];
  // diagram4
  d3.select(".diagram2")
    .append("rect")
    .attr("fill", colors[3])
    .attr("x", legendX - 10 + toSub)
    .attr("y", height / 2 + yOffest)
    .attr("width", lengthRec)
    .attr("height", lengthRec);

  // diagram4
  d3.select(".diagram2")
    .append("rect")
    .attr("fill", colors[2])
    .attr("x", legendX - 10 + toSub)
    .attr("y", height / 2 + 50 + yOffest)
    .attr("width", lengthRec)
    .attr("height", lengthRec);

  // diagram4
  d3.select(".diagram2")
    .append("rect")
    .attr("fill", colors[1])
    .attr("x", legendX - 10 + toSub)
    .attr("y", height / 2 + 50 * 2 + yOffest)
    .attr("width", lengthRec)
    .attr("height", lengthRec);
}

function yearBarChart(data) {
  const groupedData = d3.rollup(
    //we are counting birdstrikes based on the flight
    data,
    calculateLeafValueBar,
    (d) => {
      return getDatefromString(d[flightDate]).getFullYear();
    }
  );
  // console.log(groupedData);

  const length = d3.count(globalData, (d) => flightDate);

  const objectArray = Array.from(groupedData); //successful
  // console.log(objectArray);

  const groupedDataValues = Array.from(groupedData.values());
  // console.log(groupedDataValues);

  const maxGroupDataValue = d3.max(groupedDataValues);
  // console.log("Maximum frequency: " + maxGroupDataValue);

  const groupedDataKeys = Array.from(groupedData.keys());
  const groupedDataKeysLength = d3.count(groupedDataKeys);
  // console.log(groupedDataKeys);

  const margin = 40;
  const width = 500;
  const height = 300;
  //how to count maxFlightCount;

  const chart = d3
    .select(".d1g")
    .attr("transform", `translate(${margin}, ${margin})`);
  // .call(zoom);

  let toAdd = 0;
  if (stateWisefrequencyPreference === false) {
    toAdd = 100;
  }

  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, maxGroupDataValue + toAdd]);
  chart.append("g").call(d3.axisLeft(yScale));

  const xScale = d3.scaleBand().domain(groupedDataKeys).range([0, width]);

  chart
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  const colorScale = d3
    .scaleSequential()
    .domain([0, groupedDataKeys.length])
    .interpolator(d3.interpolateRgb("indigo", "purple"));

  let tooltip = d3
    .select(".d1g")
    .append("text")
    .attr("class", "tooltip2")
    .attr("x", width / 2 - 50 + 255)
    .attr("y", -20);

  let tooltip2 = d3
    .select(".d1g")
    .append("text")
    .attr("class", "tooltip2")
    .attr("x", width / 2 - 50 + 255)
    .attr("y", 0);

  chart
    .selectAll()
    .data(objectArray)
    .enter()
    .append("rect")
    .attr("class", "timelineRect")
    .attr("x", (s) => {
      return xScale(s[0]);
    })
    .attr("y", (s) => {
      // console.log(s[1]);
      return yScale(s[1]);
    })
    .attr("height", (s) => {
      // console.log(height - yScale(s[1]));
      return height - yScale(s[1]);
    })
    .attr("width", width / groupedDataKeys.length - 5)
    .attr("fill", (s) => {
      return "" + colorScale(groupedDataKeys.indexOf(s[0]));
    })
    .attr("opacity", "70%")
    .attr("stroke", "whitesmoke")
    .attr("stroke-width", 5)
    .on("mouseover", function (e, d) {
      d3.select(this).style("opacity", "100%");
      tooltip.text("Frequency: " + d[1]);
      tooltip2.text("Year: " + d[0]);
    })
    .on("mouseout", function (e, d) {
      let curObj = d3.select(this);
      let curCol = curObj.style("stroke");
      if (curCol != "orange") {
        curObj.style("opacity", "70%");
      }
    })
    .on("click", function (e, d) {
      // to do pop
      let curObj = d3.select(this);
      if (curObj.style("stroke") != "orange") {
        curObj.style("Stroke", "orange");
        selectedDataYears.push(d[0]);
        // console.log(selectedDataYears);
        updateTreeSelection();
      } else {
        selectedDataYears.pop();
        curObj.style("Stroke", "whitesmoke");
        updateTreeSelection();
      }
    });

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2 - 100)
    .attr("y", -10)
    .text("Timeline of frequency of bird strikes");

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2 - 35)
    .attr("y", height + 40)
    .attr("class", "timeline-xLabel")
    .text("Time in years");

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", 0 - 35)
    .attr("y", -15)
    .text("Frequency");

  let legend = d3
    .select(".d1g")
    .append("g")
    .attr("x", 0 - 35)
    .attr("y", -15 + 100);

  let g1 = legend.append("g").on("click", function () {
    let diagram1 = d3.select(".diagram1");
    diagram1.select(".d1g").remove();
    diagram1.append("g").attr("class", "d1g");
    brush(globalData);
  });

  g1.append("rect")
    .attr("x", width - 25)
    .attr("y", 10)
    .attr("height", 10)
    .attr("width", 10)
    .attr("fill", "blue");
  g1.append("text")
    .attr("x", width - 10)
    .attr("y", 20)
    .attr("class", "tooltip2")
    .text("Switch Graph Type");
}

function diagram3SVG(data) {
  let diagram3 = d3.select(".diagram3");
  let legend = diagram3.append("g").attr("class", "legend-diagram3");

  let type = 1;

  let g1 = legend
    .append("g")
    .attr("class", "g1-totalCost")
    .on("click", function (e, d) {
      if (d3.select(this).select("rect").style("fill") != "green") {
        d3.select(this).select("rect").style("fill", "green");
        d3.select(".g2-repairCost").select("rect").style("fill", "blue");
        d3.select(".g3-otherCost").select("rect").style("fill", "blue");
        type = 1;
        diagram3.selectAll(".trendSVG").remove();
        trendSVG(data, type);
      }
    });

  let g2 = legend
    .append("g")
    .attr("class", "g2-repairCost")
    .on("click", function (e, d) {
      if (d3.select(this).select("rect").style("fill") != "green") {
        d3.select(this).select("rect").style("fill", "green");
        d3.select(".g1-totalCost").select("rect").style("fill", "blue");
        d3.select(".g3-otherCost").select("rect").style("fill", "blue");
        type = 2;
        diagram3.selectAll(".trendSVG").remove();
        trendSVG(data, type);
      }
    });

  let g3 = legend
    .append("g")
    .attr("class", "g3-otherCost")
    .on("click", function (e, d) {
      if (d3.select(this).select("rect").style("fill") != "green") {
        d3.select(this).select("rect").style("fill", "green");
        d3.select(".g1-totalCost").select("rect").style("fill", "blue");
        d3.select(".g2-repairCost").select("rect").style("fill", "blue");
        type = 3;
        diagram3.selectAll(".trendSVG").remove();
        trendSVG(data, type);
      }
    });

  g1.append("rect")
    .attr("x", 500)
    .attr("y", 25)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", "green");

  g1.append("text").attr("x", 525).attr("y", 35).text("Total Cost");

  g2.append("rect")
    .attr("x", 500)
    .attr("y", 25 + 25)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", "blue");

  g2.append("text")
    .attr("x", 525)
    .attr("y", 35 + 25)
    .text("Repair Cost");

  g3.append("rect")
    .attr("x", 500)
    .attr("y", 25 + 25 + 25)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", "blue");

  g3.append("text")
    .attr("x", 525)
    .attr("y", 35 + 25 + 25)
    .text("Other Cost");

  trendSVG(data, type);
}

function brush(data) {
  let totalWidth = 600;
  let totalHeight = 330;

  let margins = { top: 10, right: 20, left: 60, bottom: 20 },
    width = totalWidth - margins.left - margins.right,
    height = totalHeight - margins.top - margins.bottom;

  const groupedData = d3.rollup(
    //we are counting birdstrikes based on the flight
    data,
    calculateLeafValueCost,
    (d) => {
      return d[flightDate];
    }
  );
  console.log(groupedData);
  const length = d3.count(globalData, (d) => flightDate);

  const objectArray = Array.from(groupedData);

  console.log(objectArray[0]);

  const groupedDataValues = Array.from(groupedData.values());

  const maxGroupDataValue = d3.max(groupedDataValues);

  const groupedDataKeys = Array.from(groupedData.keys());
  const groupedDataKeysLength = d3.count(groupedDataKeys);

  const Svg = d3.select(".d1g").attr("transform", `translate(${60}, ${40})`);

  var x = d3
    .scaleTime()
    .domain([
      new Date(getDatefromString(groupedDataKeys[0])),
      new Date(getDatefromString(groupedDataKeys[groupedDataKeys.length - 1])),
    ])
    .range([0, width]);

  var xAxis = Svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  var y = d3.scaleLinear().domain([0, maxGroupDataValue]).range([height, 0]);
  Svg.append("g").call(d3.axisLeft(y));

  var clip = Svg.append("defs")
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

  const monthScale = d3
    .scaleSequential()
    .domain([0, 11])
    .interpolator(d3.interpolateOranges);

  var brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("end", updateChartBrushed);

  var scatter = Svg.append("g").attr("clip-path", "url(#clip)");

  scatter
    .selectAll()
    .data(objectArray)
    .enter()
    .append("rect")
    .classed("barRect", true)
    .attr("x", (s) => x(getDatefromString(s[0])))
    .attr("y", (s) => y(s[1]))
    .attr("height", (s) => height - y(s[1]))
    .attr("width", width / groupedDataKeys.length)
    .attr("fill", (s) => {
      let date = getDatefromString(s[0]);
      return "" + monthScale(date);
    });

  scatter.append("g").attr("class", "brush").call(brush);

  var idleTimeout;
  function idled() {
    idleTimeout = null;
  }

  function updateChartBrushed(e) {
    let extent = e.selection;
    // console.log(e);
    // extent = d3v4.event.selection;

    // console.log(d3v4.event);
    if (extent == undefined || extent.length < 2) return;

    let minX = extent[0];
    let maxX = extent[1];

    if (!extent) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 200));
      x.domain([
        new Date(getDatefromString(groupedDataKeys[0])),
        new Date(
          getDatefromString(groupedDataKeys[groupedDataKeys.length - 1])
        ),
      ]);
    } else {
      x.domain([x.invert(extent[0]), x.invert(extent[1])]);
      scatter.select(".brush").call(brush.move, null);
    }

    let barArr = [];

    for (let i = 0; i < groupedDataKeys.length; i++) {
      if (
        x(getDatefromString(groupedDataKeys[i])) >= extent[0] &&
        x(getDatefromString(groupedDataKeys[i])) <= extent[1]
      ) {
        barArr.push(groupedDataKeys[i]);
      }
    }

    let yMax = 0;
    // let yMin = 999999999999999;
    for (let i = 0; i < barArr.length; i++) {
      if (y(barArr[i][1]) >= yMax) {
        yMax = y(barArr[i][1]);
      }
    }

    xAxis.call(d3.axisBottom(x));
    scatter
      .selectAll(".barRect")
      .attr("x", function (d) {
        let curX = x(getDatefromString(d[0]));
        return curX;
      })
      .attr("y", function (d) {
        return y(d[1]);
      })
      .attr("height", (s) => height - y(s[1]))
      .attr("stroke", "white")
      .attr("width", 5);
  }

  let legend = Svg.append("g")
    .attr("x", 0 - 35)
    .attr("y", -15 + 100);

  let g1 = legend.append("g").on("click", function () {
    let diagram1 = d3.select(".diagram1");
    diagram1.select(".d1g").remove();
    diagram1.append("g").attr("class", "d1g");
    yearBarChart(globalData);
  });

  g1.append("rect")
    .attr("x", width - 25 - 40)
    .attr("y", 10)
    .attr("height", 10)
    .attr("width", 10)
    .attr("fill", "green");
  g1.append("text")
    .attr("x", width - 10 - 40)
    .attr("y", 20)
    .attr("class", "tooltip2")
    .text("Switch Graph");

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2 - 100)
    .attr("y", -10)
    .text("Timeline of Total Cost of bird strikes");

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2 - 35)
    .attr("y", height + 40)
    .attr("class", "timeline-xLabel")
    .text("Time in years");

  d3.select(".d1g")
    .append("text")
    .attr("class", "title")
    .attr("x", 0 - 35)
    .attr("y", -15)
    .text("Cost $");
}

function costBarchartSvg(data) {
  // const groupedData = d3.rollup(
  //   //we are counting birdstrikes based on the flight
  //   data,
  //   calculateLeafValueCost,
  //   (d) => {
  //     return d[flightDate];
  //   }
  // );
  // console.log(groupedData);
  // //console.log("The grouped data based on flights: "+groupedData.get('12/01/1990'));
  // const length = d3.count(globalData, (d) => flightDate);
  // //console.log("How many flights there are: "+length);
  // //console.log(groupedData); // this counts the number of bird strikes for each day

  // const objectArray = Array.from(groupedData); //successful

  // //console.log("Complete objects: "+objectArray);
  // console.log(objectArray[0]);

  // const groupedDataValues = Array.from(groupedData.values());
  // //console.log("Only grouped values: "+groupedDataValues);

  // const maxGroupDataValue = d3.max(groupedDataValues);
  // //console.log("Maximum frequency: "+maxGroupDataValue);

  // const groupedDataKeys = Array.from(groupedData.keys());
  // const groupedDataKeysLength = d3.count(groupedDataKeys);
  // //console.log("Only grouped keys: "+groupedDataKeys);

  // const margin = 40;
  // const width = 500;
  // const height = 300;

  const chart = d3
    .select(".d1g")
    .attr("transform", `translate(${40}, ${40})`)
    .call(zoom);

  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, maxGroupDataValue]);

  chart.append("g").call(d3.axisLeft(yScale));

  const monthScale = d3
    .scaleSequential()
    .domain([0, 11])
    .interpolator(d3.interpolateOranges);
  //const firstYear = getDatefromString(groupedDataKeys[0]).getFullYear();
  //console.log(firstYear);
  //const yearScale = d3.scaleSequential().domain([getYearfromString(groupedDataKeys[0]),getYearfromString(groupedDataKeys[groupedDataKeys.length-1])]).interpolator(d3.interpolate("rgb(108,99,255)", "red"));

  const xScale = d3
    .scaleTime()
    .range([0, width])
    .domain([
      new Date(getDatefromString(groupedDataKeys[0])),
      new Date(getDatefromString(groupedDataKeys[groupedDataKeys.length - 1])),
    ]);
  //const xScale = d3.scaleLinear().range([0, width]).domain([getYearfromString(groupedDataKeys[0]),getYearfromString(groupedDataKeys[groupedDataKeys.length-1])]);

  chart
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  chart
    .selectAll()
    .data(objectArray)
    .enter()
    .append("rect")
    .attr("x", (s) => xScale(getDatefromString(s[0])))
    .attr("y", (s) => yScale(s[1]))
    .attr("height", (s) => height - yScale(s[1]))
    .attr("width", width / groupedDataKeys.length)
    .attr("fill", (s) => {
      let date = getDatefromString(s[0]);
      return "" + monthScale(date);
    });
}

function calculateLeafValueCost(group) {
  let sum = 0;
  // if (stateWisefrequencyPreference === false) {
  sum = d3.sum(group, (d) => {
    return d[costTotal];
  });
  // d.countLeaf = count;
  // console.log(count);
  return sum;
}
