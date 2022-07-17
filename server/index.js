'use strict';

const express = require('express');
const morgan = require('morgan'); //login middleware
const cors = require('cors');
const {  validationResult, body, param, check } = require('express-validator');
const userDao = require('./user-dao');
const dao = require('./dao');

// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const e = require('express');

// init express
const app = new express();
app.use(morgan('dev'));
app.use(express.json());
const port = 3001;

// set up and enable cors
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

const PREFIX = '/api';

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Passport: set up local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
  return cb(null, user);
  
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

//middleware
const checkValidation = (req,res,next) => {
  const errors= validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({errors : errors.array()});
  }
  return next();
}

const checkStudyPlan = (req, res, next) => {
  const type=req.params.type;
  const minCFU=type=='part-time' ? 20:60;
  const maxCFU=type=='part-time' ? 60:80;
//check credits constraints

  const sumCFU=req.body.map(c => c.credits).reduce((prev,cur) => prev+cur,0);
  if(sumCFU>maxCFU || sumCFU<minCFU){
    return res.status(422).json({error: "Credits not in the right range"});
  }


  const preparatory=[];
  const incompatible=[];
  for(let i=0;i<req.body.length;i++){
    if(req.body[i].preparatory!=null){
        preparatory.push(req.body[i].code);
    }
    if(req.body[i].incompatible!=null){
      for(let inc in req.body[i].incompatible){
        incompatible.push(inc);
      }
    }

  }
  let numPreparatory=0;
  for(let c of req.body){
    if(preparatory.includes(c.code))
      numPreparatory++;
    if(incompatible.includes(c.code)){
     
      return res.status(422).json({error: "An incompatible courses list has been received"});
    }
  }
  if(numPreparatory!=preparatory.length){
    return res.status(422).json({error: "Not all the preparatory are in the study plan"});
  }
  return next();
}


/*** User APIs */
app.post(PREFIX+'/sessions', passport.authenticate('local'), (req, res) => {
  console.log("req",req);
  res.status(201).json(req.user);
})

// GET /api/sessions/current
app.get(PREFIX+'/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
      res.status(200).json(req.user);
  }
  else
      res.status(401).json({ error: 'Not authenticated' });
});

// DELETE /api/session/current
app.delete(PREFIX+'/sessions/current', (req, res) => {
  req.logout(() => {
      res.status(200).end();
  });
});


//GET /courses

app.get(PREFIX + '/courses',async (req, res) => {
    try{
    const courses=await dao.readCourses();
    courses.sort((a,b) => {
      if(a.name.toUpperCase() <= b.name.toUpperCase())
        return -1;
      else
        return 1;

    });
    //for each course add the incompatible courses
    for(let i=0;i<courses.length;i++)
      await dao.addIncompatibleCourses(courses[i]);
      
    return res.status(200).json(courses);
    }catch(err){
      
      res.status(500).json({ error: err });
    }
  
});


//get the courses of the studyPlan
app.get(PREFIX + '/studyPlanCourses', isLoggedIn , async(req,res) => {
  
  try{
    const courses=await dao.getStudyPlan(req.user.id);
    for(let i=0;i<courses.length;i++)
      await dao.addIncompatibleCourses(courses[i]);
    return res.status(200).json(courses);
  }catch(err){
    res.status(500).json({error:err});
  }
})

app.get(PREFIX+ '/hasStudyPlan', isLoggedIn, async(req,res) => {
  
  try{
    const hasStudyPlan=await dao.hasStudyPlan(req.user.id);
    return res.status(200).json(hasStudyPlan);
  }catch(err){
    res.status(500).json({error:err});
  }
})

//delete the studyPlan
app.delete(PREFIX+'/studyPlan', async(req,res) => {
  
  try{
    const studyPlan=await dao.getStudyPlan(req.user.id);
    for(let i=0;i<studyPlan.length;i++){
      await dao.updateEnrolledAfterDelete(studyPlan[i]);
    }
    await dao.deleteStudyPlan(req.user.id);
    await dao.deleteStudyPlanFromUser(req.user.id);
    return res.status(204).end();
  }catch(err){
    res.status(500).json({error:err});
  }
})


//add courses to the studyPlan
app.put(PREFIX + '/saveStudyPlan/:type',[
  param("type").isString().isIn(['part-time','full-time']),
  body("*.code").isAlphanumeric().isLength({min:7,max:7}),
  body("*.name").isString(),
  body("*.credits").isInt({min : 1})
  
],checkValidation,checkStudyPlan, isLoggedIn, async(req,res) =>{
  
  const type=req.params.type;
  
  try{
    const studyPlan=await dao.getStudyPlan(req.user.id);

    //delete all courses of the current studyPlan
    for(let i=0;i<studyPlan.length;i++){
      await dao.updateEnrolledAfterDelete(studyPlan[i]);
    }
    await dao.deleteStudyPlan(req.user.id);

    let enrolled;
    for(let c of req.body){
      enrolled=await dao.getEnrolledStudents(c.code);
      
      if(c.maxstudents!=null && c.maxstudents==enrolled){
        //save the previouse studyPlan
        for(let i=0;i<studyPlan.length;i++){
          await dao.addCourseToStudyPlan(studyPlan[i],req.user.id);
          await dao.updateEnrolledStudent(studyPlan[i]);
        }
        return res.status(422).json({error : "Enrolled greater than maxStudents"});
      }
    }
   
    
    await dao.deleteStudyPlanFromUser(req.user.id);

    //create empty studyPlan
    await dao.addStudyPlan(type, req.user.id);

    //add all the new courses
    for(let i=0;i<req.body.length;i++){
      await dao.addCourseToStudyPlan(req.body[i],req.user.id);
      await dao.updateEnrolledStudent(req.body[i]);
    }
    return res.status(200).end();
  }catch(err){
    res.status(500).json({error:err});
  }
})


