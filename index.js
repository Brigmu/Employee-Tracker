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
            choices: ['View all employees', 'Add an employee', 'Remove an employee', 'View all roles', 'Add a role', 'Remove a role', 'View all departments', 'Add a department', 'Remove a department', 'Update employee roles', 'Update employee manager', 'Exit']
        }
    ])
    .then((response) =>{
        switch(response.userChoice){
            case 'View all employees':
                viewAllEmployees();
                break;
            case 'Add an employee':
                addAnEmployee();
                break;
            case 'Remove an employee':
                removeAnEmployee();
                break;
            case 'View all roles':
                viewAllRoles();
                break;
            case 'Add a role':
                addARole();
                break;
            case 'Remove a role':
                removeARole();
                break;
            case 'View all departments':
                viewAllDepartments()
                break;
            case 'Add a department':
                addADepartment();
                break;
            case 'Remove a department':
                removeADepartment();
                break;
            case 'Update employee roles':
                updateEmployeeRole();
                break;
            case 'Update employee manager':
                updateEmployeeManager();
                break;
            case 'Exit':
                connection.end();
                break;
            default:
                console.log('Something broke');
        }
    })
    .catch((err) =>{
        console.log(err);
        init();
    })
}



const viewAllEmployees = () => {
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, CONCAT(m.first_name, " ", m.last_name) manager, role.title, role.salary, department.name as department FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id left outer join employee m ON employee.manager_id = m.id', (err, results) =>{
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
        const firstName = results.userFirstName.trim();
        const lastName = results.userLastName.trim();
        const checkUser = checkUserInputs(firstName, lastName);
        if (!checkUser) {
            const index = choices.indexOf(results.userRole);
            const roleId = roles[index].id;
            inquirer.prompt([
                {
                    type: 'list',
                    message: 'Would you like to assign a manager?',
                    name: 'userResponse',
                    choices: ['Yes', 'No']
                }
            ])
            .then((results) => {
                if(results.userResponse === 'No') {
                    connection.query(`INSERT into employee(first_name, last_name, role_id) values(?, ?, ?)`, [firstName, lastName, roleId], (err, results) => {
                        if (err) {
                            throw err;
                        };
                        console.log('Added employee');
                        init();
                    })
                } else {
                    connection.query('SELECT id, first_name, last_name FROM employee', (err, results) => {
                        if(err) throw err;

                        let managerChoices = [];
                        let managerIds = [];
                        for(let i = 0; i < results.length; i++) {
                            managerChoices.push(`${results[i].first_name} ${results[i].last_name}`);
                            managerIds.push(results[i].id);
                        }
                        inquirer.prompt([
                            {
                                type: 'list',
                                message: 'Select who should be their manager',
                                name: 'newManager',
                                choices: managerChoices
                            }
                        ])
                        .then((results) => {
                            const managerIndex = managerChoices.indexOf(results.newManager);
                            const managerId = managerIds[managerIndex];

                            connection.query(`INSERT into employee(first_name, last_name, role_id, manager_id) values(?, ?, ?, ?)`, [firstName, lastName, roleId, managerId], (err, results) => {
                                if (err) {
                                    throw err;
                                };
                                console.log('Added employee');
                                init();
                            })
                        })
                    })
                }

            })
            .catch((err) =>{
                console.log(err);
                init();
            })
            

            
        }
        else {
            console.log('Invalid input, must contain at least 1 character and no more than 30');
            init();
        }
    }))
    .catch((err) =>{
        console.log(err);
        init();
    })
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
        const newTitle = results.userTitle.trim();
        const checkUser = checkUserInputs(newTitle);
        const intCheck = typeof results.userSalary;
        if (!checkUser) {
            if (intCheck === "number") {
                const index = choices.indexOf(results.userDepartment);
                const departmentId = departments[index].id;

                connection.query(`INSERT into role(title, salary, department_id) values(?, ?, ?)`, [newTitle, results.userSalary.trim(), departmentId], (err, results) => {
                    if (err) {
                        throw err;
                    };
                    console.log('Added role');
                    init();
                })
            } else {
                console.log('Invalid input. Salary must be a number');
                init();
            }
        } else {
            console.log('Invalid input, must contain at least 1 character and no more than 30');
            init();
        }
    })
    .catch((err) =>{
        console.log(err);
        init();
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
        const newDepartment = results.userDepartment.trim();
        const checkUser = checkUserInputs(newDepartment);
        if (!checkUser) {
            connection.query(`INSERT into department(name) values(?)`, [newDepartment], (err, results) => {
                if (err) {
                    throw err;
                }
                console.log('Department added');
                init();
            })
        } else {
            console.log('Invalid input, must contain at least 1 character and no more than 30');
            init();
        }
    })
    .catch((err) =>{
        console.log(err);
        init();
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
            let lastName = employees[empIndex].last_name;
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
                    connection.query(`UPDATE employee SET role_id = ? WHERE first_name = ? and last_name = ?`, [roleId, firstName, lastName], (err, results) => {
                        if(err){
                            throw err;
                        }
                        console.log('Updated employee role');
                        init();
                    })
                })
                .catch((err) =>{
                    console.log(err);
                    init();
                })
            })
        })
        .catch((err) =>{
            console.log(err);
            init();
        })

    })
}

