DROP TABLE  jobs ;
CREATE TABLE IF NOT EXISTS  jobs(
id SERIAL PRIMARY KEY ,
title VARCHAR(256) ,
company VARCHAR(256) ,
location VARCHAR(256) ,
url VARCHAR(256) ,
description text 
);