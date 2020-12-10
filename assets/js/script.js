// gather main element
var mainEl = $("main");

// gather html search section elements
var liquorSearchEl = $("#liquor-search");
var proteinSearchEl = $("#protein-search");

// event handler when search form is clicked
var submitHandler = function(event) {
    // prevent from refreshing page
    event.preventDefault();
}

// add event handler to search section 
$("#search-form").on("submit", submitHandler);