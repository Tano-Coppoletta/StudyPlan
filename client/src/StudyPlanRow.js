import { useEffect, useState } from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap"
import {TrashFill, InfoCircleFill} from "react-bootstrap-icons"

function StudyPlanRow(props){
    const [isPreparatory, setPreparatory]=useState(false);
    const [preparatoryFor, setPreparatoryFor] = useState();

    const isPreparatoryCourse = () =>{
        if(props.editable){
            if(props.isPreparatory(props.course.code)){
                setPreparatory(true);
            }else
                setPreparatory(false);
        }
    }

    const setPreparatoryForCourse = () => {
        if(props.editable){
            setPreparatoryFor(props.getPreparatoryFor(props.course.code));
        }
    }

    useEffect(() =>{
        isPreparatoryCourse();
        setPreparatoryForCourse();
    
    },[props.studyPlan,props.editable])



    const deleteCourse = (event) => {
        event.preventDefault();
        props.deleteCourseFromStudyPlan(props.course.code);
    }

    return <>
        <tr style={isPreparatory ? { color: "#348C31" } : {}}>
            <td>{props.course.code}</td>
            <td>{props.course.name}</td>
            <td>{props.course.credits}</td>
            <td>{props.course.enrolled}</td>
            <td>{props.course.maxstudents ? props.course.maxstudents : "-"}</td>
            <td>{props.editable && ( isPreparatory ?
            <OverlayTrigger
            key={"right"}
            placement={"right"}
            overlay={
                <Tooltip id={`tooltip-`}>
                    {isPreparatory && <p>Preparatory for <strong>{preparatoryFor.code + "-" +preparatoryFor.name}</strong></p>}
                </Tooltip>
            }>
                <InfoCircleFill/>
            </OverlayTrigger> 
            :
            <TrashFill style={{color: "#e90000"}} onClick={deleteCourse}/>)}</td>
           
            
        </tr>
    </>
}

export default StudyPlanRow;   