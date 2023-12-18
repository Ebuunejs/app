import { useState } from 'react'

const INITIAL_STATE = [
  { id: 1, name: 'Tommy', age: 21, hobby: 'coding' },
  { id: 2, name: 'Anna', age: 19, hobby: 'reading' },
  { id: 3, name: 'Bobby', age: 16, hobby: 'swimming' },
  { id: 4, name: 'Lauren', age: 25, hobby: 'running' }
]

const capitalize = (word) => {
  return word[0].toUpperCase() + word.slice(1)
}

function ClientTable01() {
  const [users] = useState(INITIAL_STATE)

  const renderUsers = () => {
    return users.map(({ id, name, age, hobby }) => {
      return <tr key={id} >
      <td style={{ padding: '10px', border: '1px solid black' }}>{id}</td>
      <td style={{ padding: '10px', border: '1px solid black' }}>{name}</td>
      <td style={{ padding: '10px', border: '1px solid black' }}>{age}</td>
      <td style={{ padding: '10px', border: '1px solid black' }}>{hobby}</td>
    </tr>
    })
  }

  const renderHeader = () => {
    return <tr>
      {Object.keys(INITIAL_STATE[0]).map(key => <th>{capitalize(key)}</th>)}
    </tr>
  }

  const renderTable = () => {
    return (
      <table>
        {renderHeader()}
        <tbody>
          {renderUsers()}
        </tbody>
      </table>
    )
  }

  return (
    <div style={{ margin: '5px' }}>
      {renderTable()}
    </div>
  );
}

export default ClientTable01

/*import Table from 'react-bootstrap/Table';

function ClientTable() {
  return (
    <Table responsive>
      <thead>
        <tr>
          <th>#</th>
          {Array.from({ length: 12 }).map((_, index) => (
            <th key={index}>Table heading</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          {Array.from({ length: 12 }).map((_, index) => (
            <td key={index}>Table cell {index}</td>
          ))}
        </tr>
        <tr>
          <td>2</td>
          {Array.from({ length: 12 }).map((_, index) => (
            <td key={index}>Table cell {index}</td>
          ))}
        </tr>
        <tr>
          <td>3</td>
          {Array.from({ length: 12 }).map((_, index) => (
            <td key={index}>Table cell {index}</td>
          ))}
        </tr>
      </tbody>
    </Table>
  );
}

export default ClientTable;*/