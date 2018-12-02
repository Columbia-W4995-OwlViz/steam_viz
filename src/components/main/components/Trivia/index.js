import React, { Component } from "react";
import "./index.css";

export default class Trivia extends Component {
  randomTrivia() {
    var triviaSet = [
      "Rocksmith 2014 has the largest number of DLCs published on Steam.",
      // "The four games with the highest Metacritic scores are Half-Life, Half-Life 2, BioShock, and Grand Theft Auto V.",
      "Influent has the largest number of packages published on Steam.",
      "Street Fighter V has the largest number of movies published on Steam.",
      "The most expensive title on Game, SolidFace Pro 2013, is actually not a game.",
      "You can earn the greatest number of achievements in Maj'Eyal.",
      "Assetto Corsa has the largest number of screeshots published on Steam.",
      "Steam has different prices for different regions.",
      "Steam sells software, too.",
      "Steam has 67 million active monthly players.",
      "The number of active daily users on Steam is 33 million.",
      "The average number of Steam new users per month is 1.5 million.",
      "34% of Steam sales in 2017 come from North America."
    ];
    var i = Math.round(Math.random() * 12);
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
    }, 8000);
  }

  render() {
    return (
      <div>
        <p>DID YOU KNOW</p>
        <h3 id="trivia">{this.state.trivia}</h3>
      </div>
    );
  }
}
