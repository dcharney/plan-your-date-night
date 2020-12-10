// gather elements
var mainEl = $("main");
var searchEl = $("#search-input");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");

// build arrays to store local data
suggestions = [];

searchTools = {
    meals:{
        listURL:"https://www.themealdb.com/api/json/v1/1/list.php?i=list",
        indexSearchURL:"https://www.themealdb.com/api/json/v1/1/filter.php?i=",
        targetContainer:"meals",
        targetElement:"strIngredient",
        searchTerm:""
    }, 
    drinks:{
        listURL:"https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list",
        indexSearchURL:"https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=",
        targetContainer:"drinks",
        targetElement:"strIngredient1",
        searchTerm:""
    }
};

// START AUTOCOMPLETE //
// FUNCTION to fetch list of options from api to populate array of suggestions for search feature
// IN: Array of values relevant to either meal or drink api
var prepAutocomplete = function(searchArr) {
    // unpack search array
    var searchURL = searchArr.listURL;
    var searchContainer = searchArr.targetContainer;
    var searchElement = searchArr.targetElement;

    // clear any existing suggestions
    suggestions = [];

    // fetch list of options from api url
    fetch(searchURL)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    data[searchContainer].forEach(element => {
                        suggestions.push(element[searchElement]);
                    });
                })
            } else {
                console.log("invalid api url");
            }
        });
    
    // assign suggestions to element
    searchEl.autocomplete({
        source: suggestions,
        appendTo: "#suggestions-wrapper",
        autoFocus: true
    });
}
// END AUTOCOMPLETE //

// START SEARCH FUNCTIONS
// event handler for search form
var submitHandler = function(event) {
    // prevent from refreshing page
    event.preventDefault();

    // check if current submission is valid
    if (!searchEl.val() || searchEl.val() == " ") {
        console.log("please enter a valid search term");
        return;
    }

    // if meal is being submitted, transition to drink search
    if (circleIndicatorOneEl.hasClass("active")) {
        // save current search term
        searchTools.meals.searchTerm = searchEl.val();

        // clear input and update placeholder
        searchEl.val("");
        searchEl.attr("placeholder","Search Liquor");

        // update suggestions array
        prepAutocomplete(searchTools.drinks);

        // update circle indication
        circleIndicatorOneEl.removeClass("active");
        circleIndicatorTwoEl.addClass("active");
        
    } else { 
        // save current search term
        searchTools.drinks.searchTerm = searchEl.val();
        // enable scrolling and scroll to results section
        mainEl.attr("overflow-y","scroll");
        mainEl[0].scrollTo(0, $('#results-section').offset().top);
        // populate results
        //fetchLiquorSearch(liquorSearchEl.val());
        generateResults();
    }
}
// END SEARCH FUNCTIONS

// START RESULTS FUNCTIONS
var generateResults = function() {
    var indexSearchURL = searchTools.drinks.indexSearchURL;
    // liquor
    fetch(indexSearchURL + keyword)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    // run drink results for searched liquor; function
                    drinkResults(data);
                });
            } else {
                console.log("the searched term did not respond valid data");
            }
        });
}
// step 1: fetch data from api
// step 2: build cells in results containers and append to element


// END RESULTS FUNCTIONS

// START UP FUNCTIONS
// assign search suggestions (autocomplete) to input elements
prepAutocomplete(searchTools.meals);
// END START UP FUNCTIONS


// EVENT HANDLERS START
// add event handler to search section 
$("#search-form").on("submit", submitHandler);

// EVENT HANDLERS END

