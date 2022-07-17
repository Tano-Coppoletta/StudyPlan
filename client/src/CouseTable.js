import { Table } from 'react-bootstrap';
import CourseRow from "./CourseRow";


function CourseTable(props) {
    
 

    if (props.loading === true) {
        return <h1>Loading</h1>
    }else{
    
        return (<>
            <p></p>
            <h1>Courses</h1>
            <Table striped hover>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Credits</th>
                        <th>Enrolled student</th>
                        <th>Max students</th>
                    </tr>
                </thead>
                <tbody>
                    {props.courses.map((c) =>{return <CourseRow key={c.code} course={c}  getCourseByCode={props.getCourseByCode}/>})}
                </tbody>
            </Table>
        </>);
    }
}

export default CourseTable;