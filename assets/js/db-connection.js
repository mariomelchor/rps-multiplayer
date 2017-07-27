// Initialize Firebase
var config = {
  apiKey: "AIzaSyA6qDa65LouXuzBTuROct-QxMapxLoM1qo",
  authDomain: "mm-firebase-348e4.firebaseapp.com",
  databaseURL: "https://mm-firebase-348e4.firebaseio.com",
  projectId: "mm-firebase-348e4",
  storageBucket: "mm-firebase-348e4.appspot.com",
  messagingSenderId: "1033865253590"
};

firebase.initializeApp(config);

// Assign the reference to the database to a variable named 'database'
var database = firebase.database();