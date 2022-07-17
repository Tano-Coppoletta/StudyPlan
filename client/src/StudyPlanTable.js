import { useEffect, useState } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';
import MyModal from './MyModal';
import StudyPlanRow from './StudyPlanRow';


function StudyPlan(props){
    const fulltime='full-time';
    const parttime='part-time';
    const [editable, setEditable] = useState(false);
    const [maxCFU,setMaxCFU]=useState();
    const [minCFU,setMinCFU]=useState();
    
    const handleNotEditable = () => setEditable(false);
    const handleEditable = () => setEditable(true);

    const handleDelete = (event)=>{
        event.preventDefault();
        props.deleteStudyPlan();
        setMaxCFU();
        setMinCFU();
        setEditable(false);
    }

    const handleAddStudyPlan = (type) => {
        
        props.addStudyPlan(type);
        setMaxCFU(type==parttime ? 40 : 80);
        setMinCFU(type==parttime ? 20: 60);
    }

    useEffect(() =>{
        setMaxCFU(props.hasStudyPlan=="part-time" ? 40 : 80);
        setMinCFU(props.hasStudyPlan=="part-time" ? 20 : 60)
    },[props.hasStudyPlan])

    
    if(props.loading===true){ 
        return <p>Loading study plan...</p>
    }else{
        if(!props.hasStudyPlan){
            //if the user doesn't have a study plan I show a button
            return <div align="center">
                <p></p>
                <Button onClick={(event) => {event.preventDefault(); handleAddStudyPlan(fulltime)}}>Create full time Study Plan</Button> <p></p>
                <Button onClick={(event) => {event.preventDefault(); handleAddStudyPlan(parttime)}}>Create part time Study Plan</Button>
                </div>
        }else{
            return (
            <> 
            
            <p></p>


                <MyModal editable={editable} handleEditable={handleEditable} handleNotEditable={handleNotEditable}   courses={props.courses} studyPlan={props.studyPlan} credits={props.credits}
                hasStudyPlan={props.hasStudyPlan} getCourseByCode={props.getCourseByCode} sumStudyPlanCredits={props.sumStudyPlanCredits} saveStudyPlan={props.saveStudyPlan}
                minCFU={minCFU} maxCFU={maxCFU}/>


                <h1>Study Plan of {props.name}</h1>
                <p>{props.hasStudyPlan}</p>
                <p>Min credits: {props.hasStudyPlan==fulltime ? 60 : 20}</p>
                <p>Max credits: {props.hasStudyPlan==fulltime ? 80 : 40}</p>
                <p>Credits in the study plan: {props.credits}</p>
                <>{props.credits<minCFU && <Alert variant='danger'>{"Credits < "+minCFU+ " click on \"edit\" and add courses or the study plan will not be saved"}</Alert>}</>
                
                <div><Button variant="success" onClick={handleEditable}>Edit</Button><> </><Button variant="danger" onClick={handleDelete}>Delete</Button></div>
               
                
                {props.credits!=0 && <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Credits</th>
                            <th>Enrolled</th>
                            <th>Max students</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.studyPlan.map((c) =>{return <StudyPlanRow key={c.code} course={c}/>})}
                    </tbody>
                </Table>}
            </>)
        }
    }
}

export default StudyPlan;