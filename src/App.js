import React, { Component } from "react";

import { Layout, Select } from "antd";
import * as d3 from "d3";
import Main from "./components/main";
import Timeline from "./components/timeline";
import Trivia from "./components/main/components/Trivia";
import "./App.css";
const { Content } = Layout;

const { Option } = Select;
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataMap: {},
      loading: true,
      prelude: true,
      progress: 0,
      startYear: 1997,
      endYear: 2002
    };
    this.preludeShow = this.preludeShow.bind(this);
    this.preludeHide = this.preludeHide.bind(this);
    this.selectChapter = this.selectChapter.bind(this);
  }

  componentDidMount() {
    d3.csv("steam_game_features.csv", newData => {
      return newData;
    }).then(data => {
      // console.log(data);
      let dataMap = {};
      data.forEach(e => {
        dataMap[e.QueryID] = e;
      });
      let uniqueIDs = new Set();
      data.forEach(d => {
        uniqueIDs.add(d.QueryID);
      });
      const refinedData = Array.from(uniqueIDs).map(uid => dataMap[uid]);
      // console.log(refinedData);
      this.setState({
        data: refinedData,
        dataMap,
        // uniqueIDs,
        loading: false
      });
    });
  }
  preludeHide(chapter) {
    console.log("calling preludeHide");
    console.log(chapter);
    this.setState({ prelude: false });
    this.selectChapter(chapter);
  }

  preludeShow() {
    this.setState({ prelude: true });
    this.setState({
      progress: this.state.progress < 3 ? this.state.progress + 1 : 3
    });
  }

  selectChapter(chapter) {
    if (chapter === 0) {
      this.setState({
        startYear: 1997,
        endYear: 2002
      });
    } else if (chapter === 1) {
      this.setState({
        startYear: 2003,
        endYear: 2008
      });
    } else if (chapter === 2) {
      this.setState({
        startYear: 2009,
        endYear: 2014
      });
    } else {
      this.setState({
        startYear: 2015,
        endYear: 2018
      });
    }
  }

  render() {
    console.log(this.state.prelude);
    return (
      <div className="App">
        <Layout>
          {/* <Sider
            style={{
              overflow: "auto",
              height: "100vh",
              position: "fixed",
              left: 0
            }}
          >
            <div className="logo" />
          </Sider> */}
          <Layout style={{ marginLeft: 0 }}>
            <Content style={{ margin: "0", overflow: "initial" }}>
              <div
                style={{ padding: 24, background: "#000", textAlign: "center" }}
              >
                <Trivia />
                {this.state.prelude ? (
                  <Timeline
                    data={this.state.data}
                    dataMap={this.state.dataMap}
                    loading={this.state.loading}
                    preludeHide={this.preludeHide}
                    progress={this.state.progress}
                  />
                ) : (
                  <Main
                    data={this.state.data}
                    dataMap={this.state.dataMap}
                    loading={this.state.loading}
                    preludeShow={this.preludeShow}
                    section={this.state.section}
                    startYear={this.state.startYear}
                    endYear={this.state.endYear}
                    // uniqueIDs={this.state.uniqueIDs}
                  />
                )}
              </div>
            </Content>
            {/* <Footer style={{ textAlign: "center" }} /> */}
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default App;
