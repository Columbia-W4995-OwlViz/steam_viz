import React, { Component } from "react";
import * as d3 from "d3";
import { Spin, Radio, Modal, Button, Select, Icon } from "antd";
import DataModalContent from "./components/DataModalContent";
import Search from "./search";
import "./index.css";

const Option = Select.Option;
d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};
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
      dataModalID: 10,
      gameSearchValue: undefined,
      gameSearchOptions: [],
      gameSearch: new Search(props.data, props.dataMap, 25),
      dataBinsMap: {}
    };
    this.handleTopFilter = this.handleTopFilter.bind(this);
    this.handleBottomFilter = this.handleBottomFilter.bind(this);
    this.drawChart = this.drawChart.bind(this);
    this.handleModalClick = this.handleModalClick.bind(this);
    this.handleGameSearchSelect = this.handleGameSearchSelect.bind(this);
    this.handleGameSearchChange = this.handleGameSearchChange.bind(this);
    this.handleGameSearchKeyDown = this.handleGameSearchKeyDown.bind(this);
    this.handleGameSearchSearch = this.handleGameSearchSearch.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleTooltipClick = this.handleTooltipClick.bind(this);
  }

  componentDidMount() {
    document.body.style = "background: black;";
    console.log(this.props.startYear);
    console.log(this.props.endYear);

    if (this.state.gameSearchValue !== undefined) {
      // d3.select("body")
      //   .append("p")
      //   .html("hello");
      d3.select("circle#id__" + this.state.gameSearchValue)
        .attr("opacity", 0.5)
        .attr("fill", "#ff1919")
        .transition();
      let cx = d3.select("circle#id__" + this.state.gameSearchValue).attr("cx");
      let cy = d3.select("circle#id__" + this.state.gameSearchValue).attr("cy");
      // tooltip div
      d3.select("body")
        .append("div")
        .html(
          this.props.dataMap["" + this.state.gameSearchValue]["ResponseName"]
        )
        .style("left", cx + "px")
        .style("top", cy + 10000 + "px")
        .attr("id", "id__" + this.state.gameSearchValue)
        .attr("class", "tooltip")
        .style("opacity", 0.8);
      console.log(
        d3.select("div#id__" + this.state.gameSearchValue).attr("opacity")
      );
      // .attr("id", "id__" + this.state.gameSearchValue)
    } else {
      // div
      //   .transition()
      //   .duration(500)
      //   .style("opacity", 0);
    }

    const srch = new Search(this.props.data, this.props.dataMap, 25);
    const bins = this.dataBins(
      this.props.data,
      this.state.topFilter,
      this.state.bottomFilter
    );
    this.setState({
      gameSearch: srch,
      gameSearchOptions: srch.exec(""),
      dataBins: bins
    });
    this.drawChart(bins, this.props.dataMap);
  }

  componentDidUpdate(prevProps, prevState) {
    // if (!(this.props.data && this.props.data.length)) return;
    if (this.props.loading) return;
    if (this.state.gameSearchValue === undefined) {
      d3.select("#tooltip_gamesearch")
        .style("opacity", 0)
        .transition();
    }
    if (prevState.gameSearchValue !== undefined) {
      d3.select("circle#circle_id__" + prevState.gameSearchValue)
        .attr("opacity", 0.5)
        .attr("fill", "white")
        .transition();
    }

    if (this.state.gameSearchValue !== undefined) {
      d3.select("circle#circle_id__" + this.state.gameSearchValue)
        .attr("opacity", 0.8)
        .attr("fill", "#ff1919")
        .moveToFront()
        .transition();
      let c = document.getElementById(
        "circle_id__" + this.state.gameSearchValue
      );
      if (c) {
        let matrix = c
          .getScreenCTM()
          .translate(+c.getAttribute("cx"), +c.getAttribute("cy"));

        d3.select("#tooltip_gamesearch")
          // .html(
          //   this.props.dataMap["" + this.state.gameSearchValue]["ResponseName"]
          // )
          .style("left", window.pageXOffset + matrix.e - 100 + "px")
          .style("top", window.pageYOffset + matrix.f + 20 + "px")
          .style("opacity", 0.8);
      }
    }

    //init or redraw everything, BE CAREFUL
    if (
      prevProps.loading === this.props.loading &&
      prevState.canvasKey === this.state.canvasKey
    )
      return;
    const srch = new Search(this.props.data, this.props.dataMap, 25);
    const bins = this.dataBins(
      this.props.data,
      this.state.topFilter,
      this.state.bottomFilter
    );
    this.setState({
      gameSearch: srch,
      gameSearchOptions: srch.exec(""),
      dataBins: bins
    });
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
    let dataBinsMap = {};
    data.forEach(record => {
      bins.forEach((item, i) => {
        if (record[xField] >= item.x0 && record[xField] < item.x1) {
          dataBinsMap[record.QueryID] = {
            dataBinName: item.x1.toString(),
            dataBinY: parseInt(record[yField])
          };
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
    this.setState({
      dataBinsMap
    });
    return joinBins;
  }

  /*
   * https://beta.observablehq.com/@baspieren/functional-programming-d3-scatterplot
   */
  drawChart(bins, dataMap) {
    // bins = bins.filter(record => record.y < 8000000);
    //ACCESS this.state.data
    const svg = d3.select("#main_svg").datum(bins);
    const width = 1600;
    const height = 500;
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

    // const dotColor = d3
    //   .scaleLinear()
    //   .domain([
    //     0,
    //     d3.median(bins, d => parseInt(d.y)),
    //     d3.max(bins, d => parseInt(d.y))
    //   ])
    //   .nice()
    //   .range(["orange", "white", "steelblue"]);

    // x-axis
    svg
      .append("g")
      .call(xAxis)
      .attr("stroke-width", 2)
      .attr("color", "white")
      .style("font-size", "8px")
      .style("font-family", "'Press Start 2P', cursive");

    // x-axis label
    svg
      .append("text")
      .attr("x", (margin.left + width - margin.right) / 2 - 55)
      .attr("y", height - 10)
      .text(this.state.topFilter)
      .style("font-family", "'Press Start 2P', cursive")
      .style("fill", "white")
      .attr("text-anchor", "middle");

    // y-axis
    svg
      .append("g")
      .call(yAxis)
      .attr("stroke-width", 2)
      .attr("color", "white")
      .style("font-size", "8px")
      .style("font-family", "'Press Start 2P', cursive");

    // y-axis label
    svg
      .append("text")
      .attr("x", -height / 2 - 80)
      .attr("y", margin.left / 2 - 95)
      .text(this.state.bottomFilter)
      .attr("transform", "rotate(-90)")
      .style("font-family", "'Press Start 2P', cursive")
      .style("fill", "white");

    // data points
    svg
      .append("g")
      .selectAll("circle")
      .data(bins)
      .enter()
      .append("circle")
      .attr("id", d => "circle_id__" + d.id)
      .attr("cx", d => x(d.name))
      .attr("cy", d => y(parseInt(d.y)))
      .attr("r", 8)
      // .attr("fill", d => dotColor(parseInt(d.y)))
      .attr("fill", "white")
      .attr("opacity", 0.5)
      // START USE OF SOURCE: Martijn Reeuwijk
      .on("mouseover", function(d) {
        d3.select(this)
          // .attr("r", 10)
          .attr("opacity", 0.5)
          .attr("fill", "#ff1919")
          .transition();
        div
          .transition()
          .duration(200)
          .style("opacity", 0.8);
        let matrix = this.getScreenCTM().translate(
          +this.getAttribute("cx"),
          +this.getAttribute("cy")
        );
        div
          .html(dataMap[d.id]["ResponseName"])
          .style("left", window.pageXOffset + matrix.e - 100 + "px")
          .style("top", window.pageYOffset + matrix.f + 20 + "px");
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

    // tooltip div
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

  handleGameSearchSelect(value) {
    this.setState({
      gameSearchValue: value
    });
  }

  handleGameSearchChange(value) {}
  handleGameSearchKeyDown(e) {
    // if (e.keyCode !== 13) return;
    // this.setState({
    //   gameSearchValue: this.state.gameSearchOptions[0]
    //     ? this.state.gameSearchOptions[0]
    //     : undefined
    // });
  }

  handleGameSearchSearch(value) {
    const localOptions = this.state.gameSearch.exec(value);
    this.setState({
      gameSearchOptions: localOptions
      // gameSearchValue:
      //   localOptions && localOptions.length ? localOptions[0] : undefined
    });
  }

  // hideSearchBox() {
  //   document.getElementsByClassName("my-modal").style.display = "none";
  // }

  handleClear(e) {
    this.setState({
      gameSearchValue: undefined,
      gameSearchOptions: this.state.gameSearch.exec("")
    });
  }

  handleTooltipClick(e) {
    console.log("tooltipclick");
    this.setState({
      showDataModal: true,
      dataModalID: this.state.gameSearchValue
    });
  }

  render() {
    const { loading, data, dataMap } = this.props;
    const { dataModalID } = this.state;
    const { gameSearchOptions } = this.state;
    const options = gameSearchOptions.map(uid => (
      <Option key={uid}>{dataMap[uid].ResponseName}</Option>
    ));
    return (
      <div>
        <div id="canvas-wrapper">
          {!loading ? (
            <Modal
              className="my-modal"
              title={dataMap[dataModalID]["ResponseName"]}
              visible={this.state.showDataModal}
              onOk={this.handleModalClick}
              onCancel={this.handleModalClick}
              footer={[
                <Button key="ok" type="primary" onClick={this.handleModalClick}>
                  OK
                </Button>
              ]}
            >
              <DataModalContent
                loading={loading}
                data={data}
                dataMap={dataMap}
                dataID={dataModalID}
              />
            </Modal>
          ) : (
            []
          )}
          {/* <div id="home">
            <Button type="primary" onClick={this.props.preludeShow}>
              <Icon type="left" />Timeline
            </Button>
          </div> */}
          <div id="header">
            <Button type="primary" onClick={this.props.preludeShow}>
              <Icon type="left" />
              Timeline
            </Button>
            <Button
              className="my-clear-btn"
              onClick={this.handleClear}
              style={{
                display:
                  this.state.gameSearchValue !== undefined ? "inline" : "none"
              }}
            >
              Clear
            </Button>
            <Select
              className="my-select"
              dropdownClassName="my-dropdown"
              showSearch
              autoFocus={true}
              value={this.state.gameSearchValue}
              placeholder={"Enter another game..."}
              defaultActiveFirstOption={true}
              showArrow={false}
              // filterOption={(iv, opt) => {
              //   return opt.props.children.match(new RegExp(iv, "i"));
              // }}
              filterOption={false}
              onSelect={this.handleGameSearchSelect}
              onInputKeyDown={this.handleGameSearchKeyDown}
              onChange={this.handleGameSearchChange}
              onSearch={this.handleGameSearchSearch}
              notFoundContent={null}
            >
              {options}
            </Select>
            {/* <Input className="my-input" placeholder="Enter another game..." /> */}
          </div>
          {loading ? (
            <div className="loading">
              <br />
              <br />
              <Spin size="large" />
              <p id="loading-text">game loading</p>
              {/* {this.hideSearchBox()} */}
            </div>
          ) : (
            <div id="main-canvas" key={this.state.canvasKey}>
              <svg id="main_svg" viewBox="-100 -100 1700 650" />
            </div>
          )}
          <div id="xlabel">
            {document.getElementsByClassName("my-btn-group").value}
          </div>
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
        <Button
          className="tooltip"
          style={{ opacity: 0, position: "absolute" }}
          id="tooltip_gamesearch"
          onClick={this.handleTooltipClick}
        >
          {this.state.gameSearchValue !== undefined
            ? dataMap[this.state.gameSearchValue].ResponseName
            : ""}
        </Button>
      </div>
    );
  }
}

export default Main;
