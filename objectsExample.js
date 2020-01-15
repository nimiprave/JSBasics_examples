// various ways of object creation. 

var person = {
    name: "nirmal"
}
console.log(person.name);
console.log(person['name']);
person.name = 'pothuraj';
console.log(person['name']);
// Adding more properties 

person['age'] = 30;
console.log(person['age']);

// unrealiability approach.

if (person.age) {
    console.log('Inside Condition');
}
person.age = 0;

if (person.age) {
    console.log('Inside Condition');
}
// person.age = null;
// if(person.age){
//     console.log('Inside Condition');
// }
console.log('age' in person);

if ('age' in person) {
    console.log('Yes, Age is the property of Person object');
}

// let create  a method. A method is nothing but a property referring to the function. 
person.log = function () {
    console.log(this.name);
    console.log(this.age);
}
person.log();



