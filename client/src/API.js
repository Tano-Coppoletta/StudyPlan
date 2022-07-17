import { Course } from "./Course";

const APIURL = 'http://localhost:3001/api';

async function readCourses(){
    const url= APIURL + '/courses';
   
    try{
        const response=await fetch(url);
       
        if(response.ok){
            const list = await response.json();
            const courses=list.map((c) => {return new Course(c.code,c.name,c.credits,c.enrolled,c.maxstudents,c.incompatible, c.preparatory)});
            
            return courses;
        }else{
            //error
            const text= await response.text();
            throw new TypeError(text);
        }
    
    }catch(err){
        //network error
        throw err;
    }
}


const logIn = async (credentials) => {
    const response = await fetch(APIURL + '/sessions', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
    });

    if (response.ok) {
        
        const user = response.json();
        
        return user;
    }
    else {
        const errDetails = await response.text();
        throw errDetails;
    }
}

const getUserInfo = async () => {
    const response = await fetch(APIURL + '/sessions/current', {
        credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
        return user;
    } else {
        throw user;  // an object with the error coming from the server
    }
};

const logOut = async () => {
    const response = await fetch(APIURL + '/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });
    if (response.ok)
        return null;
}
const getStudyPlan = async() =>{
    const url=APIURL +'/studyPlanCourses';
    try{
        const response= await fetch(url,{
            credentials: 'include' 
        });
        if(response.ok){
            const list = await response.json();
            const courses=list.map((c) => {return new Course(c.code,c.name,c.credits,c.enrolled,c.maxstudents,c.incompatible, c.preparatory)});
            
            return courses;
        }else{
            //error
            const text= await response.text();
            throw new TypeError(text);
        }
        
    }catch(e){
        throw e;
    }
}

const hasStudyPlan = async () => {
    const url=APIURL+'/hasStudyPlan';
    try{
        const response= await fetch(url , {
            credentials: 'include' 
        });
        
        const res= await response.json();
        if(response.ok){
            return res;
        }else{
            const text= await response.text();
            throw new TypeError(text);
        }
    }catch(e){
        throw e;
    }
}

const deleteStudyPlan = async () => {
    const url=APIURL+'/studyPlan';
    try{
        const response = await fetch(url, {
            method: "DELETE",
            credentials: 'include',
        });
        if (response.ok) {
            return;
        } else {
            // application error (404, 500, ...)
            const text = await response.text();
            throw new TypeError(text);
        }
    } catch (e) {
        // network error
        throw e;
    }
}

const saveStudyPlan = async (courses,type) =>{
    const url=APIURL+'/saveStudyPlan/'+type;
    try{
        const response= await fetch(url, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(courses)
        });
        if(response.ok){
           
            return 200;
        }else if(response.status===422){
         
            return 422
        }else{
            const text = await response.text();
            throw new TypeError(text);
        }

    }catch(e){
        throw e;
    }
}




const API = {readCourses, logIn, logOut, getUserInfo, getStudyPlan, hasStudyPlan, deleteStudyPlan, saveStudyPlan};
export default API ;