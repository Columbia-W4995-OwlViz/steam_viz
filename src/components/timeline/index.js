import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import "./index.css";
import WordCloud from "react-d3-cloud";
import {
  Button,
  Spin,
  Steps,
  Popover,
  Carousel,
  Modal,
  Icon,
  Select
} from "antd";
import { relative } from "path";

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      chap: 0,
      words: [],
      update: value => null
    };
    this.extractYear = this.extractYear.bind(this);
    this.drawTimeline = this.drawTimeline.bind(this);
    this.drawGameCount = this.drawGameCount.bind(this);
    this.dataMapper = this.dataMapper.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.onCarouselChange = this.onCarouselChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  componentDidMount() {
    document.body.style = "background: black;";
    if (this.props.backFromMain) {
      this.showModal();
    }

    if (!this.props.data || this.props.data.length === 0) return;
    const ownerData = this.dataMapper(
      this.props.data,
      "ReleaseDate",
      "SteamSpyOwners"
    );
    const playerData = this.dataMapper(
      this.props.data,
      "ReleaseDate",
      "SteamSpyPlayersEstimate"
    );
    const countData = this.countMapper(ownerData);
    this.setState({
      update: this.drawGameCount(countData)
    });
    this.mapReduceReviews(this.props.data);
    //this.drawTimeline(playerData, "#timeline_player_svg", "Year", "Number of Players");
    this.drawTimeline(
      ownerData,
      "#timeline_owner_svg",
      "Year",
      "Number of Owners"
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.data) return;
    if (prevState.visible !== this.state.visible) return;
    if (prevState.chap !== this.state.chap) return;
    if (prevState.update !== this.state.update) return;
    const ownerData = this.dataMapper(
      this.props.data,
      "ReleaseDate",
      "SteamSpyOwners"
    );
    const playerData = this.dataMapper(
      this.props.data,
      "ReleaseDate",
      "SteamSpyPlayersEstimate"
    );
    const countData = this.countMapper(ownerData);
    this.setState({
      update: this.drawGameCount(countData)
    });
    // this.drawTimeline(playerData, "#timeline_player_svg", "Year", "Number of Players");
    this.drawTimeline(
      ownerData,
      "#timeline_owner_svg",
      "Year",
      "Number of Owners"
    );
    console.log("didupdate");
    this.mapReduceReviews(this.props.data);
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
    this.setState({
      chap: parseInt(a)
    });
  }

  handleSelectChange(value) {
    console.log(value);
    switch (value) {
      case "count":
        this.state.update((a, b) => parseInt(b.count) - parseInt(a.count));
        break;
      default:
        this.state.update((a, b) => parseInt(a.year) - parseInt(b.year));
    }
  }

  dataMapper(data, xField, yField) {
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
    return newData.filter(
      d =>
        !Number.isNaN(parseInt(d.x)) &&
        parseInt(d.x) > 1996 &&
        parseInt(d.x) !== 2019
    );
  }

  countMapper(data) {
    console.log("countMapper");
    let countData = [];
    let retData = [];
    data.forEach(d => {
      countData.push(d.x);
    });
    let countMap = countData.reduce((map, year) => {
      map[year] = (map[year] || 0) + 1;
      return map;
    }, Object.create(null));
    for (let key in countMap) {
      retData.push({ year: parseInt(key), count: countMap[key] });
    }
    console.log(retData);
    return retData;
  }

  mapReduceReviews(data) {
    let localwords = [];
    console.log("mapreduce");
    const reviews = data
      .filter(
        d =>
          d["Reviews"] &&
          !(d["Reviews"] === " ") &&
          !d["Reviews"].includes("http")
      )
      .map(d =>
        d["Reviews"]
          .replace(
            /[^\w\s]|and|or|is|a|in|its|the|with|of|also|not|to|it|only|be|this|into|if|lot|lots|you|from|on|for|me|e|r|just|my/gi,
            ""
          )
          .split(/\s+/)
      );
    const reviewMap = reviews
      .map(wordlist =>
        wordlist
          .filter(word => word.length > 2 && !/^\d+$/.test(word))
          .reduce(function(list, word) {
            list.push(word);
            return list;
          }, [])
      )
      .reduce(function(list, sublist) {
        sublist.forEach(word => {
          list.push(word);
        });
        return list;
      }, [])
      .reduce((map, word) => {
        map[word] = (map[word] || 0) + 1;
        return map;
      }, Object.create(null));

    for (let word in reviewMap) {
      if (reviewMap[word] > 30) {
        localwords.push({ text: word, value: reviewMap[word] });
      }
    }

    const fontSizeMapper = word => Math.log2(word.value) * 5;
    const rotate = word => word.value % 360;

    ReactDOM.render(
      <div>
        <WordCloud
          data={localwords}
          fontSizeMapper={fontSizeMapper}
          rotate={rotate}
          height={700}
          width={1200}
          fontSizeMapper={word => word.value * 0.5}
        />
      </div>,
      document.getElementById("wordcloud_left_div")
    );
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

  drawGameCount(data) {
    console.log("called drawGameCount");
    const svg = d3.select("#gamecount_svg");
    const width = 1200;
    const height = 600;
    const margin = { top: 100, right: 100, bottom: 100, left: 100 };

    let x = d3
      .scaleBand()
      .domain(data.map(d => parseInt(d.year)))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => parseInt(d.count))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    let xAxis = g =>
      g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    const yAxis = g =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());

    let bar = svg
      .append("g")
      .attr("fill", "white")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .style("mix-blend-mode", "luminosity")
      .attr("x", d => x(parseInt(d.year)))
      .attr("y", d => y(parseInt(d.count)))
      .attr("height", d => y(0) - y(parseInt(d.count)))
      .attr("width", x.bandwidth());

    let gx = svg
      .append("g")
      .call(xAxis)
      .attr("stroke-width", 2)
      .attr("color", "white")
      .style("font-size", "8px")
      .style("font-family", "'Press Start 2P', cursive");

    svg
      .append("g")
      .call(yAxis)
      .attr("stroke-width", 2)
      .attr("color", "white")
      .style("font-size", "8px")
      .style("font-family", "'Press Start 2P', cursive");

    const update = compare => {
      console.log("inside update");
      data.sort(compare);
      x.domain(data.map(d => parseInt(d.year)));
      const t = svg.transition().duration(750);

      bar
        .data(data, d => parseInt(d.year))
        .order()
        .transition(t)
        .delay((d, i) => i * 20)
        .attr("x", d => x(parseInt(d.year)));

      gx.transition(t)
        .call(xAxis)
        .selectAll(".tick")
        .delay((d, i) => i * 20);
    };
    return update;
  }

  drawTimeline(data, tag, xField, yField) {
    data = data.filter(record => record.y < 8000000);
    console.log("called drawTimeline");
    const svg = d3.select(tag);
    const width = 1200;
    const height = 600;
    const margin = { top: 100, right: 100, bottom: 100, left: 100 };

    const x = d3
      .scaleBand()
      .domain(
        data.map(d => parseInt(d.x)).sort((a, b) => parseInt(a) - parseInt(b))
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
            .attr("font-size", "12px")
            .text(xField)
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
            .attr("font-size", "12px")
            .text(yField)
        );

    svg
      .append("g")
      .call(xAxis)
      .attr("stroke-width", 2)
      .attr("color", "white")
      .style("font-size", "8px")
      .style("font-family", "'Press Start 2P', cursive");

    svg
      .append("g")
      .call(yAxis)
      .attr("stroke-width", 2)
      .attr("color", "white")
      .style("font-size", "8px")
      .style("font-family", "'Press Start 2P', cursive");

    svg
      .append("g")
      .selectAll("circle")
      .data(data.filter(d => d.x > 1996 && d.x !== 2019))
      .enter()
      .append("circle")
      .attr("cx", d => x(parseInt(d.x)))
      .attr("cy", d => y(parseInt(d.y)))
      .attr("r", 8)
      .attr("xtrue", d => parseInt(d.x))
      .attr("ytrue", d => parseInt(d.y))
      //.attr("fill", d => dotColor(parseInt(d.y)))
      .attr("fill", "white")
      .attr("opacity", 0.5)
      .on("mouseover", function(d) {
        console.log(this.getAttribute("xtrue"), this.getAttribute("ytrue"));
        d3.select(this)
          // .style("cursor", "pointer")
          .transition()
          // .delay(50)
          .attr("r", 30)
          .attr("opacity", 0.4)
          .attr("fill", "#ff1919")
          .duration(150);
        div
          .transition()
          .duration(200)
          .style("opacity", 0.8);
        let matrix = this.getScreenCTM().translate(
          +this.getAttribute("cx"),
          +this.getAttribute("cy")
        );
        div
          .html(
            "Year: " +
              this.getAttribute("xtrue") +
              "</br>" +
              "Number: " +
              this.getAttribute("ytrue")
          )
          .style("left", window.pageXOffset + matrix.e - 100 + "px")
          .style("top", window.pageYOffset + matrix.f + 20 + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this)
          // .style("cursor", "default")
          .transition()
          .delay(100)
          .attr("r", 8)
          .attr("opacity", 0.5)
          // .attr("fill", d => dotColor(parseInt(d.y)))
          .attr("fill", "white")
          .duration(100);
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

    var div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  }

  render() {
    const { loading } = this.props.loading;
    const Option = Select.Option;
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
          {loading ? (
            <div className="loading">
              <br />
              <br />
              <Spin size="large" />
            </div>
          ) : (
            <div id="visualizations">
              <div id="timeline_div">
                <svg id="timeline_owner_svg" viewBox="-100 -100 1300 700" />
                {/* <svg id="timeline_player_svg" viewBox="-100 -100 1300 700" />*/}
              </div>
              <div id="gamecount_div">
                <Select
                  className="select-order"
                  dropdownClassName="drop-order"
                  defaultValue="year"
                  onChange={this.handleSelectChange}
                >
                  <Option value="year">Year</Option>
                  <Option value="count">Count</Option>
                </Select>
                <svg id="gamecount_svg" viewBox="-100 -20 1300 700" />
              </div>
              <div id="wordcloud_left_div" />
            </div>
          )}
          <div id="enter">
            <Button className="my-btn" block onClick={this.showModal}>
              Enter Game
            </Button>
            <p style={{ marginTop: "10px" }}>
              Can you guess which game the dot represents?
            </p>
            <p
              style={{
                marginTop: "91vh",
                marginRight: "5vw",
                fontSize: "20px"
              }}
            >
              Explore other visualizations
            </p>
            <p style={{ marginTop: "3vh", marginRight: "5vw" }}>
              Number of games published on Steam in each year
            </p>
            <p style={{ marginTop: "81vh", marginRight: "5vw" }}>
              Word cloud of game reviews on Steam
            </p>
            <Modal
              className="my-modal"
              title={<Icon className="my-icon" type="home" />}
              visible={this.state.visible}
              centered
              footer={[
                <Button
                  className="modal-btn"
                  key="submit"
                  loading={loading}
                  onClick={this.hideModal}
                >
                  <Icon type="close-circle" />
                </Button>,
                <Button
                  className="modal-btn"
                  key="back"
                  type="primary"
                  onClick={() => this.props.preludeHide(this.state.chap)}
                >
                  <Icon type="caret-right" />
                </Button>
              ]}
            >
              <Carousel autoplay afterChange={this.onCarouselChange}>
                <div>
                  <h1>
                    Prolog: <strong>1997 - 2004</strong>
                  </h1>
                </div>
                <div>
                  <h1>
                    Chapter 1: <strong>2005 - 2012</strong>
                  </h1>
                </div>
                <div>
                  <h1>
                    Chapter 2: <strong>2013 - 2018</strong>
                  </h1>
                </div>
                <div>
                  <h1>
                    Epilog: <strong>1997 - 2018</strong>
                  </h1>
                </div>
              </Carousel>
              <br />
              <br />
              <div className="chapter">
                <Steps current={this.props.progress} progressDot={customDot}>
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