const removeAnEmployee = () => {
    let choices = [];
    connection.query('SELECT first_name, last_name FROM employee', (err, results) => {
        if (err) throw err;
        for(let i = 0; i < results.length; i++) {
            choices.push(`${results[i].first_name} ${results[i].last_name}`);
        }
        inquirer.prompt([
            {
                type: 'list',
                message: 'Select employee to remove',
                name: 'userChoice',
                choices: choices
            }
        ])
        .then((results) =>{
            const firstName = results.userChoice.split(' ')[0];
            const lastName = results.userChoice.split(' ')[1];
            connection.query('DELETE FROM employee where first_name = ? AND last_name = ?', [firstName, lastName], (err, results) =>{
                if(err) throw err;
                console.log(`Removed ${results.userChoice} from database`);
                init();
            })
        })
        .catch((err) =>{
            console.log(err);
            init();
        })
    })

}

const removeARole = () => {
    let choices = [];
    let ids = [];
    connection.query('SELECT id, title from role', (err, results) => {
        if(err) throw err;
        for(let i = 0; i < results.length; i++) {
            choices.push(results[i].title);
            ids.push(results[i].id);
        }
        inquirer.prompt([
            {
                type: 'list',
                message: 'Select which role to remove',
                name: 'userChoice',
                choices: choices
            }
        ])
        .then((results) => {
            const roleIndex = choices.indexOf(results.userChoice);
            const id = ids[roleIndex];
            const role = results.userChoice;
            
            //write function to update employees whose role was deleted
            connection.query('SELECT first_name, last_name FROM employee where role_id = ?', [id], (err, results) => {
                if(err) throw err;
                if(results.length === 0){
                    connection.query('DELETE FROM role where title = ?', [role], (err, results) => {
                        if(err) throw err;
                        console.log(`Removed ${role} from roles`);
                        init();
                    })
                } else {
                    let employeeChoices = []
                    for(let i = 0; i < results.length; i++){
                        employeeChoices.push(`${results[i].first_name} ${results[i].last_name}`);
                    };
                    updateEmployeesRemovedRole(role, id, employeeChoices);
                    
                }
            })
            
        })
        .catch((err) =>{
            console.log(err);
            init();
        })
    })
}

const updateEmployeesRemovedRole = (role, removedID, employeesOfRemovedId) => {
    inquirer.prompt([
        {
            type: 'list',
            message: `You have may have employees whose role is ${role} and must update them. Would you like to update all or handle individually?`,
            name: 'updatePrompt',
            choices: ['Update all', 'Handle individually']
        }
    ])
        .then((results) => {
            if (results.updatePrompt === 'Update all') {
                let choices = [];
                let ids = [];

                connection.query('SELECT id, title FROM role', (err, results) => {
                    if (err) throw err;

                    for (let i = 0; i < results.length; i++) {
                        if (results[i].title !== role) {
                            choices.push(results[i].title);
                            ids.push(results[i].id);
                        }
                    }
                    inquirer.prompt([
                        {
                            type: 'list',
                            message: 'Select role to which you want to update all employees who had the removed role',
                            name: 'userResponse',
                            choices: choices
                        }
                    ])
                        .then((results) => {
                            const roleIndex = choices.indexOf(results.userResponse);
                            const id = ids[roleIndex];
                            connection.query('UPDATE employee SET role_id = ? WHERE role_id = ?', [id, removedID], (err, results) => {
                                if (err) throw err;
                                console.log('Updated employees');
                                // cb(results);
                                // init();

                                if(results.affectRows === 0){
                                    console.log('Failed to update');
                                } else {
                                    connection.query('DELETE FROM role where title = ?', [role], (err, results) => {
                                        if(err) throw err;
                                        console.log(`Removed ${role} from roles`);
                                        init();
                                    })
                                }
                            });
                        })
                })
            } else {
                updateIndividualEmployeeRoles(role, employeesOfRemovedId);
            }
        })
        .catch((err) =>{
            console.log(err);
            init();
        })
        
    
    
}

