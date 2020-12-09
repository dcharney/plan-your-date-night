var liquorSearchEl = $("#liquor-search");
var proteinSearchEl = $("#protein-search");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");
var meals = [];
var mealResultsEl = $("#meal-results");
var mealsSavedEl = $("#meals-saved");
var drinks = [];

//recipe book data
var mealRecipeBookData = [];

//shopping list data
var mealShoppingData = [];


// push data from api to food array
var suggestMeal = function(data) {
    data.meals.forEach(element => {
        meals.push(element.strIngredient);
    });
}

//push data from api to drink array
var suggestLiquor = function(data) {
    data.drinks.forEach(element => {
        drinks.push(element.strIngredient1);
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

var fetchLiquorIngredientList = function() {
    fetch("https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list")
    .then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                suggestLiquor(data); // populate suggestions
            });
        } else {
            console.log("no good baby");
        }
    });
}

var fetchMealSearch = function(keyword) {
    fetch("https://www.themealdb.com/api/json/v1/1/filter.php?i=" + keyword)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    mealResults(data);
                });
            } else {
                console.log("not feeling it...");
            }
        });
}

var fetchLiquorSearch = function(keyword) {
    fetch("https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=" + keyword)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                });
            } else {
                console.log("no good baby");
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
        liquorSearchEl.addClass("active");
        circleIndicatorTwoEl.addClass("active");
        liquorSearchEl.focus();

    } else { // user is on second field(liquor input)
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

//push meal array into results container
var mealResults = function(data) {
        data.meals.forEach(element => {
        //wrapper for ind. meals
        var singleMealDiv = document.createElement("div");
        //bg img
        var mealImg = document.createElement("img");
        //wrapper for title
        var mealHeader = document.createElement("div");
        // title
        var mealTitle = document.createElement("h6");

        // add classes needed to elements
        $(singleMealDiv).addClass("cell large-4 result-cell");
        $(mealHeader).addClass("result-bg");
        $(mealTitle).addClass("result");
       

        // add data-img of meal
        $(mealImg).attr("src", element.strMealThumb);
        // add text data-title of meal
        $(mealTitle).text(element.strMeal);
        // set meal id to cell id
        $(singleMealDiv).attr("id", element.idMeal);

        
        // put h4 in h4 wrapper
        mealHeader.append(mealTitle);
        // put h4 and img in cell
        singleMealDiv.append(mealImg, mealHeader);
        // append cell to results element
        mealResultsEl.append(singleMealDiv);  
    });
}

// fetch clicked meal from results
var fetchMealInfo = function(idMeal) {
    // search by id
    fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + idMeal)
        .then(function(response) {
            console.log(response);
            if(response.ok) {
                response.json().then(function(data) {
                    openMealModal(data);
                });
            } else {
                console.log("no good baby");
            }  
        });
}

var openMealModal = function(data) {
    
    var dataInfo = data.meals[0];
    var mealId = dataInfo.idMeal;
    var mealName = dataInfo.strMeal;
    var instructions = dataInfo.strInstructions;
    var img = dataInfo.strMealThumb;
    var ingredients = [];
    var saveText = "";

    // Filtering through the objects to find ingredients and put their values in an array
    for(var i = 0; i < 15; i++) { // ingredients list goes to 15 max in api
        if(dataInfo["strIngredient"+i]){
            ingredients.push(" " + dataInfo["strIngredient"+i]);
        };
    }
    console.log(
        mealName,
        instructions,
        img,
        ingredients
    );

    // Find if the array already has recipe as object by comparing the property value then
    // if in recipe book, update to text to "remove from recipe book" else to "save to recipe"
    if(mealRecipeBookData.some(recipe => recipe.mealName === mealName)){
        saveText = "Remove From Recipe Book";
    } else {
        saveText = "Save To Recipe Book";
    }

    // update text and add meal id date in save btn
    $("#meal-save-btn")
        .text(saveText)
        .attr('data-mealId', mealId);

    // update meal name in modal
    $("#meal-name").text(mealName);
    // update meal details: add category, alchohol, glass, instructions, ingredients
    $("#meal-highlight-details").html(
        "<p>Instructions: "+ instructions + "</p>" +
        "<br>" +
        "<p id='meal-ingredients'>Ingredients: "+ ingredients + "</p>"
    );
    
    //update img
    $("#meal-highlight-img").html("<img src='" +img+"'/>");
    
    //open food modal
    var modal = new Foundation.Reveal($('#meal-modal'));
    modal.open();
}
    
var mealClicked = function(event) {
     // find meals container
    var meal = $(event.target).closest(".result-cell");
    // get id (unique meal id needed for api search)
    var idMeal = $(meal).attr("id");

    fetchMealInfo(idMeal);
}

//placeholder function for shopping list
var addMealShoppingList = function() {
    // find ingredients
    var ingredients = $("#meal-ingredients").text();

    
}

var populateMealRecipeBook = function(name, image, id, addRecipe) {
    // if adding to recipe book
    if(addRecipe === true) {
        // cell wrapper for individual drinks
        var cellDiv = document.createElement("div");
        // bg img in wrapper
        var img = document.createElement("img");
        // div wrapper for title/drink name
        var h6Div = document.createElement("div");
        // title/ drink name
        var h6 = document.createElement("h6");

        // add classes needed to elements
        $(cellDiv).addClass("cell large-4 result-cell");
        $(h6Div).addClass("result-bg");
        $(h6).addClass("result");
    
        // add data-img
        $(img).attr("src", image);
        // add text data-title of drink
        $(h6).text(name);
        // set drink id to cell id
        $(cellDiv).attr("id", id);
    
        // put h4 in h4 wrapper
        h6Div.append(h6);
        // put h4 and img in cell
        cellDiv.append(img, h6Div);
        // append cell to results element
        $("#meals-saved").append(cellDiv);
    }
    // else if removing from recipe book
    else { 
        // remove from saved recipe book section only
        $(mealsSavedEl).find("#"+id).remove();
    }
}

