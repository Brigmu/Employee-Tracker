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