import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Link } from 'react-router-dom';


const Breadcrumbs = ({bussines, friseur}) => {
    return (
      <Breadcrumb>
        <Link className='breadcrumb' to={`/${bussines}`}>{bussines } </Link>
        <Link className='breadcrumb active' to={`/${bussines}/${friseur}`} >
        / {friseur}
        </Link>
      </Breadcrumb>
    );
  }
  
  export default Breadcrumbs;