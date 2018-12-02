import React, { Component } from "react";
import * as d3 from "d3";
import Trivia from "../main/components/Trivia";
import "./index.css";
import { Button, Spin, Steps, Popover, Carousel, Modal, Icon } from "antd";

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
    this.extractYear = this.extractYear.bind(this);
    this.drawTimeline = this.drawTimeline.bind(this);
    this.dataMapper = this.dataMapper.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.onCarouselChange = this.onCarouselChange.bind(this);
    this.onOkTextClick = this.onOkTextClick.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.data) return;
    if (prevState.visible !== this.state.visible) return;
    const newData = this.dataMapper(
      this.props.data,
      "ReleaseDate",
      "SteamSpyOwners"
    );
    this.drawTimeline(newData, "ReleaseDate", "SteamSpyOwners");
  }

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  hideModal = () => {
    this.setState({
      visible: false
    });
  };

  onCarouselChange(a, b, c) {
    console.log(a, b, c);
  }

  onOkTextClick() {
    console.log("hello world!");
  }

  dataMapper(data, xField, yField) {
    console.log("dataMapper");
    let newData = [];
    data
      .filter(record => record[xField] && !Number.isNaN(record[xField]))
      .forEach(record => {
        newData.push({
          id: record["QueryID"],
          x: parseInt(this.extractYear(record[xField])),
          y: parseInt(record[yField])
        });
      });
    console.log("logging new Data");
    console.log(newData);
    return newData;
  }

  extractYear(date) {
    let time = date.split(" ");
    if (time.length === 2) {
      return time[1].length < 4 ? "2019" : time[1];
    } else if (time.length === 3) {
      return time[2].length < 4 ? "2019" : time[2];
    } else {
      return "2019";
    }
  }

  drawTimeline(data, xField, yField) {
    data = data.filter(record => record.y < 8000000);
    console.log("called drawTimeline");
    const svg = d3.select("#timeline_svg");
    const width = 1600;
    const height = 700;
    const margin = { top: 100, right: 100, bottom: 100, left: 100 };

    const x = d3
      .scaleBand()
      .domain(
        data
          .filter(
            d =>
              !Number.isNaN(parseInt(d.x)) &&
              parseInt(d.x) > 1996 &&
              parseInt(d.x) !== 2019
          )
          .map(d => parseInt(d.x))
          .sort((a, b) => parseInt(a) - parseInt(b))
      )
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
      .nice()
      .range([height - margin.bottom, 0]);

    const xAxis = g =>
      g
        .attr("transform", `translate(-31.5,${height - margin.bottom + 15})`)
        .call(
          d3
            .axisBottom(x)
            .tickSizeInner(15)
            .tickSizeOuter(0)
            .tickPadding(8)
        )
        .call(g =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 50)
            .attr("y", -5)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", "16px")
            .text("Year")
        );

    const yAxis = g =>
      g
        .attr("transform", `translate(${margin.left - 20},0)`)
        .call(
          d3
            .axisLeft(y)
            .tickFormat(d3.format(".2s"))
            .tickSizeInner(15)
            .tickPadding(8)
        )
        .call(g =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 0)
            .attr("y", -25)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .attr("font-size", "16px")
            .text("Number of Owners")
        );

    // const y2Axis = g =>
    //   g.attr("transform", `translate(${margin.left + 435},0)`).call(
    //     d3
    //       .axisLeft(y)
    //       .tickFormat(d3.format(".2s"))
    //       .tickSize(15)
    //       .tickPadding(8)
    //   );

    // const y3Axis = g =>
    //   g.attr("transform", `translate(${margin.left + 900},0)`).call(
    //     d3
    //       .axisLeft(y)
    //       .tickFormat(d3.format(".2s"))
    //       .tickSize(15)
    //       .tickPadding(8)
    //   );

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
      .attr("font-weight", "bold")
      .attr("color", "white")
      .style("font-size", "14px");

    svg
      .append("g")
      .call(yAxis)
      .attr("stroke-width", 2)
      .attr("font-weight", "bold")
      .attr("color", "white")
      .style("font-size", "14px");

    // svg
    //   .append("g")
    //   .call(y2Axis)
    //   .attr("stroke-width", 2)
    //   .attr("font-weight", "bold")
    //   .attr("color", "white")
    //   .style("font-size", "14px")

    // svg
    //   .append("g")
    //   .call(y3Axis)
    //   .attr("stroke-width", 2)
    //   .attr("font-weight", "bold")
    //   .attr("color", "white")
    //   .style("font-size", "14px")

    svg
      .append("g")
      .selectAll("circle")
      .data(data.filter(d => d.x > 1996 && d.x !== 2019))
      .enter()
      .append("circle")
      .attr("cx", d => x(parseInt(d.x)))
      .attr("cy", d => y(parseInt(d.y)))
      .attr("r", 8)
      .attr("fill", d => dotColor(parseInt(d.y)))
      .attr("opacity", 0.5);
  }

  render() {
    const { loading } = this.props.loading;
    const Step = Steps.Step;
    const customDot = (dot, { status, index }) => (
      <Popover
        content={
          <span>
            step {index} status: {status}
          </span>
        }
      >
        {dot}
      </Popover>
    );
    return (
      <div>
        <div id="canvas-wrapper">
          <Trivia />
          {loading ? (
            <div className="loading">
              <br />
              <br />
              <Spin size="large" />
            </div>
          ) : (
            <svg id="timeline_svg" viewBox="-50 -100 1600 800" />
          )}
          <div id="enter">
            <Button block onClick={this.showModal}>
              Enter Game
            </Button>
            {/* <Radio.Group
              // value={this.state.topFilter}
              className="my-btn-group"
              // onChange={this.handleTopFilter}
            >
              <Radio.Button value="Prelude" className="my-btn">
                Prelude
              </Radio.Button>
              <Radio.Button value="Chapter 1" className="my-btn">
                Chapter 1
              </Radio.Button>
              <Radio.Button value="Chapter 2" className="my-btn">
                Chapter 2
              </Radio.Button>
            </Radio.Group> */}
            <Modal
              className="my-modal"
              title={<Icon type="home" />}
              visible={this.state.visible}
              centered
              onOk={this.hideModal}
              onCancel={this.hideModal}
              footer={[
                <Button key="submit" loading={loading}>
                  <Icon type="close-circle" />
                </Button>,
                <Button key="back" type="primary" onClick={this.onOkTextClick}>
                  <Icon type="caret-right" />
                </Button>
              ]}
            >
              <Carousel afterChange={this.onCarouselChange}>
                <div>
                  <h1>
                    Prolog: <strong>1997 - 2002</strong>
                  </h1>
                </div>
                <div>
                  <h1>
                    Chapter 1: <strong>2003 - 2008</strong>
                  </h1>
                </div>
                <div>
                  <h1>
                    Chapter 2: <strong>2009 - 2014</strong>
                  </h1>
                </div>
                <div>
                  <h1>
                    Epilog: <strong>2015 - 2018</strong>
                  </h1>
                </div>
              </Carousel>
              <br />
              <br />
              <div className="chapter">
                <Steps current={1} progressDot={customDot}>
                  <Step title="Prolog" />
                  <Step title="Chapter 1" />
                  <Step title="Chapter 2" />
                  <Step title="Epilog" />
                </Steps>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    );
  }
}

export default Timeline;
