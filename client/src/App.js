import './App.css';
import { Container, Row , Alert} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CourseTable from './CouseTable';
import {useEffect, useState} from 'react';
import {BrowserRouter, Route, Routes, Outlet, Navigate} from 'react-router-dom';
import { LoginForm } from "./AuthComponents";
import API from './API';
import MyNavbar from './MyNavbar';
import StudyPlan from './StudyPlanTable';


function App() {
  const [courses, setCourses] = useState();
  const [loading,setLoading] =useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] =useState('');
  const [studyPlan, setStudyPlan]=useState([]);
  //this state is initially a boolean but then stores the string "full-time" or "part-time"
  const [hasStudyPlan, setHasStudyPlan]=useState(false);
  const [credits,setCredits] = useState(0);
  const [isLoginPage,setLoginPage]=useState(false);
  

  useEffect(() => {
    const checkAuth = async () => {
      try{
      const user=await API.getUserInfo(); 
      setLoggedIn(true);
      setName(user.name);
      }catch(err){
        setLoggedIn(false);
      }

    };
    checkAuth();
  }, []);


  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({msg: `Welcome, ${user.name}!`, type: 'success'});
      setName(user.name);
    }catch(err) {
      setMessage({msg: err, type: 'danger'});
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setMessage('');  
    setName('');
    setHasStudyPlan(false);
  };
  //calls the api to retrieve all the courses
  async function loadCourses(){
    let list;
    setLoading(true);
    await API.readCourses().then(
      value => {
        list=value;
        setCourses(list); 
        setLoading(false);
      }
    ).catch(err => console.error(err));
    
    
  }
  //calls the api to retrieve all the courses in the studyPlan for a certain user
  async function getStudyPlan(){
    
    if(isLoggedIn){
        try{
      setLoading(true);
      const studyPlan = await API.getStudyPlan();
      setStudyPlan(studyPlan);
      setCredits(sumStudyPlanCredits(studyPlan));
      setLoading(false);
      }catch(err){
        setMessage({msg: err, type: 'danger'});
      }
    }
  }

  useEffect(() =>{
    loadCourses(); 
    getStudyPlan();
  },[]);

  const addStudyPlan = async (type) =>{
    try{
      setLoading(true);
      setHasStudyPlan(type);
      setCredits(0);
      setLoading(false);
    }catch(err){
      setMessage({msg: err, type: 'danger'});
    }

  }
  
  
  
  async function userHasStudyPlan(){
    if(isLoggedIn){
      try{
        const userHasStudyPlan= await API.hasStudyPlan();
        setHasStudyPlan(userHasStudyPlan["StudyPlan"]);
      }catch(err){
        setMessage({msg: err, type: 'danger'});
      }
    }
  }


  //compute the sum of all credits of all courses included in the studyPlan
  function sumStudyPlanCredits(studyplan){

    let sum=0;
    for(let i=0;i<studyplan.length;i++){
        sum+=studyplan[i].credits;
    }
    return sum;
}

  useEffect(() => {
    userHasStudyPlan(false);
    getStudyPlan();
  },[isLoggedIn]);

  //Delete the study plan for a certain user
  //set the states related to the studyPlan to a default value
  const deleteStudyPlan = async () => {
    try{
      setLoading(true);
      await API.deleteStudyPlan();
      loadCourses();
      setStudyPlan([]);
      setHasStudyPlan(false);
      setCredits(0);
      setLoading(false);
    }catch(err){
      setMessage({msg: err, type: 'danger'});
    }
  }


  const getCourseByCode = (code) => {
    for(let i=0;i<courses.length;i++){
        if(courses[i].code==code){
          return courses[i];
        }
    }
    return -1;
  }

  async function saveStudyPlan(courses,type){
    
    try{
      
      const returnCode=await API.saveStudyPlan(courses,type);
      if(returnCode==200){
        //when we save a studyPlan we reaload the courses (enrolled has changed)
        setLoading(true);
        loadCourses();
        getStudyPlan();
        setLoading(false);
        return true;
      }else if(returnCode==422){
        return false;
      }
    }catch(err){
      setMessage({msg: err, type: 'danger'});
    }
  }

  return (
    <>
    
    <BrowserRouter>
      <Routes>
        <Route element={<Homepage loading={loading} courses={courses} isLoggedIn={isLoggedIn} handleLogin={handleLogin} handleLogout={handleLogout}
        message={message} setMessage={setMessage} isLoginPage={isLoginPage} setLoginPage={setLoginPage}/>}>

            <Route path='/' element={isLoggedIn ? 
            <><StudyPlan loading={loading} name={name} hasStudyPlan={hasStudyPlan} studyPlan={studyPlan} credits={credits} deleteStudyPlan={deleteStudyPlan}
            addCourses={saveStudyPlan} courses={courses} getCourseByCode={getCourseByCode} sumStudyPlanCredits={sumStudyPlanCredits} saveStudyPlan={saveStudyPlan} addStudyPlan={addStudyPlan}/>
            <CourseTable loading={loading} courses={courses} getCourseByCode={getCourseByCode} studyPlan={studyPlan}/></>
             : <CourseTable loading={loading} courses={courses} getCourseByCode={getCourseByCode} studyPlan={studyPlan}/>}/>
            <Route path='/login'  element={isLoggedIn ? <Navigate replace to='/'/> : <LoginForm login={handleLogin} isLoginPage={isLoginPage} setLoginPage={setLoginPage}/>}/>

        </Route>
        <Route path="*" element={<Navigate replace to="/"/>} />
        
      </Routes>
         
      
    </BrowserRouter>
    </>
  )

}

function Homepage(props) {
  let message=props.message;
  return (
    <>
      <Container fluid >
        <Row><MyNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout} isLoginPage={props.isLoginPage} setLoginPage={props.setLoginPage}/></Row>
        <Row>
        {message && <Row>
      <Alert variant={message.type} onClose={() => props.setMessage('')} dismissible>{message.msg}</Alert>
    </Row> }
            <Outlet />
        </Row>
      </Container>
    </>
  );

}
export default App;
