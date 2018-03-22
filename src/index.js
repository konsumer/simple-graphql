/*
Simple-wrapper to pre-load the environment
*/

require('dotenv/config')
require('babel-register')
require('babel-polyfill')
require('./server')
