import { useEffect, useState } from "react";
import { Table, OverlayTrigger, Tooltip} from "react-bootstrap"
import { ArrowDownCircleFill, ArrowUpCircleFill,PlusCircleFill, InfoCircleFill } from 'react-bootstrap-icons';




function CourseRow(props) {
    const [expanded,setExpanded]=useState(false);
    const [isIncompatible,setIncompatible]=useState(false);
    const [incompatibleCourses,setIncompatibleCourses] = useState([]);
    const [hasPreparatoryInStudyPlan, setHasPreparatory]=useState(false);
 
    //this function set the state isIncompatible which says if this row can be added to the studyPlan or not
    const isIncompatibleC = () =>{
        if(props.editable){
            if(props.isIncompatible(props.course.code)){
                setIncompatible(true);
            }else{
                setIncompatible(false);
            }
        }
    }
    //this function set the incompatible courses
    //if the course of this row is incompatible with a course in the studyPlan 
    //here I set the incompatibleCourses, so that i can show them in the InfoCircleFill
    const setIncompatibleC= ()=>{
        if(props.editable){
            setIncompatibleCourses(props.getIncompatibleCourses(props.course.code));
            
        }
    }

    const setPreparatory= () => {
        if(props.editable){
            
            setHasPreparatory(props.isPreparatoryInCourseTable(props.course.preparatory));
        }
    } 

    useEffect(() =>{
        isIncompatibleC();
        setIncompatibleC();
        setPreparatory();
    },[props.studyPlan,props.courses]);
    

    const addCourse = (event) => {

        event.preventDefault();
        
        props.addCourseToStudyPlan(props.course.code,props.course.credits);

    } 
    

    return <>    
    <tr style={(isIncompatible || hasPreparatoryInStudyPlan) ? { color: "#e90000" }: {}}>
        <td>{props.course.code}</td>
        <td>{props.course.name}</td>
        <td>{props.course.credits}</td>
        <td>{props.course.enrolled}</td>
        <td>{props.course.maxstudents ? props.course.maxstudents : "-" }</td>

    <td>{(props.editable && (isIncompatible || hasPreparatoryInStudyPlan)) ?
        <OverlayTrigger
        key={"right"}
        placement={"right"}
        overlay={
            <Tooltip id={`tooltip`}>
                <>{isIncompatible && <p>Incompatible with: <strong>{incompatibleCourses.map((c)=> {return c.code + "-" +c.name})}</strong></p>}</>
                <>{hasPreparatoryInStudyPlan && <p>Preparatory course: <strong> {props.course.preparatory + "-"+props.getCourseByCode(props.course.preparatory).name}</strong></p>}</>
            </Tooltip>
        }>
            <InfoCircleFill/>
        </OverlayTrigger> 
        
         :
         
         props.editable && <PlusCircleFill style={{color : "#348C31"}} onClick={addCourse}/>
    }</td>
        <td>
            {!props.editable && (expanded ? <ArrowUpCircleFill style={{color : "#348C31"}} onClick={() => {setExpanded((expanded) => !expanded)}}/> 
            :
            <ArrowDownCircleFill style={{color : "#348C31"}} onClick={() => {setExpanded((expanded) => !expanded)}}/>)}

        </td>
        
        
    </tr>
    {!props.editable && expanded &&
    <tr key={props.course.code}>
        <td colSpan={5}>
        <Table>
            <tbody>

                    
                    {props.course.incompatible.length !==0 ?
                    props.course.incompatible.map((c) => {return <tr key={props.course.code+c.Incompatible}><th>Incompatible</th><td style={{color: "#e90000"}} width="88.5%">
                        {c.Incompatible + '-' + c.name}</td></tr>}
                    ) :
                    <tr key={props.course.code}><th>Incompatible</th><td style={{color: "#348C31"}} width="88.5%">No incompatible course</td></tr>
                    }
                
                <tr key={props.course.preparatory+props.course.code}>
                    <th>Required</th>

                    {
                    props.course.preparatory ? 
                        <td style={{color :"#FF6D0A"}}>{props.course.preparatory + "-"+props.getCourseByCode(props.course.preparatory).name}</td>
                    :
                        <td style={{color: "#348C31"}}>No course required</td>
                    }
                </tr>
            </tbody>
        </Table>
        </td>
    </tr>
    }   
    </>


}


export default CourseRow;