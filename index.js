const inquirer = require('inquirer');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password123',
    database: 'employeesDB'   
});

connection.connect((err) =>{
    if(err) {
        throw err;
    }
    console.log('connected to database');
})

const init = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'userChoice',
            choices: ['View all employees', 'Add an employee', 'View all roles', 'Add a role', 'View all departments', 'Add a department', 'Update employee roles']
        }
    ])
    .then((response) =>{
        console.log(response.userChoice);
        switch(response.userChoice){
            case 'View all employees':
                viewAllEmployees();
                break;
            case 'Add an employee':
                addAnEmployee();
                break;
            case 'View all roles':
                viewAllRoles();
                break;
            case 'Add a role':
                addARole();
                break;
            default:
                console.log('Something broke');
        }
    })
}

init();

const viewAllEmployees = () => {
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name as department FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id', (err, results) =>{
        if(err) {
            throw err;
        }
        console.table(results);
        init();
    })
}

const addAnEmployee = () => {
    let roles = [];
    let choices = [];
    connection.query('SELECT id, title FROM role', (err, results) => {
        if(err) {
            throw err;
        }
        for(let i = 0; i < results.length; i++){
            roles.push(results[i]);
            choices.push(results[i].title);
        }
        
    });
    inquirer.prompt([
        {
            type: 'input',
            message: 'Enter first name',
            name: 'userFirstName'
        },
        {
            type: 'input',
            message: 'Enter last name',
            name: 'userLastName'
        },
        {
            type: 'list',
            message: 'Choose employee role',
            name: 'userRole',
            choices: choices
        }
    ])
    .then((results => {
        console.table(results);
        const index = choices.indexOf(results.userRole);
        const roleId = roles[index].id;
        console.log(roleId);
        
        connection.query(`INSERT into employee(first_name, last_name, role_id) values('${results.userFirstName}','${results.userLastName}', ${roleId})`, (err, results) => {
            if(err){
                throw err;
            };
            console.log('Added employee');
            init();
        })
    }))
}

const viewAllRoles = () => {
    connection.query('SELECT role.id, role.title, role.salary, department.name as department FROM role INNER JOIN department ON role.department_id = department.id', (err, results) =>{
        if(err) {
            throw err;
        }
        console.table(results);
        init();
    })
}

const addARole = () => {
    let departments = [];
    let choices = [];
    connection.query('SELECT id, name FROM department', (err, results) => {
        if(err) {
            throw err;
        }
        for(let i = 0; i < results.length; i++){
            departments.push(results[i]);
            choices.push(results[i].name);
        }
        
    });
    inquirer.prompt([
        {
            type: 'input',
            message: 'Enter role title',
            name: 'userTitle'
        },
        {
            type: 'input',
            message: 'Enter role salary',
            name: 'userSalary'
        },
        {
            type: 'list',
            message: 'Choose department of the role',
            name: 'userDepartment',
            choices: choices
        }
    ])
    .then((results) => {
        const index = choices.indexOf(results.userDepartment);
        const departmentId = departments[index].id;
        console.log(departmentId);

        connection.query(`INSERT into role(title, salary, department_id) values('${results.userTitle}','${results.userSalary}', ${departmentId})`, (err, results) => {
            if(err){
                throw err;
            };
            console.log('Added role');
            init();
        })
    })
}