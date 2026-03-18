import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";

actor {
  type HighScore = {
    playerName : Text;
    score : Nat;
  };

  module HighScore {
    public func compare(highScore1 : HighScore, highScore2 : HighScore) : Order.Order {
      Nat.compare(highScore2.score, highScore1.score);
    };
  };

  let highScoresMap = Map.empty<Text, Nat>();

  public shared ({ caller }) func submitHighScore(playerName : Text, score : Nat) : async () {
    highScoresMap.add(playerName, score);
  };

  public query ({ caller }) func getHighScores() : async [HighScore] {
    highScoresMap.toArray().map(
      func((name, score)) {
        { playerName = name; score };
      }
    ).sort();
  };
};
