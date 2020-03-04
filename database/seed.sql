create database employeesDB;

use employeesDB;

create table employee (
id int auto_increment NOT NULL,
PRIMARY KEY(id),
first_name VARCHAR(30) NOT NULl,
last_name VARCHAR(30) NOT NULL,
role_id int REFERENCES role(id),
manager_id int REFERENCES role(id)
);

CREATE table role (
id int auto_increment NOT NULL,
PRIMARY KEY(id),
title VARCHAR(30) NOT NULL,
salary DECIMAL NOT NULL,
department_id int REFERENCES department(id)
);

create table department (
id int auto_increment NOT NULL,
PRIMARY KEY(id),
name VARCHAR(30) NOT NULL
);

insert into department(name)
values('Sales'),('Engineering');

insert into role(title, salary, department_id)
values('Salesperson', 60000.00, 1), ('Sales Lead', 75000.00, 1), ('Lead Software Engineer', 125000.00, 2), ('Software Engineer', 98000.00, 2);

insert into employee(first_name, last_name, role_id)
values('David', 'Spade', 2), ('Michael', 'Bublee', 1), ('John', 'Wick', 1), ('Michelle', 'Obama', 1), ('Roger', 'Federer', 3), ('Jennifer', 'Anniston', 4), ('Nick', 'Jonas', 4);