// gather main element
var mainEl = $("main");

// gather html search section elements
var proteinSearchEl = $("#protein-search");
var liquorSearchEl = $("#liquor-search");

// build arrays to store local data
suggestions = [];

searchTools = {
    meals:{
        listURL:"https://www.themealdb.com/api/json/v1/1/list.php?i=list",
        targetContainer:"meals",
        targetElement:"strIngredient"
    }, 
    drinks:{
        listURL:"https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list",
        targetContainer:"drinks",
        targetElement:"strIngredient1"
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
}
// END AUTOCOMPLETE //

// event handler when search form is submitted
var submitHandler = function(event) {
    // prevent from refreshing page
    event.preventDefault();
}

// assign search suggestions (autocomplete) to input elements
prepAutocomplete(searchTools.meals);
proteinSearchEl.autocomplete({
    source: suggestions,
    appendTo: "#suggestions-wrapper",
    autoFocus: true
});

liquorSearchEl.autocomplete({
    source: drinks,
    appendTo: "#suggestions-wrapper",
    autoFocus: true
});


// add event handler to search section 
$("#search-form").on("submit", submitHandler);