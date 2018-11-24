import React, { Component } from "react";
import * as d3 from "d3";
import "./index.css";

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.extractYear = this.extractYear.bind(this);
    this.drawTimeline = this.drawTimeline.bind(this);
  }

  componentDidUpdate() {
    if (!this.props.data) return;
    this.drawTimeline(this.props.data, "ReleaseDate", "SteamSpyOwners");
  }

  dataMapper(data, field) {}

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

  // dataBins(data, xField, yField) {
  //   let histogram = d3.histogram().thresholds(200);
  //   let bins = histogram(x);
  //   let joinBins = [];
  //   data.forEach(record => {
  //     bins.forEach((item, i) => {
  //       if (record[xField] >= item.x0 && record[xField] < item.x1) {
  //         joinBins.push({
  //           id: record["QueryID"],
  //           name: item.x1.toString(),
  //           x: parseInt(record[xField]),
  //           y: parseInt(record[yField])
  //         });
  //       }
  //     });
  //   });
  //   console.log(joinBins);
  //   return joinBins;
  // }

  drawTimeline(data, xField, yField) {
    const svg = d3.select("#timeline_svg").datum(data);
    const width = 1600;
    const height = 800;
    const margin = { top: 100, right: 100, bottom: 100, left: 100 };

    const x = d3
      .scaleBand()
      .domain(
        data
          .filter(record => (record[xField] ? true : false))
          .map(record => parseInt(this.extractYear(record[xField])))
      )
      .range(margin.left, width - margin.right);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => parseInt(d[yField]))])
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
  }
}

export default Timeline;
