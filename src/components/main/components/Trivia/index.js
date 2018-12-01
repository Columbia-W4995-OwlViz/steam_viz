import React, { Component } from "react";

export default class Trivia extends Component {
  randomTrivia() {
    var triviaSet = [
      "Rocksmith 2014 has the largest number of DLCs published on Steam.",
      "The four games with the highest Metacritic scores are Half-Life, Half-Life 2, BioShock, and Grand Theft Auto V.",
      "Influent has the largest number of packages published on Steam.",
      "Street Fighter V has the largest number of movies published on Steam.",
      "The most expensive tilte on Game, SolidFace Pro 2013, is actually not a game.",
      "You can earn the greatest number of achievements in Maj'Eyal.",
      "Assetto Corsa has the largest number of screeshots published on Steam."
    ];
    var i = Math.round(Math.random() * 7);
    return triviaSet[i];
  }

  constructor(props) {
    super(props);
    this.state = {
      trivia: "Steam is the largest distribution platform for PC gaming."
    };

    setInterval(() => {
      this.setState({
        trivia: this.randomTrivia()
      });
    }, 5000);
  }

  render() {
    return (
      <div>
        <h3 id="trivia">{this.state.trivia}</h3>
      </div>
    );
  }
}
