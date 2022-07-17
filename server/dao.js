'use strict'

const sqlite = require('sqlite3');
const {Course} = require('./Course');
const {db} = require('./db');


function readCourses(){
    return new Promise((resolve, reject) =>{
        //console.log("HEREEEE")
        const sql= 'SELECT * FROM Courses';
        
        db.all(sql,(err,rows) => {
            if(err)
                reject(err);
            else{
                resolve(rows.map((c) => {
                    
                    return new Course(c.code, c.name, c.credits, c.enrolled, c.maxstudents, c.preparatory);
                }
                
                ));
            }
        });
    });
}

function addIncompatibleCourses(course){
    return new Promise((resolve, reject) =>{
        const sql='SELECT Incompatible, C2.name FROM Incompatible_courses I, Courses C1,Courses C2 WHERE C1.code=? AND C1.code=I.code AND C2.code=I.Incompatible';
        db.all(sql,[course.code],(err,rows) => {
            if(err)
                reject(err);
            else{
                resolve(rows.map((i) => 
                    course.addIncompatible(i)
                ));
            }
        });
    })
}

function addStudyPlan(type, id){
    console.log("DAO", type,id)
    return new Promise((resolve,reject) =>{
        const sql='UPDATE Users SET StudyPlan=? WHERE id=?';
        db.run(sql, [type,id],(err) => {
            if(err)
                reject(false);
            else
                resolve(true);
        });
    })
}

function getStudyPlan(id){
    console.log("DAO","Get studyplan");
    return new Promise((resolve,reject) =>{
        const sql='SELECT code,name,credits,enrolled,maxstudents,preparatory FROM StudyPlans S, Courses C WHERE studentId=? AND C.code=S.courseId';
        db.all(sql,[id], (err,rows) => {
            if(err){
                reject(err);
            }else
                resolve(rows.map((c) => {
                    
                    return new Course(c.code, c.name, c.credits, c.enrolled, c.maxstudents, c.preparatory)}
                ));
        });
    })
}

function hasStudyPlan(id){
    console.log("DAO", "GET has study plan");
    return new Promise((resolve,reject) => {
        const sql= 'SELECT StudyPlan FROM Users WHERE id=?';
        db.get(sql,[id],(err,row) => {
            if(err)
                reject(err);
            else{
                resolve(row);
            }
        })
    })
}

function deleteStudyPlan(id){
    return new Promise((resolve,reject) => {
        const sql='DELETE FROM StudyPlans WHERE studentId=?';
        db.run(sql,[id],(err) =>{
            if(err)
                reject(false);
            else{
                resolve(true);
            }
        });
    });
}

function deleteStudyPlanFromUser(id){
    return new Promise((resolve,reject) => {
        const sql='UPDATE Users SET StudyPlan=NULL WHERE id=?';
        db.run(sql,[id],(err) =>{
            if(err)
                reject(false);
            else
                resolve(true);
        });
    });
}

function updateEnrolledAfterDelete(course){
    return new Promise((resolve,reject) =>{
        const sql='UPDATE Courses SET enrolled=enrolled-1 WHERE code=?'
        db.run(sql,[course.code],(err) =>{
            if(err)
                reject(false);
            else
                resolve(true);
        })
    })
}

function addCourseToStudyPlan(course,id){
   return new Promise((resolve,reject) =>{
        const sql='INSERT INTO StudyPlans(studentId,courseId) VALUES (?,?)';
        db.run(sql,[id,course.code],(err) =>{
            if(err)
                reject(err);
            else
                resolve(true);
        })
    });
}

function updateEnrolledStudent(course){
    return new Promise((resolve,reject) =>{
        const sql='UPDATE Courses SET enrolled=enrolled+1 WHERE code=?';
        db.run(sql,[course.code],(err) =>{
            if(err)
                reject(false);
            else
                resolve(true);
        })
    })
}

function getEnrolledStudents(code){
    return new Promise((resolve,reject) =>{
        const sql='SELECT enrolled FROM Courses WHERE code=?';
        db.get(sql,[code],(err,row) =>{
            if(err)
                reject(err);
            else
                resolve(row.enrolled);
        })
    })
}





module.exports = { readCourses, addIncompatibleCourses, addStudyPlan, getStudyPlan, hasStudyPlan, deleteStudyPlan, deleteStudyPlanFromUser,addCourseToStudyPlan,
    updateEnrolledAfterDelete, updateEnrolledStudent, getEnrolledStudents};

