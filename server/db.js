const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '../community_tools.db');
const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

function run(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.run(sql, params, function callback(error) {
			if (error) {
				reject(error);
				return;
			}

			resolve({ lastID: this.lastID, changes: this.changes });
		});
	});
}

function get(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (error, row) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(row);
		});
	});
}

function all(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (error, rows) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(rows);
		});
	});
}

function exec(sql) {
	return new Promise((resolve, reject) => {
		db.exec(sql, error => {
			if (error) {
				reject(error);
				return;
			}

			resolve();
		});
	});
}

module.exports = { db, run, get, all, exec };