const updateIndividualEmployeeRoles = (role, employeesOfRemovedId) =>{
    inquirer.prompt([
        {
            type: 'list',
            message: 'Pick which employee to update',
            name: 'userChoice',
            choices: employeesOfRemovedId
        }
    ])
        .then((results) => {
            const firstName = results.userChoice.split(' ')[0];
            const lastName = results.userChoice.split(' ')[1];
            let index = employeesOfRemovedId.indexOf(results.userChoice);
            employeesOfRemovedId.splice(index, 1);
            let choices = [];
            let ids = [];
            connection.query('SELECT id, title FROM role', (err, results) => {
                if (err) throw err;

                for (let i = 0; i < results.length; i++) {
                    if (results[i].title !== role) {
                        choices.push(results[i].title);
                        ids.push(results[i].id);
                    }
                }
                inquirer.prompt([
                    {
                        type: 'list',
                        message: 'Select role to which you want to update the chosen employee',
                        name: 'userResponse',
                        choices: choices
                    }
                ])
                    .then((results) => {
                        const roleIndex = choices.indexOf(results.userResponse);
                        const id = ids[roleIndex];
                        connection.query('UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?', [id, firstName, lastName], (err, results) => {
                            if (err) throw err;
                            console.log('Updated employees');
                            // k++;
                            // init();
                            if(employeesOfRemovedId.length === 0) {
                                    connection.query('DELETE FROM role where title = ?', [role], (err, results) => {
                                        if(err) throw err;
                                        console.log(`Removed ${role} from roles`);
                                        init();
                                    });
                            }
                            else{
                                updateIndividualEmployeeRoles(role, employeesOfRemovedId);
                            }
                            // cb();
                        });
                    })
                    .catch((err) =>{
                        console.log(err);
                        init();
                    })
            })
        })  
        .catch((err) =>{
            console.log(err);
            init();
        })  
}

const removeADepartment = () =>{
    let choices = [];
    let ids = [];
    connection.query('SELECT id, name FROM department', (err, results) => {
        if(err) throw err;
        for(let i = 0; i < results.length; i++) {
            choices.push(results[i].name);
            ids.push(results[i].id);
        }
        inquirer.prompt([
            {
                type: 'list',
                message: 'Select which department to remove',
                name: 'userChoice',
                choices: choices
            }
        ])
        .then((results) => {
            const departmentIndex = choices.indexOf(results.userChoice);
            const id = ids[departmentIndex];
            const department = results.userChoice;

            connection.query('SELECT title FROM role WHERE department_id = ?', [id], (err, results) =>{
                if(err) throw err;

                if(results.length === 0){
                    connection.query('DELETE FROM department WHERE name = ?', [department], (err, results) =>{
                        if(err) throw err;
                        console.log(`Removed ${department} from database`);
                        init();
                    })
                } else {
                    let roleChoices = [];
                    for(let i = 0; i < results.length; i++){
                        roleChoices.push(results[i].title);   
                    }
                    updateRolesDepartments(department, id, roleChoices);
                }
            })
        })
        .catch((err) =>{
            console.log(err);
            init();
        })
    })
}

