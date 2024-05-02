import Pagination from 'react-bootstrap/Pagination';
import '../../YourPaginationStyle.css';
//function ClientTablePagination({handlePreviousPage,handleNextPage,info,handleFirstPage, handleLastPage}) {
function ClientTablePagination({info,call,page,setPage,totalPages}) { 
  
    const handleNextPage =  (e) =>{
      e.preventDefault();
      if(page < totalPages){
        setPage(page+1);
        call();
      }
  };
  
  const handlePreviousPage =  (e) =>{
    e.preventDefault();
    if(page > 1){
      setPage(page-1);
      call();
    }
  };

  const handleLastPage =  (e) =>{
    e.preventDefault();
    if(page<=totalPages){
      setPage(totalPages);
      call();
    }
  };

  const handleFirstPage =  (e) =>{
    e.preventDefault();
    if(page>=1){
      setPage(1);
      call();
    }
  };

  return (
    <div >
           <Pagination active = "true">
                <Pagination.First onClick={handleFirstPage}/>
                <Pagination.Prev onClick={handlePreviousPage}/>
                <Pagination.Item active  >{info?.current_page}</Pagination.Item>
                <Pagination.Next onClick={handleNextPage}/>
                <Pagination.Last onClick={handleLastPage}/>
          </Pagination>
    </div>
  );
}

export default ClientTablePagination;