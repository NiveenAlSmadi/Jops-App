'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');
const { get, search } = require('superagent');
require('dotenv').config();

// Application Setup
const server = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS
server.use(express.urlencoded({ extended: true }));
// Specify a directory 
server.use(express.static('public'))
// method-override
server.use(methodOverride('_method'));
// Set the view engine
server.set('view engine', 'ejs');
//  app cors
server.use(cors()); 

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);


// let URL=`https://jobs.github.com/positions.json?location=usa`
server.get('/',home);
server.post('/searches',searchHandler);
server.get('/search',searchpage);
server.get('/mylist',mylist);
server.post('addtolist',addtolist);
server.get('/detalies/:id',getdetalies);
server.put('/update/:id',update);
server.delete('/delete/:id',deleted);





//functions
function home(req,res){
let URL=`https://jobs.github.com/positions.json?location=usa`;
superagent.get(URL).then(data=>{
    let array=data.body.map(item=> new Jops(item))
    res.render('index',{data:array})
}) .catch(error=>{
    console.log(error);
});
}

function searchpage(req,res){
    res.render('search');
}

function searchHandler(req,res){
let type=req.body.type;
let URL=`https://jobs.github.com/positions.json?description=${type}&location=usa`;
superagent.get(URL).then(data=>{
    let array=data.body.map(item=> new Usajops(item))
    res.render('result',{data:array})
}) .catch(error=>{
    console.log(error);
});

}

function mylist(req,res){

let SQL=`SELECT *FROM jobs`;
client.query(SQL).then(data=>{
    res.render('mylist',{data:data.rows});
}).catch(error=>{
    console.log(error);
});
}



function addtolist (req,res){
    let{ title,company,location,url, description}=req.body;
    let safevalue=[title,company,location,url, description];
    let SQL=`INSERT INTO jobs (title,company,location,url, description) VALUES($1,$2,$3,$4,$5) RETURNING *`
    client.query(SQL,safevalue).then(()=>{
    res.redirect('/mylist');
    }).catch(error=>{
        console.log(error);
    });
    
}

function getdetalies(req,res){
let SQL=` SELECT * FROM jobs WHERE id=$1 `
let value=[req.params.id];
client.query(SQL,value).then(data=>{
    res.render('detalies',{data:data.rows})
}).catch(error=>{
    console.log(error);
});

}




function update(req,res){
let SQL=`UPDATE jobs SET title=$1,company=$2,location=$3,url=$4, description=$5 WHERE id=$5`;
let{ title,company,location,url, description}=req.body;
let safevalue=[title,company,location,url, description,req.parms.id];
client.query(SQL,safevalue).then(data=>{
    res.redirect(`/detalies/${req.params.id}`);
}).catch(error=>{
    console.log(error);
});
}

function deleted(req,res){
let SQL=`DELETE FROM jobs WHERE id=$1;`;
client.query(SQL,[req.params.id]).then(data=>{
    res.redirect(`/mylist`);
}).catch(error=>{
    console.log(error);
});

}
//helper functions 

function Jops (data){
    this.title =data.title;
    this.company=data.company;
    this.location=data.location;
    this.url=data.url;

}

function Usajops (data){
    this.title =data.title;
    this.company=data.company;
    this.location=data.location;
    this.url=data.url;
    this.description=data.description;

}


//connecting 
client.connect().then(() =>
    server.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
    );