var populateMealShoppingList = function(name, ingredients, image) {

    // add text data-title of meal
    $("#meal-name-shopping").text("Ingredients: " + name);

    // make ul empty then fill with list elements
    $("#meal-ul-shopping").html("");
    // create list eleements
    ingredients.forEach(element => {
        var ingredient = document.createElement("li");
        $(ingredient).text(element);
        // put list items in UL
        $("#meal-ul-shopping").append(ingredient); 
    });

    // add data-img
    $("#meal-shopping-img").attr("src", image);
}

// save & remove recipe function
var saveMealRecipe = function(event) {
    // grab meal name
    var name = $(event.target).closest("#meal-modal").find("#meal-name").text();
    // grab image
    var image = $(event.target).closest("#meal-modal").find("img").attr('src');
    // grab meal unique id
    var id = $(event.target).attr("data-mealId");
    // add or remove var
    var addRecipe = true;

    // save to recipe book / local storage
    var recipeData = {mealName: name, mealImg: image, mealId: id};

    // Find if the array already has recipe as object by comparing the property value
    if(mealRecipeBookData.some(recipe => recipe.mealName === name)){
        // delete if already saved (clicked "remove from recipe book)") by
        // updating recipe book var to not include this recipe
        mealRecipeBookData = mealRecipeBookData.filter(recipe => recipe.mealName !== name);
        // update local storage to array
        localStorage.setItem('mealRecipeBookData', JSON.stringify(mealRecipeBookData));
        // remove from recipe book
        addRecipe = false;
        // update text of modal
        $("#meal-save-btn").text("Save To Recipe Book");

    } else { 
        // not a duplicate so save (clicked "save to recipe book")
        mealRecipeBookData.push(recipeData);
        // update local storage to array
        localStorage.setItem('mealRecipeBookData', JSON.stringify(mealRecipeBookData));
        // add to recipe book
        addRecipe = true;
        // update text of modal
        $("#meal-save-btn").text("Remove From Recipe Book");

    }

    // populate to recipe book right away 
    populateMealRecipeBook(name, image, id, addRecipe);

}

var saveMealShopList = function(event) {
    // grab meal name
    var name = $(event.target).closest("#meal-modal").find("#meal-name").text();
    // grab meal unique id
    var id = $(event.target).attr("data-mealId");
    // grab ingredients
    var ingredientsText = $(event.target).closest("#meal-modal").find("#meal-ingredients").text();
    // grab image
    var image = $(event.target).closest("#meal-modal").find("img").attr('src');
    // remove the ingredients text from string
    ingredientsText = ingredientsText.split(':').pop();
    // turn into array by separating from comma
    var ingredients = ingredientsText.split(',');

    // update shopping data
    var shoppingData = {mealName: name, mealIngredients: ingredients, mealImg: image};
    mealShoppingData.push(shoppingData);

    // update local storage to array
    localStorage.setItem('mealShoppingData', JSON.stringify(mealShoppingData));

    // update text of modal
    $("#meal-save-shop-list").text("Update Shopping List");

    // populate to shopping list right away 
    populateMealShoppingList(name, ingredients, image);

}

// load meal local storage data
var loadMealRecipeBook = function() {
    var localData = JSON.parse(localStorage.getItem("mealRecipeBookData"));
    // check if empty before loading
    if (localData) {
        // update array to local storage
        mealRecipeBookData = localData;
        // populate recipe book section with saved data
        mealRecipeBookData.forEach(element => {
            populateMealRecipeBook(element.mealName, element.mealImg, element.mealId, true);
        });
    } else {
        return
    }

}
var loadMealShoppingList = function() {
    var localData = JSON.parse(localStorage.getItem("mealShoppingData"));
    // check if empty before loading
    if (localData) {
        // update array to local storage
        mealShoppingData = localData;
        // populate recipe book section with saved data
        populateMealShoppingList(mealShoppingData[0].mealName, mealShoppingData[0].mealIngredients, mealShoppingData[0].mealImg);
    } else {
        return
    }

}
// load / populate meal section of recipe book when page loads
loadMealRecipeBook();
//load/populate shopping list for meals when page loads
loadMealShoppingList();
// submit listener
$("#search-form").on("submit", submitHandler);

// auto complete meal search
fetchMealIngredientList();
proteinSearchEl.autocomplete({ 
    source: meals,
    appendTo: "#suggestions-wrapper",
    autoFocus: true
});

// auto complete liquor search
fetchLiquorIngredientList();
liquorSearchEl.autocomplete({ 
    source: drinks,
    appendTo: "#suggestions-wrapper",
    autoFocus: true
});

// meal selected listener
$(mealResultsEl).on("click", mealClicked);
$(mealsSavedEl).on("click", mealClicked);
// save to recipe btn listener
$("#meal-save-btn").on("click", saveMealRecipe);
//save to shopping list
$("#meal-save-shop-list").on("click", saveMealShopList);