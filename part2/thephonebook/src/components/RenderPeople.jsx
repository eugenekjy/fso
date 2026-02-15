const RenderPeople = (props) => {
  return (
    <>
      {props.personsToShow.map((person) => (
        <p key={person.id}>
          {person.name} {person.number}
          <button
            onClick={() => props.handleDelete(person.id)}
            style={{ marginLeft: '10px' }}
          >
            delete
          </button>
        </p>
      ))}
    </>
  );
};

export default RenderPeople;
