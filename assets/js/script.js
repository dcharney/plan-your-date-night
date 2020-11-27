var liquorSearchEl = $("#liquor-search");
var proteinSearchEl = $("#protein-search");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");
var meals = [];


// push data from api to food array
var suggestMeal = function(data) {
    data.meals.forEach(element => {
        meals.push(element.strIngredient1);
    });
}

var fetchMealIngredientList = function() {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
    .then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                suggestMeal(data); // populate suggestions
            });
        } else {
            console.log("not feeling it...");
        }
    });
}

var fetchMealSearch = function(keyword) {
    fetch("https://www.themealdb.com/api/json/v1/1/filter.php?i=" + keyword)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                });
            } else {
                console.log("not feeling it...");
            }
        });
}
var submitHandler = function(event) {
    // prevent from refreshing page
    event.preventDefault()

    // switch to second input field if on first one
    if(circleIndicatorOneEl.hasClass("active") ) {
        // removing visibility from first input and circle indicator
        proteinSearchEl.removeClass("active");
        circleIndicatorOneEl.removeClass("active");

        // adding visibility to second input and circle indicator and focus on input
        proteinSearchEl.addClass("active");
        circleIndicatorTwoEl.addClass("active");
        proteinSearchEl.focus();

    } else { // user is on first field(meal input)
        // check if user added protein and liquor before sending data
        if(!proteinSearchEl.val() || proteinSearchEl.val() == " ") {
            console.log("no meal ingredient entered");
        } else {
            // fetch food function here
            fetchMealSearch(proteinSearchEl.val());
        }

        if(!liquorSearchEl.val() || liquorSearchEl.val() == " ") { // if not valid or just empty spaces
            console.log("no liquor entered");
        } else {
            fetchLiquorSearch(liquorSearchEl.val());
        }
        // scroll to results section after search
        scrollTo(0, $('#results-section').offset().top);
    }

}

// submit listener
$("#search-form").on("submit", submitHandler);

// auto complete meal search
fetchMealIngredientList();
proteinSearchEl.autocomplete({ 
    source: meals,
    appendTo: "#suggestions-wrapper",
    autoFocus: true
});