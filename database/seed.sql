

insert into department(name)
values('Sales'),('Engineering');

insert into role(title, salary, department_id)
values('Salesperson', 60000.00, 1), ('Sales Lead', 75000.00, 1), ('Lead Software Engineer', 125000.00, 2), ('Software Engineer', 98000.00, 2);

insert into employee(first_name, last_name, role_id, manager_id)
values('David', 'Spade', 2, null), ('Michael', 'Bublee', 1, 1), ('John', 'Wick', 1, 1), ('Michelle', 'Obama', 1, 1), ('Roger', 'Federer', 3, null), ('Jennifer', 'Anniston', 4, 5), ('Nick', 'Jonas', 4, 5);