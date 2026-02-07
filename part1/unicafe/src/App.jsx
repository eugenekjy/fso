import { useState } from 'react';

const StatisticLine = (props) => {
  return (
    <tr>
      <td>{props.text}</td>
      <td>{props.value}</td>
    </tr>
  );
};

const Statistics = (props) => {
  return (
    <>
      <table>
        <tbody>
          <StatisticLine text="good" value={props.good} />
          <StatisticLine text="neutral" value={props.neutral} />
          <StatisticLine text="bad" value={props.bad} />
          <StatisticLine text="all" value={props.all} />
          <StatisticLine text="average" value={props.average} />
          <StatisticLine text="positive" value={props.positive} />
        </tbody>
      </table>
    </>
  );
};

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [bad, setBad] = useState(0);
  const all = good + bad + neutral;
  const average = (good - bad) / all;
  const positive = (good / all) * 100;

  const handleClick = (rating) => {
    if (rating === good) {
      return () => setGood(good + 1);
    } else if (rating === neutral) {
      return () => setNeutral(neutral + 1);
    } else {
      return () => setBad(bad + 1);
    }
  };

  return (
    <>
      <h2>give feedback</h2>
      <div>
        <button onClick={handleClick(good)}>good {good}</button>
        <button onClick={handleClick(neutral)}>neutral {neutral}</button>
        <button onClick={handleClick(bad)}>bad {bad}</button>
      </div>
      <h2>statistics</h2>
      {all ? (
        <Statistics
          good={good}
          neutral={neutral}
          bad={bad}
          all={all}
          average={average}
          positive={positive}
        />
      ) : (
        <p>No feedback given</p>
      )}
    </>
  );
};

export default App;
