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
            choices: ['View all employees', 'Add an employee', 'View all roles', 'Add a role', 'View all departments', 'Add a department', 'Update employee roles', 'Exit']
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
            case 'View all departments':
                viewAllDepartments()
                break;
            case 'Add a department':
                addADepartment();
                break;
            case 'Update employee roles':
                updateEmployeeRole();
                break;
            case 'Exit':
                connection.end();
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

const viewAllDepartments = () => {
    connection.query('SELECT id, name FROM department', (err, results) =>{
        if(err) {
            throw err;
        }
        console.table(results);
        init();
    })
}

const addADepartment = () => {
    inquirer.prompt([
        {
            type: 'input', 
            message: 'Enter the name of new department',
            name: 'userDepartment'
        }
    ])
    .then((results) => {
        connection.query(`INSERT into department(name) values('${results.userDepartment}')`, (err, results) => {
            if(err){
                throw err;
            }
            console.log('Department added');
            init();
        })
    })
}

const updateEmployeeRole = () => {
    let choices = [];
    let employees = [];
    let roles = [];
    
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name as department FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id', (err, results) =>{
        if(err){
            throw err;
        }

        for(let i = 0; i < results.length; i++){
            employees.push(results[i]);
            choices.push(`${results[i].first_name} ${results[i].last_name}`);
        }

        inquirer.prompt([
            {
                type: 'list',
                message: 'Choose employee whose role you would like to update',
                name: 'userChoice',
                choices: choices
            }
        ])
        .then((results) => {
            let roleChoices = [];
            let employee = results.userChoice;
            let empIndex = choices.indexOf(employee);
            let firstName = employees[empIndex].first_name;
            connection.query('SELECT role.id, role.title, role.salary, department.name as department FROM role INNER JOIN department ON role.department_id = department.id', (err, results) =>{
                if(err) {
                    throw err;
                }
                for(let i = 0; i < results.length; i++){
                    roles.push(results[i]);
                    roleChoices.push(results[i].title);
                }
                // console.table(roles);
                inquirer.prompt([
                    {
                        type: 'list',
                        message: `Which role would you like to change ${employee} to?`,
                        name: 'newRole',
                        choices: roleChoices
                    }
                ])
                .then((results) => {
                    const index = roleChoices.indexOf(results.newRole);
                    console.table(roles);
                    console.log(index);
                    const roleId = roles[index].id;
                    connection.query(`UPDATE employee SET role_id = ${roleId} WHERE first_name = '${firstName}'`, (err, results) => {
                        if(err){
                            throw err;
                        }
                        console.log('Updated employee role');
                        init();
                    })
                })
            })
        })

    })
}