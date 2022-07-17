

/**
 * constructor function for course object
 */

function Course(code, name, credits, enrolled, maxstudents,incompatible=[], preparatory){
    this.code=code;
    this.name=name;
    this.credits=credits;
    this.enrolled=enrolled;
    this.maxstudents=maxstudents;
    this.preparatory=preparatory;
    this.incompatible=incompatible;

    
}





exports.Course = Course;