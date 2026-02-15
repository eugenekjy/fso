const Filter = ({filterSelection, filter}) => {
  return (
    <div>
      filter shown with <input value={filter} onChange={filterSelection} />
    </div>
  )
}

export default Filter
