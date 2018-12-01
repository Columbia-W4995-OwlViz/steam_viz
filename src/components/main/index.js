import React, { Component } from "react";
import * as d3 from "d3";
import { Spin, Radio, Input, Modal, Button } from "antd";
import Trivia from "./components/Trivia";
import "./index.css";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      binThreshold: {
        RecommendationCount: 200,
        Metacritic: 100,
        PriceInitial: 200
      },
      topFilter: "RecommendationCount",
      bottomFilter: "SteamSpyOwners",
      canvasKey: 1,
      showDataModal: false,
      dataModalID: 10
    };
    this.handleTopFilter = this.handleTopFilter.bind(this);
    this.handleBottomFilter = this.handleBottomFilter.bind(this);
    this.drawChart = this.drawChart.bind(this);
    this.handleModalClick = this.handleModalClick.bind(this);
  }

  componentDidMount() {}

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (nextProps.data !== this.props.data) return true;
  //   if (nextState.canvasKey === this.state.canvasKey) return false;
  // }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.data) return;
    if (prevProps.loading === this.props.loading) return;
    const bins = this.dataBins(
      this.props.data,
      this.state.topFilter,
      this.state.bottomFilter
    );
    this.drawChart(bins, this.props.dataMap);
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
    let histogram = d3.histogram().thresholds(this.state.binThreshold[xField]);
    let bins = histogram(x);
    let joinBins = [];
    data.forEach(record => {
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
    // console.log(joinBins);
    return joinBins;
  }

  /*
   * https://beta.observablehq.com/@baspieren/functional-programming-d3-scatterplot
   */
  drawChart(bins, dataMap) {
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
      // .attr("fill", d => dotColor(parseInt(d.y)))
      .attr("fill", "white")
      .attr("opacity", 0.5)
      // START USE OF SOURCE: Martijn Reeuwijk
      .on("mouseover", function(d) {
        d3.select(this)
          .attr("r", 10)
          .attr("opacity", 0.5)
          .attr("fill", "#ff1919")
          .transition();
        div
          .transition()
          .duration(200)
          .style("opacity", 0.7);
        div
          .html(dataMap[d.id]["ResponseName"])
          .style("left", d3.event.pageX - 100 + "px")
          .style("top", d3.event.pageY + 20 + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .attr("r", 8)
          .attr("opacity", 0.5)
          // .attr("fill", d => dotColor(parseInt(d.y)))
          .attr("fill", "white")
          .transition();
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      })
      .on("mousedown", d => {
        this.setState({
          showDataModal: true,
          dataModalID: d.id
        });
      });
    // END USE OF SOURCE

    var div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  }

  handleTopFilter(e) {
    this.setState({
      topFilter: e.target.value,
      canvasKey: this.state.canvasKey + 1
    });
  }

  handleBottomFilter(e) {
    this.setState({
      bottomFilter: e.target.value,
      canvasKey: this.state.canvasKey + 1
    });
  }

  handleModalClick(e) {
    this.setState({
      showDataModal: false
    });
  }

  render() {
    const { loading } = this.props;
    return (
      <div>
        <div id="canvas-wrapper">
          <Trivia />
          <Modal
            className="my-modal"
            title={
              !loading
                ? this.props.dataMap[this.state.dataModalID]["ResponseName"]
                : ""
            }
            visible={this.state.showDataModal}
            onOk={this.handleModalClick}
            onCancel={this.handleModalClick}
            footer={[
              <Button key="ok" type="primary" onClick={this.handleModalClick}>
                OK
              </Button>
            ]}
          >
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </Modal>
          <div id="header">
            <Input className="my-input" placeholder="Enter another game..." />
          </div>
          {loading ? (
            <div className="loading">
              <br />
              <br />
              <Spin size="large" />
            </div>
          ) : (
            <div id="main-canvas" key={this.state.canvasKey}>
              <svg id="main_svg" viewBox="-50 -100 1600 1000" />
            </div>
          )}
          <div id="yfilter">
            <Radio.Group
              value={this.state.topFilter}
              className="my-btn-group"
              onChange={this.handleTopFilter}
            >
              <Radio.Button value="RecommendationCount" className="my-btn">
                Recommendation
              </Radio.Button>
              <Radio.Button value="Metacritic" className="my-btn">
                Metacritic
              </Radio.Button>
              <Radio.Button value="PriceInitial" className="my-btn">
                Price
              </Radio.Button>
            </Radio.Group>
          </div>
          <div id="xfilter">
            <Radio.Group
              value={this.state.bottomFilter}
              className="my-btn-group"
              onChange={this.handleBottomFilter}
            >
              <Radio.Button value="SteamSpyOwners" className="my-btn my-btn1">
                Number of Owners
              </Radio.Button>
              <Radio.Button
                value="SteamSpyPlayersEstimate"
                className="my-btn my-btn1"
              >
                Number of Players
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
