import Pagination from 'react-bootstrap/Pagination';

function ClientTablePagination() {
  return (
    <div >
        <Pagination active = "true">
          <Pagination.First pagination-color="#60A8C1"/>
          <Pagination.Prev />
          <Pagination.Item >{11}</Pagination.Item>

          <Pagination.Item active style={{backgroundColor:"#60A8C1"}} >{12}</Pagination.Item>
          <Pagination.Item>{13}</Pagination.Item>

          <Pagination.Next />
          <Pagination.Last />
        </Pagination>
    </div>
  );
}

export default ClientTablePagination;