import React, { Component } from "react";
import * as d3 from "d3";
import "./index.css";
import { Button } from "antd";
import { Input } from "antd";

class Main extends Component {
  state = {
    data: [],
    loading: true
  };

  async componentDidMount() {
    let dataCollection = [];
    await d3.csv("steam_game_features.csv", data => {
      dataCollection.push(data);
    });

    this.setState({
      data: dataCollection,
      loading: false
    });
    const bins = this.dataBins(
      dataCollection,
      "RecommendationCount",
      "SteamSpyOwners"
    );
    this.drawChart(bins);
  }

  //field: RecommendationCount
  dataMapper(data, field, gameName = "") {
    if (gameName !== "") {
      data = data.filter(record => record["ReponseName"] === gameName);
    }
    return data.map(record => record[field]);
  }

  dataBins(data, xField, yField) {
    let x = data.map(record => parseInt(record[xField]));
    let histogram = d3.histogram().thresholds(200);
    let bins = histogram(x);
    let joinBins = [];
    data.map(record => {
      bins.forEach((item, i) => {
        if (record[xField] >= item.x0 && record[xField] < item.x1) {
          joinBins.push({
            id: record["QueryID"],
            name: item.x1.toString(),
            x: parseInt(record[xField]),
            y: parseInt(record[yField])
          });
        }
      });
    });
    console.log(joinBins);
    return joinBins;
  }

  /*
   * https://beta.observablehq.com/@baspieren/functional-programming-d3-scatterplot
   */
  drawChart(bins) {
    bins = bins.filter(record => record.y < 8000000);
    //ACCESS this.state.data
    const svg = d3.select("#main_svg").datum(bins);
    const width = 1600;
    const height = 800;
    const margin = { top: 100, right: 100, bottom: 100, left: 100 };

    const x = d3
      .scaleBand()
      .domain(bins.map(d => d.name).sort((a, b) => parseInt(a) - parseInt(b)))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, d => parseInt(d.y))])
      .nice()
      .range([height - margin.bottom, 0]);

    const xAxis = g =>
      g.attr("transform", `translate(0,${height - margin.bottom + 15})`).call(
        d3
          .axisBottom(x)
          .tickSize(20)
          .tickPadding(10)
      );

    const yAxis = g =>
      g.attr("transform", `translate(${margin.left - 20},0)`).call(
        d3
          .axisLeft(y)
          .tickValues(
            d3
              .scaleLinear()
              .domain(y.domain())
              .ticks()
          )
          .tickSize(20)
          .tickPadding(10)
      );

    const dotColor = d3
      .scaleLinear()
      .domain([
        0,
        d3.median(bins, d => parseInt(d.y)),
        d3.max(bins, d => parseInt(d.y))
      ])
      .nice()
      .range(["orange", "white", "steelblue"]);

    svg
      .append("g")
      .call(xAxis)
      .attr("stroke-width", 2)
      .attr("color", "white")
      .style("font-size", "14px");

    svg
      .append("g")
      .call(yAxis)
      .attr("color", "white")
      .style("font-size", "14px");

    svg
      .append("g")
      .selectAll("circle")
      .data(bins)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.name))
      .attr("cy", d => y(parseInt(d.y)))
      .attr("r", 8)
      .attr("fill", d => dotColor(parseInt(d.y)))
      .attr("opacity", 0.5);
    // // START USE OF SOURCE: Martijn Reeuwijk
    // .on("mouseover", function(d) {
    //   d3.select(this)
    //     .attr("circle", 10)
    //     .transition()
    //     .attr("fill", "#2d2d2d");
    // })
    // .on("mouseout", function(d) {
    //   d3.select(this)
    //     .attr("circle", 10)
    //     .transition()
    //     .attr("fill", dotColor(d.pages));
    // });
    // END USE OF SOURCE
  }

  render() {
    const ButtonGroup = Button.Group;
    return (
      <div>
        {this.state.loading ? (
          <p>loading...</p>
        ) : (
          <div id="canvas-wrapper">
            <div id="header">
              <Input className="my-input" placeholder="Enter another game..." />
            </div>
            <div id="main-canvas">
              <svg id="main_svg" viewBox="-50 -100 1600 1000" />
            </div>
            <div id="yfilter">
              <ButtonGroup className="my-btn-group">
                <Button className="my-btn" type="primary">
                  Recommendation
                </Button>
                <Button className="my-btn" type="primary">
                  Metacritic
                </Button>
                <Button className="my-btn" type="primary">
                  Price
                </Button>
              </ButtonGroup>
            </div>
            <div id="xfilter">
              <ButtonGroup className="my-btn-group">
                <Button className="my-btn my-btn1" type="primary">
                  Number of Owners
                </Button>
                <Button className="my-btn my-btn1" type="primary">
                  Number of Players
                </Button>
              </ButtonGroup>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Main;
