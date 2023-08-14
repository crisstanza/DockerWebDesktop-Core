CREATE USER readOnly@'%' IDENTIFIED BY 'readOnly';
GRANT SELECT, SHOW VIEW ON my_database.* TO readOnly@'%';
FLUSH PRIVILEGES;
