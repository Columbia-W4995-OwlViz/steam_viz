import React, { Component } from "react";
import * as d3 from "d3";
import "./index.css";
import { Button, Spin, Radio } from "antd";

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.extractYear = this.extractYear.bind(this);
    this.drawTimeline = this.drawTimeline.bind(this);
    this.dataMapper = this.dataMapper.bind(this);
  }

  componentDidUpdate() {
    if (!this.props.data) return;
    const newData = this.dataMapper(this.props.data);
    this.drawTimeline(newData, "ReleaseDate", "SteamSpyOwners");
  }

  dataMapper(data, xField, yField) {
    let newData = [];
    data
      .filter(record => (record[xField] ? true : false))
      .forEach(record => {
        newData.push({
          id: record["QueryID"],
          x: parseInt(this.extractYear(record[xField])),
          y: parseInt(record[yField])
        });
      });
    console.log(newData);
    return newData;
  }

  extractYear(date) {
    let time = date.split(" ");
    if (time.length === 2) {
      return time[1];
    } else if (time.length === 3) {
      return time[2];
    } else {
      return "2019";
    }
  }

  drawTimeline(data, xField, yField) {
    console.log("called drawTimeline");
    const svg = d3.select("#timeline_svg").datum(data);
    const width = 1600;
    const height = 800;
    const margin = { top: 100, right: 100, bottom: 100, left: 100 };

    const x = d3
      .scaleBand()
      .domain(data.map(d => d.x))
      .range(margin.left, width - margin.right);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
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
        d3.median(data, d => parseInt(d.y)),
        d3.max(data, d => parseInt(d.y))
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
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 7)
      .attr("fill", d => dotColor(parseInt(d.y)))
      .attr("opacity", 0.5);
  }

  render() {
    const loading = this.props.loading;
    return (
      <div>
        <div id="canvas-wrapper">
          {loading ? (
            <div className="loading">
              <br />
              <br />
              <Spin size="large" />
            </div>
          ) : (
            <svg id="timeline_svg" viewBox="-50 -100 1600 1000" />
          )}
        </div>
      </div>
    );
  }
}

export default Timeline;
