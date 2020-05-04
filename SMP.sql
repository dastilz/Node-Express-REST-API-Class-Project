// Author: David Stilz

CREATE DATABASE SMPDB;

USE SMPDB;

CREATE TABLE Identity (
	idnum BIGINT AUTO_INCREMENT,
	handle VARCHAR(100) UNIQUE,
	password VARCHAR(100),
	fullname VARCHAR(100) NOT NULL,
	location VARCHAR(100),
	email VARCHAR(100) NOT NULL,
	bdate DATE NOT NULL,
	joined DATE NOT NULL,
	PRIMARY KEY (idnum)
);

CREATE TABLE Story (
	sidnum BIGINT AUTO_INCREMENT,
	idnum BIGINT,
	chapter VARCHAR(100),		         
	url VARCHAR(100),    
	expires DATETIME,
	tstamp TIMESTAMP,
	PRIMARY KEY (sidnum),
	FOREIGN KEY (idnum) REFERENCES Identity(idnum)
);

CREATE TABLE Follows (
	follower BIGINT,
	followed BIGINT,
	tstamp TIMESTAMP,
	FOREIGN KEY (follower) REFERENCES Identity(idnum),
	FOREIGN KEY (followed) REFERENCES Identity(idnum)
);

CREATE TABLE Reprint (
	rpnum BIGINT AUTO_INCREMENT,
	idnum BIGINT,
	sidnum BIGINT,
	likeit BOOLEAN,
	tstamp TIMESTAMP,
	PRIMARY KEY(rpnum),
	FOREIGN KEY (idnum) REFERENCES Identity(idnum),
	FOREIGN KEY (sidnum) REFERENCES Story(sidnum)
);

CREATE TABLE Block (
	blknum BIGINT AUTO_INCREMENT,
	idnum BIGINT,
	blocked BIGINT,
	tstamp TIMESTAMP,
	PRIMARY KEY(blknum),
	FOREIGN KEY (idnum) REFERENCES Identity(idnum),
	FOREIGN KEY (blocked) REFERENCES Identity(idnum)
);

GRANT ALL ON SMPDB.* TO 'dast236'@'localhost' IDENTIFIED BY 'password';
GRANT ALL ON SMPDB.* TO 'dast236'@'%' IDENTIFIED BY 'password';

GRANT ALL ON SMPDB.* TO 'paul'@'localhost' IDENTIFIED BY 'jellydonuts!';              // local to your VM
GRANT ALL ON SMPDB.* TO 'paul'@'belgarath.cs.uky.edu' IDENTIFIED BY 'jellydonuts!';   // My workstation
GRANT ALL ON SMPDB.* TO 'paul'@'paul.cs.uky.edu' IDENTIFIED BY 'jellydonuts!';        // My VM

FLUSH PRIVILEGES;