

/**
 * constructor function for course object
 */

function Course(code, name, credits, enrolled, maxstudents, preparatory){
    this.code=code;
    this.name=name;
    this.credits=credits;
    this.enrolled=enrolled;
    this.maxstudents=maxstudents;
    this.preparatory=preparatory;
    this.incompatible=[];

    this.addIncompatible = (incompatible) => {
        //console.log("COURSE: " + incompatible);
        this.incompatible.push(incompatible);
    }
}

exports.Course = Course;