const updateRolesDepartments = (department, removedID, roleOfRemovedDepartment) =>{
    inquirer.prompt([
        {
            type: 'list',
            message: `You have may have roles whose department is ${department} and must update them. Would you like to update all or handle individually?`,
            name: 'updatePrompt',
            choices: ['Update all', 'Handle individually']
        }
    ])
        .then((results) => {
            if (results.updatePrompt === 'Update all') {
                let choices = [];
                let ids = [];

                connection.query('SELECT id, name FROM department', (err, results) => {
                    if (err) throw err;

                    for (let i = 0; i < results.length; i++) {
                        if (results[i].name !== department) {
                            choices.push(results[i].name);
                            ids.push(results[i].id);
                        }
                    }

                    inquirer.prompt([
                        {
                            type: 'list',
                            message: 'Select department to which you want to update all roles who had the removed department',
                            name: 'userResponse',
                            choices: choices
                        }
                    ])
                    .then((results) => {
                        const departmentIndex = choices.indexOf(results.userResponse);
                        const id = ids[departmentIndex];
                        connection.query('UPDATE role SET department_id = ? WHERE department_id = ?', [id, removedID], (err, results) => {
                            if (err) throw err;
                            console.log('Updated roles');
                            // cb(results);
                            // init();

                            if(results.affectRows === 0){
                                console.log('Failed to update');
                            } else {
                                connection.query('DELETE FROM department where name = ?', [department], (err, results) => {
                                    if(err) throw err;
                                    console.log(`Removed ${department} from departments`);
                                    init();
                                })
                            }
                        });
                    })
                    .catch((err) =>{
                        console.log(err);
                        init();
                    })
                });

            } else {
                updateIndividualRoleDepartments(department, roleOfRemovedDepartment);
            }
        })
        .catch((err) =>{
            console.log(err);
            init();
        })
}

const updateIndividualRoleDepartments = (department, rolesOfRemovedID) => {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Pick which role to update',
            name: 'userChoice',
            choices: rolesOfRemovedID
        }
    ])
    .then((results) => {
        const roleTitle = results.userChoice;
        let index = rolesOfRemovedID.indexOf(roleTitle);
        rolesOfRemovedID.splice(index, 1);
        let choices = [];
        let ids = [];

        connection.query('SELECT id, name FROM department', (err, results) => {
            if (err) throw err;

            for (let i = 0; i < results.length; i++) {
                if (results[i].name !== department) {
                    choices.push(results[i].name);
                    ids.push(results[i].id);
                }
            }
            inquirer.prompt([
                {
                    type: 'list',
                    message: 'Select department to which you want to update the chosen role',
                    name: 'userResponse',
                    choices: choices
                }
            ])
            .then((results) => {
                const departmentIndex = choices.indexOf(results.userResponse);
                const id = ids[departmentIndex];

                connection.query('UPDATE role SET department_id = ? WHERE title = ?', [id, roleTitle], (err, results) => {
                    if (err) throw err;
                    console.log('Updated roles');
                    // k++;
                    // init();
                    if(rolesOfRemovedID.length === 0) {
                            connection.query('DELETE FROM department where name = ?', [department], (err, results) => {
                                if(err) throw err;
                                console.log(`Removed ${department} from departments`);
                                init();
                            });
                    }
                    else{
                        updateIndividualRoleDepartments(department, rolesOfRemovedID);
                    }
                    // cb();
                });
            })
            .catch((err) =>{
                console.log(err);
                init();
            })
        })
    })
    .catch((err) =>{
        console.log(err);
        init();
    })
}

const updateEmployeeManager = () =>{
    let choices = [];
    let ids = [];
    connection.query('SELECT id, first_name, last_name FROM employee', (err, results) => {
        if(err) throw err;
        for(let i = 0; i < results.length; i++) {
            choices.push(`${results[i].first_name} ${results[i].last_name}`);
            ids.push(results[i].id);
        };

        inquirer.prompt([
            {
                type: 'list',
                message: 'Select which employee whose manager you would like to update',
                name: 'userChoice',
                choices: choices
            }
        ])
        .then((results) => {
            const firstName = results.userChoice.split(' ')[0];
            const lastName = results.userChoice.split(' ')[1];
            const index = choices.indexOf(results.userChoice);
            choices.splice(index, 1);
            ids.splice(index, 1);

            inquirer.prompt([
                {
                    type: 'list',
                    message: 'Select which employee should be their new manager',
                    name: 'userManager',
                    choices: choices
                }
            ])
            .then((results) => {
                let managerIndex = choices.indexOf(results.userManager);
                connection.query('UPDATE employee SET manager_id = ? WHERE first_name = ? AND last_name = ?', [ids[managerIndex], firstName, lastName], (err, results) =>{
                    if(err) throw err;
                    console.log('Updated employees Manager');
                    init();
                })
            })
            .catch((err) =>{
                console.log(err);
                init();
            })
        })
        .catch((err) =>{
            console.log(err);
            init();
        })
    })
    
}

const checkUserInputs = (...inputs) =>{
    let check = false;
    for(let i = 0; i < inputs.length; i++) {
        let userInput = inputs[i]
        if(userInput === '' || userInput.length > 30){
            check = true;
            return check;
        }
    }
    return check;
}


init();