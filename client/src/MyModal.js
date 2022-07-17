import { useEffect, useState } from 'react';
import { Table, Button, Modal,Alert ,Row} from 'react-bootstrap';
import CourseRow from './CourseRow';
import StudyPlanRow from './StudyPlanRow';

function MyModal(props){
    const [studyPlanCourses, setStudyPlanCourses] =useState([]);
    const [notInStudyPlanCourses,setNotInStudyPlanCourses] = useState([]);
    const [message,setMessage]=useState('');
    const [loading,setLoading]=useState(false);
    


    //this function generates the list of all the courses that are not in the studyPlan
    const retriveNotInStudyPlanCourses = () =>{
        const avCourse=[];
       
        let a=false;
        for(let i=0;i<props.courses.length;i++){
            if(props.hasStudyPlan!=false){
                for(let j=0;j<studyPlanCourses.length;j++){
                    if(studyPlanCourses[j].code==props.courses[i].code){
                        a=true;
                
                    }
                }
                if(!a){
                    avCourse.push(props.courses[i]);
                }
                a=false;
                
            }else{
                
                return props.courses;
                
            }
        }
        return avCourse;
    }

    const addCourseToStudyPlan = (code,credits) => {
        
        setStudyPlanCourses((oldStudyPlan) => {
            let vect=[];
           
            //if the alert is visible I make it not visible at the first change
            
            setMessage('');
            vect=[...oldStudyPlan, props.getCourseByCode(code)];
            return vect;
        });
        
    }


    const deleteCourseFromStudyPlan = (code) => {
        
        setStudyPlanCourses((oldStudyPlan) => {
            let vect=[];
           
            //if the alert are visible we make them not visible at the first change of the studyPlan
            //next evauation will be done when the user click on save
            setMessage('');
            vect=oldStudyPlan.filter((c)=>c.code!=code);
            return vect;
        });
        
    }

    
    useEffect(() => {
        setLoading(true);
        setStudyPlanCourses(props.studyPlan); 
        setNotInStudyPlanCourses(retriveNotInStudyPlanCourses());
        setLoading(false);
         
    },[props.editable]);

    useEffect(() =>{
        setNotInStudyPlanCourses(retriveNotInStudyPlanCourses());
        
    },[studyPlanCourses,props.editable]);  

    function handleDiscardChanges(){
        setMessage('');
        setStudyPlanCourses(props.studyPlan);
        props.handleNotEditable();
    }

   async function handleSave(){
        //the check on the credits is done in both frontend and backend
        //the check on enrolled/maxstudents is done only in backend since we assume that the value in frontend can be not the actual one
        const sumCredits=props.sumStudyPlanCredits(studyPlanCourses);
        setLoading(true);
        if(sumCredits<props.minCFU || sumCredits>props.maxCFU){
            setMessage({type: 'danger', msg:'Credits not in the valid range: min='+props.minCFU+ ' max='+props.maxCFU})
        }else{
            const resp= await props.saveStudyPlan(studyPlanCourses,props.hasStudyPlan);
            if(resp){
                props.handleNotEditable();
                
            }else{
                setMessage({type: 'danger', msg: 'Max students enrolled for one or more courses'})
                
                
            }
        }
        setLoading(false);
    }

    function isIncompatible(code){
        if(!props.hasStudyPlan){
            return false;
        }
        for(let i=0;i<studyPlanCourses.length;i++){
            
            for(const c of studyPlanCourses[i].incompatible){
                if(c.Incompatible==code){
                    
                    return true;
                }       
            }
        }

    }

    function getIncompatibleCourses(code){
        const inc=[];
        if(!props.hasStudyPlan){
            return inc;
        }
        for(let i=0;i<studyPlanCourses.length;i++){
            
            for(const c of studyPlanCourses[i].incompatible){
                if(c.Incompatible==code){
                    
                    inc.push(studyPlanCourses[i]);
                }       
            }
        }
        return inc;
    }

    function isPreparatory(code){
        if(!props.hasStudyPlan)
            return false;
        for(let i=0;i<studyPlanCourses.length;i++){
            
            if(studyPlanCourses[i].preparatory==code){
               return true;
            }
        }
    }

    function getPreparatoryFor(code){
        if(!props.hasStudyPlan)
            return;
        for(let i=0;i<studyPlanCourses.length;i++){
            
            if(studyPlanCourses[i].preparatory==code){
               return studyPlanCourses[i];
            }
        }
    }

    function isPreparatoryInCourseTable(code){
        if(!props.hasStudyPlan)
            return false;
        for(let i=0;i<notInStudyPlanCourses.length;i++){
            if(notInStudyPlanCourses[i].code==code){
                return true;
            }
        }
    }

    function isOverTheCreditsLimit(credits){

        let cfu=props.sumStudyPlanCredits(studyPlanCourses)+credits;
            
        if(cfu>props.maxCFU){
            return true;
        }
        return false;
    }

    

    return <div>
        <Modal size="lg" show={props.editable} onHide={props.handleNotEditable}>
                <Modal.Header>
                    <Modal.Title>Edit your study plan!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h2 align="center">Your courses</h2>
                        <h2>Credits: {props.sumStudyPlanCredits(studyPlanCourses)}</h2>
                        <p>Min: {props.minCFU} Max: {props.maxCFU}</p>
                        
                        <Table>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Credits</th>
                                    <th>Enrolled</th>
                                    <th>Max students</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studyPlanCourses.map((c) =>{return <StudyPlanRow key={c.code} course={c} isCourseRow={false} editable={props.editable} studyPlan={studyPlanCourses}
                                 deleteCourseFromStudyPlan={deleteCourseFromStudyPlan} isPreparatory={isPreparatory} getPreparatoryFor={getPreparatoryFor}/>})}
                            </tbody>
                        </Table>
                        <h2 align="center">All Courses</h2>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Credits</th>
                                    <th>Enrolled</th>
                                    <th>Max students</th>
                                    <th>{props.editable && "Add course"}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.editable && notInStudyPlanCourses.map((c) =>{
                                    
                                    return <CourseRow key={c.code} course={c} editable={props.editable} isCourseRow={true}
                                  addCourseToStudyPlan={addCourseToStudyPlan} isIncompatible={isIncompatible} studyPlan={studyPlanCourses} courses={notInStudyPlanCourses} getIncompatibleCourses={getIncompatibleCourses}
                                  isPreparatoryInCourseTable={isPreparatoryInCourseTable} getCourseByCode={props.getCourseByCode} isOverTheCreditsLimit={isOverTheCreditsLimit}/>})}
                            </tbody>
                        </Table>

                    </Modal.Body>
                    <Modal.Footer>
                    {message && <Row><Alert variant={message.type} onClose={() => props.setMessage('')}>{message.msg}</Alert></Row>}
                    
                    {loading ? <h1>Loading...</h1>: <><Button variant="danger" onClick={handleDiscardChanges}>
                        Discard changes
                    </Button>
                    <Button variant="success" onClick={(event) => {event.preventDefault();handleSave();}}>
                        Save Changes
                    </Button></>}
                    </Modal.Footer>
                </Modal>
    </div>
}

export default MyModal;