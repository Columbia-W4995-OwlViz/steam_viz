import React, { Component } from "react";

export default class Trivia extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trivia: 0
    };
    setInterval(() => {
      this.setState({
        trivia: Math.round(Math.random() * 100)
      });
    }, 1000);
  }
  render() {
    return (
      <div>
        <h3 id="trivia">This is Trivia {this.state.trivia}</h3>
      </div>
    );
  }
}
